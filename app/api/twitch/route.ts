import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TWITCH_CHANNEL_ID = '47966045'; // ID канала by_owl
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.error('Missing Twitch credentials');
    return null;
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    const token = data.access_token;
    const expiresAt = Date.now() + data.expires_in * 1000;

    cachedToken = { token, expiresAt };
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

export async function GET() {
  try {
    const token = await getAccessToken();
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Twitch' },
        { status: 401 }
      );
    }

    if (!TWITCH_CLIENT_ID) {
      return NextResponse.json(
        { success: false, error: 'Missing Client ID' },
        { status: 500 }
      );
    }

    const scheduleSegments = [];

    // 1. Получаем ТЕКУЩИЙ LIVE стрим
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${TWITCH_CHANNEL_ID}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    let currentStream = null;
    
    if (streamResponse.ok) {
      const streamData = await streamResponse.json();
      currentStream = streamData.data?.[0];
      
      if (currentStream) {
        const streamId = `stream_${currentStream.id}`;
        
        // Сохраняем в БД (если ещё не сохранён)
        const existingStream = await prisma.stream.findUnique({
          where: { id: streamId }
        });
        
        if (!existingStream) {
          await prisma.stream.create({
            data: {
              id: streamId,
              title: currentStream.title,
              game: currentStream.game_name || '',
              date: new Date(currentStream.started_at),
              isLive: true,
              isPast: false,
            },
          });
          console.log(`🔴 НОВЫЙ СТРИМ СОХРАНЁН: ${currentStream.title}`);
        } else if (!existingStream.isLive) {
          // Обновляем статус, если стрим снова в онлайне
          await prisma.stream.update({
            where: { id: streamId },
            data: {
              isLive: true,
              isPast: false,
            },
          });
          console.log(`🟢 СТРИМ СНОВА В ОНЛАЙНЕ: ${currentStream.title}`);
        }
        
        scheduleSegments.push({
          id: streamId,
          title: currentStream.title,
          game_name: currentStream.game_name,
          start_time: currentStream.started_at,
          is_live: true,
          is_past: false,
          url: null,
        });
      }
    }

    // 2. Получаем ПРОШЛЫЕ стримы из БД (уже сохранённые)
    const pastStreams = await prisma.stream.findMany({
      where: {
        isPast: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50,
    });

    for (const stream of pastStreams) {
      scheduleSegments.push({
        id: stream.id,
        title: stream.title,
        game_name: stream.game,
        start_time: stream.date.toISOString(),
        is_live: false,
        is_past: true,
        url: stream.vodUrl || null,
      });
    }

    // 3. Получаем VOD из Twitch (для истории, но не как основной источник)
    const videosResponse = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${TWITCH_CHANNEL_ID}&type=archive&first=50`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      const videos = videosData.data || [];
      
      for (const video of videos) {
        const streamId = `vod_${video.id}`;
        const existsInDb = await prisma.stream.findUnique({
          where: { id: streamId }
        });
        
        if (!existsInDb) {
          // Сохраняем VOD как стрим (если его ещё нет)
          await prisma.stream.create({
            data: {
              id: streamId,
              title: video.title,
              game: video.game_name || '',
              date: new Date(video.created_at),
              hasVod: true,
              vodUrl: video.url,
              isPast: true,
              isLive: false,
            },
          });
          console.log(`📼 VOD сохранён как стрим: ${video.title}`);
        }
        
        // Добавляем VOD в ответ (даже если уже был в БД)
        scheduleSegments.push({
          id: streamId,
          title: video.title,
          game_name: video.game_name || '',
          start_time: video.created_at,
          is_live: false,
          is_past: true,
          has_vod: true,
          url: video.url,
        });
      }
    }

    // Сортируем по дате (новые сверху)
    scheduleSegments.sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );

    // Убираем дубликаты по id
    const uniqueSegments = Array.from(
      new Map(scheduleSegments.map(item => [item.id, item])).values()
    );

    return NextResponse.json({
      success: true,
      data: uniqueSegments,
      isLive: !!currentStream,
    });
    
  } catch (error) {
    console.error('Twitch API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stream data',
      },
      { status: 500 }
    );
  }
}