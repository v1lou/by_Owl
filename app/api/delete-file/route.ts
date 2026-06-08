import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { requireAdmin } from '@/lib/checkAdmin';

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowedAdmins = process.env.ALLOWED_ADMINS?.split(',') || [];
  return allowedAdmins.includes(session.user.email);
}

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