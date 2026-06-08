import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/checkAdmin';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const streams = await prisma.stream.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json({ success: true, data: streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json({ success: false, data: [], error: String(error) });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin('streams');
  if (denied) return denied;

  try {
    const body = await request.json();
    const stream = await prisma.stream.create({
      data: {
        id: body.id || undefined,
        title: body.title,
        game: body.game,
        date: new Date(body.date),
        link: body.link,
        isLive: body.isLive || false,
        isPast: body.isPast || true,
      },
    });
    return NextResponse.json({ success: true, data: stream });
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}