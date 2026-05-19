import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowedAdmins = process.env.ALLOWED_ADMINS?.split(',') || [];
  return allowedAdmins.includes(session.user.email);
}

// GET — все жанры с их карточками
export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      include: { items: { orderBy: { createdAt: 'desc' } } },
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(genres);
  } catch (error) {
    console.error('GET genres error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}

// POST — создать жанр
export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }
    const genre = await prisma.genre.create({
      data: { 
        name: body.name, 
        coverUrl: body.coverUrl || null,
        order: body.order ?? 0 
      }
    });
    return NextResponse.json(genre);
  } catch (error) {
    console.error('POST genre error:', error);
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
  }
}

// PUT — редактировать жанр
export async function PUT(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID обязательно' }, { status: 400 });
    }
    const updated = await prisma.genre.update({
      where: { id: body.id },
      data: { 
        name: body.name,
        coverUrl: body.coverUrl
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT genre error:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE — удалить жанр
export async function DELETE(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID обязательно' }, { status: 400 });
    }
    await prisma.genre.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE genre error:', error);
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}