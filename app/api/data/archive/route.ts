import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Проверка админа
async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  
  // Проверяем по ALLOWED_ADMINS из .env
  const allowedAdmins = process.env.ALLOWED_ADMINS?.split(',') || [];
  return allowedAdmins.includes(session.user.email);
}

// GET — получить все записи (доступно всем)
export async function GET() {
  try {
    const items = await prisma.watchArchive.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}

// POST — создать новую запись (только админ)
export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const body = await req.json();
    
    if (!body.title) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }
    
    const item = await prisma.watchArchive.create({
      data: {
        title: body.title,
        type: body.type || 'movie',
        date: body.date || '',
        link: body.link || '#'
      }
    });
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
  }
}

// PUT — редактировать запись (только админ)
export async function PUT(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID обязательно' }, { status: 400 });
    }
    
    const updated = await prisma.watchArchive.update({
      where: { id: body.id },
      data: {
        title: body.title,
        type: body.type,
        date: body.date,
        link: body.link
      }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE — удалить запись (только админ)
export async function DELETE(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID обязательно' }, { status: 400 });
    }
    
    await prisma.watchArchive.delete({
      where: { id: body.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}