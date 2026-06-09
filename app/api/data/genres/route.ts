import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

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

export async function POST(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;
  
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

export async function PUT(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;
  
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

export async function DELETE(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;
  
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