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

export async function GET() {
  try {
    const cosplays = await prisma.cosplay.findMany({
      orderBy: { order: 'asc' }
    });
    
    const formattedCosplays = cosplays.map((cosplay: any) => ({
      ...cosplay,
      photos: cosplay.photos ? JSON.parse(cosplay.photos) : []
    }));
    
    return NextResponse.json(formattedCosplays);
  } catch (error) {
    console.error('GET error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    const lastCosplay = await prisma.cosplay.findFirst({
      orderBy: { order: 'desc' }
    });
    const newOrder = (lastCosplay?.order ?? -1) + 1;
    
    const photosJson = JSON.stringify(body.photos || []);
    
    const cosplay = await prisma.cosplay.create({
      data: {
        characterName: body.characterName,
        description: body.description || '',
        photos: photosJson,
        characterImage: body.characterImage || null,
        streamLink: body.streamLink || null,
        order: newOrder,
      }
    });
    
    return NextResponse.json({
      ...cosplay,
      photos: JSON.parse(cosplay.photos)
    });
  } catch (error) {
    console.error('POST error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка создания';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    const updateData: any = {
      characterName: body.characterName,
      description: body.description,
      characterImage: body.characterImage || null,
      streamLink: body.streamLink || null,
      order: body.order,
    };
    
    if (body.photos !== undefined) {
      updateData.photos = JSON.stringify(body.photos);
    }
    
    const cosplay = await prisma.cosplay.update({
      where: { id: body.id },
      data: updateData
    });
    
    return NextResponse.json({
      ...cosplay,
      photos: JSON.parse(cosplay.photos)
    });
  } catch (error) {
    console.error('PUT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    await prisma.cosplay.delete({
      where: { id: body.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка удаления';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}