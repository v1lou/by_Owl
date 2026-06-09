import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';
import fs from 'fs';
import path from 'path';

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
  const err = await requireAdmin('cosplay');
  if (err) return err;

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
        coverPhoto: body.coverPhoto || null,
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
  const err = await requireAdmin('cosplay');
  if (err) return err;

  try {
    const body = await req.json();
    
    const oldCosplay = await prisma.cosplay.findUnique({
      where: { id: body.id }
    });
    
    const oldPhotos: string[] = oldCosplay?.photos ? JSON.parse(oldCosplay.photos) : [];
    const newPhotos: string[] = body.photos || [];
    
    const removedPhotos = oldPhotos.filter(photo => !newPhotos.includes(photo));
    
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
    
    if (oldCosplay?.coverPhoto && oldCosplay.coverPhoto !== body.coverPhoto) {
      const isStillUsed = newPhotos.includes(oldCosplay.coverPhoto);
      if (!isStillUsed) {
        try {
          const oldCoverPath = path.join(process.cwd(), 'public', oldCosplay.coverPhoto);
          if (fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
            console.log(`Удалена старая обложка: ${oldCosplay.coverPhoto}`);
          }
        } catch (e) {
          console.error('Ошибка удаления старой обложки:', e);
        }
      }
    }
    
    const updateData: any = {
      characterName: body.characterName,
      description: body.description,
      characterImage: body.characterImage || null,
      streamLink: body.streamLink || null,
      coverPhoto: body.coverPhoto || null,
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
  const err = await requireAdmin('cosplay');
  if (err) return err;

  try {
    const body = await req.json();

    const cosplay = await prisma.cosplay.findUnique({
      where: { id: body.id }
    });

    if (cosplay) {
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

      if (cosplay.coverPhoto) {
        const isInPhotos = photos.includes(cosplay.coverPhoto);
        if (!isInPhotos) {
          try {
            const coverPath = path.join(process.cwd(), 'public', cosplay.coverPhoto);
            if (fs.existsSync(coverPath)) {
              fs.unlinkSync(coverPath);
              console.log(`Удалена обложка: ${cosplay.coverPhoto}`);
            }
          } catch (e) {
            console.error('Ошибка удаления обложки:', e);
          }
        }
      }
    }

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