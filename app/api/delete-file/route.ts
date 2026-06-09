import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const { fileUrl } = await req.json();
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl обязателен' }, { status: 400 });
    }

    const relativePath = fileUrl.replace(/^\/images\//, '');
    const filePath = path.join(process.cwd(), 'public/images', relativePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Файл удалён: ${filePath}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Ошибка удаления файла' }, { status: 500 });
  }
}