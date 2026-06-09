import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  

  if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  
if (pathname === '/api/data/cosplays') {
  return NextResponse.next();
}

if (pathname === '/api/data/cosplays/reorder') {
  return NextResponse.next();
}

if (pathname === '/api/data/achievements') 
  return NextResponse.next();

if (pathname === '/api/data/achievements/reorder') {
  return NextResponse.next();
}

  if (pathname === '/api/data/archive') {
    return NextResponse.next();
  }

  if (pathname === '/api/data/socials') {
    return NextResponse.next();
  }
  
  if (pathname === '/api/data/favorites') {
    return NextResponse.next();
  }
  
if (pathname === '/api/data/genres/reorder') {
  return NextResponse.next();
}

  if (pathname === '/api/data/favorites/reorder') {
    return NextResponse.next();
  }

  // ✅ ДОБАВЛЯЕМ API ДЛЯ ЖАНРОВ
  if (pathname === '/api/data/genres') {
    return NextResponse.next();
  }
  
  if (pathname === '/api/data/genres/items') {
    return NextResponse.next();
  }
  
  // ✅ ДОБАВЛЯЕМ ВСЕ ВЛОЖЕННЫЕ РОУТЫ ДЛЯ GENRES
  if (pathname.startsWith('/api/data/genres')) {
    return NextResponse.next();
  }

  // ✅ ПРОПУСКАЕМ СТРАНИЦУ ВКЛЮЧЕНИЯ РЕЖИМА РЕДАКТИРОВАНИЯ
  if (pathname === '/admin/full-edit') {
    return NextResponse.next();
  }

  // ✅ НОВЫЙ РОУТ ДЛЯ PC CONFIG
  if (pathname === '/api/data/pc-config') {
    return NextResponse.next();
  }
  
  // ✅ Пропускаем API для сохранения данных
  if (pathname === '/api/update-data') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ СОВЫ
  if (pathname === '/api/owl-chat') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ ПРОВЕРКИ СТАТУСА АДМИНА
  if (pathname === '/api/owl-chat/admin-status') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ SSE ДЛЯ УВЕДОМЛЕНИЙ
  if (pathname === '/api/stream-events') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ ОПРОСА TWITCH
  if (pathname === '/api/twitch-poll') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ TWITCH КАЛЕНДАРЯ
  if (pathname === '/api/twitch') {
    return NextResponse.next();
  }
  
  // ✅ НОВЫЙ РОУТ ДЛЯ TWITCH STATS
  if (pathname === '/api/twitch/stats') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ ПРЕДЛОЖКИ ФИЛЬМОВ (публичный POST)
  if (pathname === '/api/movie-suggestions') {
    return NextResponse.next();
  }

  // ✅ ПРОПУСКАЕМ СТРАНИЦУ ПРЕДЛОЖКИ В АДМИНКЕ
  if (pathname === '/admin/movie-suggestions') {
    return NextResponse.next();
  }

  // ✅ ПРОПУСКАЕМ API ДЛЯ ОБРАТНОЙ СВЯЗИ
  if (pathname === '/api/feedback') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ ОТМЕТКИ ПРОЧИТАННОГО
  if (pathname === '/api/feedback/read') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ УДАЛЕНИЯ
  if (pathname === '/api/feedback/delete') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ КОРЗИНЫ
  if (pathname === '/api/feedback/trash') {
    return NextResponse.next();
  }
  
  if (pathname === '/api/feedback/restore') {
    return NextResponse.next();
  }
  
  if (pathname === '/api/feedback/empty-trash') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ СТРАНИЦУ АНАЛИТИКИ
  if (pathname === '/admin/analytics') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ СТРАНИЦУ ОБРАТНОЙ СВЯЗИ В АДМИНКЕ
  if (pathname === '/admin/feedback') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ СТРАНИЦУ КОРЗИНЫ В АДМИНКЕ
  if (pathname === '/admin/feedback/trash') {
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ API ДЛЯ ЗНАЧКОВ TWITCH
  if (pathname === '/api/twitch-badges') {
    return NextResponse.next();
  }
  
  if (pathname === '/api/visitor') return NextResponse.next();
  if (pathname === '/api/admin/check') return NextResponse.next();
  if (pathname === '/api/analytics') return NextResponse.next();
  if (pathname === '/api/upload') return NextResponse.next();

  // ✅ НОВЫЙ РОУТ ДЛЯ АРХИВА (WATCH ARCHIVE)
  if (pathname === '/api/archive') {
    return NextResponse.next();
  }
  
  // ✅ НОВАЯ СТРАНИЦА АРХИВА В АДМИНКЕ
  if (pathname === '/admin/archive') {
    return NextResponse.next();
  }

  // Пропускаем саму страницу входа
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  if (pathname === '/admin/users') return NextResponse.next();
  if (pathname === '/api/admin/users') return NextResponse.next();

  // Для остальных API и страниц админки — проверяем сессию
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin')) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};