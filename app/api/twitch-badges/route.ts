import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_USERNAME = process.env.TWITCH_USERNAME || 'by_owl';

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
    
    if (!token || !TWITCH_CLIENT_ID) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Twitch' },
        { status: 401 }
      );
    }

    const headers = {
      'Client-Id': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    };

    // Получаем ID стримера по логину
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`,
      { headers }
    );
    const userData = await userRes.json();
    const broadcasterId = userData.data?.[0]?.id;

    if (!broadcasterId) {
      return NextResponse.json(
        { success: false, error: 'Broadcaster not found' },
        { status: 404 }
      );
    }

    // Получаем значки и эмоуты параллельно
    const [badgesRes, emotesRes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${broadcasterId}`, { headers }),
      fetch(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${broadcasterId}`, { headers }),
    ]);

    const badgesData = await badgesRes.json();
    const emotesData = await emotesRes.json();

    // Возвращаем ответ с кешированием
    return NextResponse.json(
      {
        success: true,
        badges: badgesData.data || [],
        emotes: emotesData.data || [],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Twitch badges API error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}