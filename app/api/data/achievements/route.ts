import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = [
    ...(process.env.ALLOWED_ADMINS?.split(',') || []),
    ...(process.env.OWNER_EMAILS?.split(',') || []),
  ];
  return allowed.includes(session.user.email);
}

export async function GET() {
  const achievements = await prisma.achievement.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(
    achievements.map((a: any) => ({
      ...a,
      photos: a.photos ? JSON.parse(a.photos) : [],
    }))
  );
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await req.json();
  const last = await prisma.achievement.findFirst({ orderBy: { order: 'desc' } });
  const achievement = await prisma.achievement.create({
    data: {
      title: body.title,
      event: body.event || '',
      year: body.year || new Date().getFullYear(),
      description: body.description || '',
      photos: JSON.stringify(body.photos || []),
      link: body.link || null,
      order: (last?.order ?? -1) + 1,
    }
  });
  return NextResponse.json({ ...achievement, photos: JSON.parse(achievement.photos) });
}

export async function PUT(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await req.json();
  const old = await prisma.achievement.findUnique({ where: { id: body.id } });
  if (old) {
    const oldPhotos: string[] = old.photos ? JSON.parse(old.photos) : [];
    const removed = oldPhotos.filter((p: string) => !(body.photos || []).includes(p));
    for (const url of removed) {
      try {
        const fp = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch (e) {}
    }
  }
  const achievement = await prisma.achievement.update({
    where: { id: body.id },
    data: {
      title: body.title,
      event: body.event || '',
      year: body.year || new Date().getFullYear(),
      description: body.description || '',
      photos: JSON.stringify(body.photos || []),
      link: body.link || null,
    }
  });
  return NextResponse.json({ ...achievement, photos: JSON.parse(achievement.photos) });
}

export async function DELETE(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await req.json();
  const achievement = await prisma.achievement.findUnique({ where: { id: body.id } });
  if (achievement) {
    const photos: string[] = achievement.photos ? JSON.parse(achievement.photos) : [];
    for (const url of photos) {
      try {
        const fp = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch (e) {}
    }
  }
  await prisma.achievement.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}