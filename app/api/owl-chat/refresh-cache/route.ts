// app/api/owl-chat/refresh-cache/route.ts
import { NextResponse } from 'next/server';
import { parseSiteContent } from '@/lib/siteParser';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST() {
  // ✅ Проверка прав администратора
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    // Сбрасываем кэш принудительно
    await parseSiteContent();
    return NextResponse.json({ ok: true, message: 'Кэш успешно обновлён' });
  } catch (error) {
    console.error('Refresh cache error:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении кэша' }, { status: 500 });
  }
}