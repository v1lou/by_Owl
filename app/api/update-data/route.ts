import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { invalidateOwlCache } from '@/lib/streamerKnowledge';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST(req: Request) {
  const denied = await requireAdmin('config');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { file, data } = body;
    
    console.log('Сохраняем файл:', file);
    
    const filePath = path.join(process.cwd(), 'public/data', file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Сохранено!');
    
    invalidateOwlCache();
    console.log('Кэш Совы сброшен');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API is ready for POST requests' });
}

export const runtime = 'nodejs';