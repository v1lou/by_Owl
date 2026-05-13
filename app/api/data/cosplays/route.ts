import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

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
    
    // Получаем старый косплей чтобы сравнить фото и удалить удалённые
    const oldCosplay = await prisma.cosplay.findUnique({
      where: { id: body.id }
    });
    
    const oldPhotos: string[] = oldCosplay?.photos ? JSON.parse(oldCosplay.photos) : [];
    const newPhotos: string[] = body.photos || [];
    
    // Находим фотографии которые были удалены
    const removedPhotos = oldPhotos.filter(photo => !newPhotos.includes(photo));
    
    // Удаляем удалённые фотографии с диска
    for (const photoUrl of removedPhotos) {
      try {
        const filePath = path.join(process.cwd(), 'public', photoUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Удалён файл: ${photoUrl}`);
        }
      } catch (e) {
        console.error('Ошибка удаления фото:', e);
      }
    }
    
    // Если изменилась иконка - удаляем старую
    if (oldCosplay?.characterImage && oldCosplay.characterImage !== body.characterImage) {
      try {
        const oldIconPath = path.join(process.cwd(), 'public', oldCosplay.characterImage);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
          console.log(`Удалена старая иконка: ${oldCosplay.characterImage}`);
        }
      } catch (e) {
        console.error('Ошибка удаления старой иконки:', e);
      }
    }
    
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

    // Сначала получаем косплей чтобы знать какие файлы удалять
    const cosplay = await prisma.cosplay.findUnique({
      where: { id: body.id }
    });

    if (cosplay) {
      // Удаляем фотографии с диска
      const photos: string[] = cosplay.photos ? JSON.parse(cosplay.photos) : [];
      for (const photoUrl of photos) {
        try {
          const filePath = path.join(process.cwd(), 'public', photoUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Удалён файл фото: ${photoUrl}`);
          }
        } catch (e) {
          console.error('Ошибка удаления фото:', e);
        }
      }

      // Удаляем иконку персонажа
      if (cosplay.characterImage) {
        try {
          const filePath = path.join(process.cwd(), 'public', cosplay.characterImage);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Удалена иконка: ${cosplay.characterImage}`);
          }
        } catch (e) {
          console.error('Ошибка удаления иконки:', e);
        }
      }
    }

    // Удаляем запись из БД
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