import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/checkAdmin';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
  const err = await requireAdmin('suggestions');
  if (err) return err;

    const suggestions = await prisma.movieSuggestion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('GET movie-suggestions error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const suggestion = await prisma.movieSuggestion.create({
      data: {
        title: title.trim().slice(0, 200),
        isFavorite: false,
      },
    });

    return NextResponse.json({ success: true, data: suggestion });
  } catch (error) {
    console.error('POST movie-suggestions error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const err = await requireAdmin('suggestions');
    if (err) return err;

    const body = await req.json();
    const { id, isFavorite, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.movieSuggestion.update({
      where: { id },
      data: {
        ...(isFavorite !== undefined && { isFavorite }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH movie-suggestions error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const err = await requireAdmin('suggestions');
    if (err) return err;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await prisma.movieSuggestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE movie-suggestions error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}