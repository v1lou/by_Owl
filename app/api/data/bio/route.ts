import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const achievements = await prisma.achievement.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({
    achievements: achievements.map((a: any) => ({
      ...a,
      photos: JSON.parse(a.photos),
    }))
  });
}