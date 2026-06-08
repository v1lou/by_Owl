import { NextResponse } from 'next/server';
import { parseSiteContent } from '@/lib/siteParser';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST() {
  const denied = await requireAdmin('config');
  if (denied) return denied;

  try {
    await parseSiteContent();
    return NextResponse.json({ ok: true, message: 'Кэш успешно обновлён' });
  } catch (error) {
    console.error('Refresh cache error:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении кэша' }, { status: 500 });
  }
}