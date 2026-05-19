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

// POST — добавить карточку
export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.genreId || !body.title || !body.streamLink) {
      return NextResponse.json({ error: 'genreId, title и streamLink обязательны' }, { status: 400 });
    }
    const item = await prisma.genreItem.create({
      data: {
        genreId: body.genreId,
        title: body.title,
        type: body.type || 'movie',
        streamLink: body.streamLink,
        description: body.description || null,
        posterUrl: body.posterUrl || null,
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
  }
}

// PUT — редактировать карточку
export async function PUT(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }
    const updated = await prisma.genreItem.update({
      where: { id: body.id },
      data: {
        title: body.title,
        type: body.type,
        streamLink: body.streamLink,
        description: body.description,
        posterUrl: body.posterUrl,
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE — удалить карточку
export async function DELETE(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }
    await prisma.genreItem.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}