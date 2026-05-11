import { NextResponse } from 'next/server';

const TWITCH_CHANNEL_ID = '47966045';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedFollowers: { value: number | null; time: number } | null = null;
let cachedStreamData: { data: any; time: number } | null = null;

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
  const now = Date.now();
  
  // Зрители и isLive — кэш 60 секунд
  const streamDataFresh = cachedStreamData && (now - cachedStreamData.time < 60 * 1000);
  // Фолловеры — кэш 5 минут
  const followersFresh = cachedFollowers && (now - cachedFollowers.time < 5 * 60 * 1000);

  // Если оба кэша свежие — отдаём сразу
  if (streamDataFresh && followersFresh && cachedStreamData) {
    return NextResponse.json({
      success: true,
      data: {
        followers: cachedFollowers?.value ?? null,
        ...cachedStreamData.data,
      },
    });
  }

  try {
    const token = await getAccessToken();
    
    if (!token || !TWITCH_CLIENT_ID) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Twitch' },
        { status: 401 }
      );
    }

    let followers = cachedFollowers?.value ?? null;
    let isLive = false;
    let gameName = '';
    let title = '';
    let viewerCount = 0;

    // Фолловеры — только если кэш устарел
    if (!followersFresh) {
      const followsResponse = await fetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${TWITCH_CHANNEL_ID}`,
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (followsResponse.ok) {
        const followsData = await followsResponse.json();
        followers = followsData.total || null;
        cachedFollowers = { value: followers, time: now };
      }
    }

    // Стрим — всегда свежий (кэш 60 секунд)
    if (!streamDataFresh) {
      const streamResponse = await fetch(
        `https://api.twitch.tv/helix/streams?user_id=${TWITCH_CHANNEL_ID}`,
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (streamResponse.ok) {
        const streamData = await streamResponse.json();
        const stream = streamData.data?.[0];
        isLive = !!stream;
        gameName = stream?.game_name || '';
        title = stream?.title || '';
        viewerCount = stream?.viewer_count || 0;
      }

      cachedStreamData = {
        data: { isLive, gameName, title, viewerCount },
        time: now,
      };
    } else if (cachedStreamData) {
      // Берём из кэша
      isLive = cachedStreamData.data.isLive;
      gameName = cachedStreamData.data.gameName;
      title = cachedStreamData.data.title;
      viewerCount = cachedStreamData.data.viewerCount;
    }

    const responseData = {
      success: true,
      data: {
        followers,
        isLive,
        gameName,
        title,
        viewerCount,
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Twitch stats API error:', error);
    
    // При ошибке отдаём кэш если есть
    if (cachedStreamData) {
      return NextResponse.json({
        success: true,
        data: {
          followers: cachedFollowers?.value ?? null,
          ...cachedStreamData.data,
        },
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Twitch stats' },
      { status: 500 }
    );
  }
}