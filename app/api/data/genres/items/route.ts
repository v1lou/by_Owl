import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;
  
  try {
    const body = await req.json();
    if (!body.genreId || !body.title || !body.streamLink) {
      return NextResponse.json({ error: 'genreId, title и streamLink обязательны' }, { status: 400 });
    }
    
    const lastItem = await prisma.genreItem.findFirst({
      where: { genreId: body.genreId },
      orderBy: { order: 'desc' }
    });
    
    const item = await prisma.genreItem.create({
      data: {
        genreId: body.genreId,
        title: body.title,
        type: body.type || 'movie',
        streamLink: body.streamLink,
        description: body.description || null,
        posterUrl: body.posterUrl || null,
        order: (lastItem?.order ?? -1) + 1
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;
  
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

export async function DELETE(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;
  
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