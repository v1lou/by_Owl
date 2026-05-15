import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowedAdmins = process.env.ALLOWED_ADMINS?.split(',') || [];
  return allowedAdmins.includes(session.user.email);
}

export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { type, ids, genreId } = body;

    if (type === 'genres') {
      for (let i = 0; i < ids.length; i++) {
        await prisma.favoriteGenre.update({
          where: { id: ids[i] },
          data: { order: i }
        });
      }
    } else if (type === 'movies' && genreId) {
      for (let i = 0; i < ids.length; i++) {
        await prisma.favoriteMovie.update({
          where: { id: ids[i] },
          data: { order: i }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Ошибка изменения порядка' }, { status: 500 });
  }
}