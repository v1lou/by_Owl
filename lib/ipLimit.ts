// lib/ipLimit.ts

// Хранилище в памяти (при перезапуске сервера сбросится)
// Для продакшена нужно заменить на Redis или БД
const ipStore = new Map<string, { count: number; date: string }>();

export interface IpLimitResult {
  allowed: boolean;
  rehomeing: number;
  limit: number;
}

/**
 * Проверяет лимит вопросов по IP-адресу
 * @param req - Request объект для получения IP
 * @param limit - максимальное количество вопросов в день (по умолчанию 7)
 */
export async function checkIpLimit(req: Request, limit: number = 7): Promise<IpLimitResult> {
  // Получаем реальный IP пользователя
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  const today = new Date().toDateString();
  const key = `${ip}_${today}`;
  
  let data = ipStore.get(key);
  
  // Если сегодня новый день или данных нет — сбрасываем счётчик
  if (!data || data.date !== today) {
    data = { count: 0, date: today };
  }
  
  const rehomeing = limit - data.count;
  
  if (rehomeing <= 0) {
    return { allowed: false, rehomeing: 0, limit };
  }
  
  // Увеличиваем счётчик
  data.count++;
  ipStore.set(key, data);
  
  return { allowed: true, rehomeing: rehomeing - 1, limit };
}

/**
 * Получает остаток вопросов для текущего IP (без увеличения счётчика)
 */
export async function getRehomeingQuestions(req: Request, limit: number = 7): Promise<number> {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const today = new Date().toDateString();
  const key = `${ip}_${today}`;
  
  const data = ipStore.get(key);
  if (!data || data.date !== today) {
    return limit;
  }
  
  return Math.max(0, limit - data.count);
}