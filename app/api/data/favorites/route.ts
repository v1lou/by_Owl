import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

// ========== ЖАНРЫ ==========
// GET — получить все жанры и фильмы (доступно всем)
export async function GET() {
  try {
    const genres = await prisma.favoriteGenre.findMany({
      include: {
        movies: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(genres);
  } catch (error) {
    console.error('GET favorites error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}

// POST — создать жанр или фильм (только админ с правом suggestions)
export async function POST(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;

  try {
    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'genre') {
      const lastGenre = await prisma.favoriteGenre.findFirst({
        orderBy: { order: 'desc' }
      });
      const genre = await prisma.favoriteGenre.create({
        data: {
          name: data.name,
          description: data.description || '',
          coverImage: data.coverImage || null,
          order: (lastGenre?.order ?? -1) + 1
        }
      });
      return NextResponse.json(genre);
    }

    if (type === 'movie') {
      const lastMovie = await prisma.favoriteMovie.findFirst({
        where: { genreId: data.genreId },
        orderBy: { order: 'desc' }
      });
      const movie = await prisma.favoriteMovie.create({
        data: {
          title: data.title,
          link: data.link || null,
          description: data.description || '',
          genreId: data.genreId,
          order: (lastMovie?.order ?? -1) + 1
        }
      });
      return NextResponse.json(movie);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
  }
}

// PUT — обновить жанр или фильм (только админ с правом suggestions)
export async function PUT(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;

  try {
    const body = await req.json();
    const { type, id, ...data } = body;

    if (type === 'genre') {
      const genre = await prisma.favoriteGenre.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          coverImage: data.coverImage,
          order: data.order
        }
      });
      return NextResponse.json(genre);
    }

    if (type === 'movie') {
      const movie = await prisma.favoriteMovie.update({
        where: { id },
        data: {
          title: data.title,
          link: data.link,
          description: data.description,
          order: data.order
        }
      });
      return NextResponse.json(movie);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE — удалить жанр или фильм (только админ с правом suggestions)
export async function DELETE(req: Request) {
  const err = await requireAdmin('suggestions');
  if (err) return err;

  try {
    const body = await req.json();
    const { type, id } = body;

    if (type === 'genre') {
      await prisma.favoriteGenre.delete({ where: { id } });
    } else if (type === 'movie') {
      await prisma.favoriteMovie.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}