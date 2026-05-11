import { prisma } from './prisma';

let cached: string | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 минут

async function getConfig(key: string) {
  const row = await prisma.siteConfig.findUnique({ where: { key } });
  return row ? JSON.parse(row.value) : null;
}

export async function buildOwlKnowledge(): Promise<string> {
  if (cached && Date.now() - cacheTime < CACHE_TTL) return cached;

  const [cosplays, products, achievements, streams, archiveItems] = await Promise.all([
    prisma.cosplay.findMany({ orderBy: { order: 'asc' } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.achievement.findMany({ orderBy: { year: 'desc' } }),
    prisma.stream.findMany({ orderBy: { date: 'desc' }, take: 10 }),
    prisma.watchArchive.findMany({ orderBy: { id: 'desc' } }),
  ]);

  const [socials, pcConfig, bio] = await Promise.all([
    getConfig('socials'),
    getConfig('pc_config'),
    getConfig('bio'),
  ]);

  // Архив по типам
  const movies = archiveItems.filter(x => x.type === 'movie');
  const anime = archiveItems.filter(x => x.type === 'anime');
  const series = archiveItems.filter(x => x.type === 'series');

  const knowledge = `
# БАЗА ЗНАНИЙ СТРИМЕРА BY_OWL

## БИОГРАФИЯ
Ник: by_owl
Возраст: ${bio?.age ?? '?'} лет
${bio?.description ?? ''}

## КОСПЛЕИ (всего: ${cosplays.length})
${cosplays.map(c => `- ${c.characterName}: ${c.description}`).join('\n')}
Смотреть: /#cosplay

## МЕРЧ (${products.length} товара)
${products.map(p => `- ${p.name} — ${p.price}. ${p.description}`).join('\n')}
Купить: /#merch

## ДОСТИЖЕНИЯ (${achievements.length})
${achievements.map(a => `- ${a.year}: ${a.title} (${a.event}). ${a.description}`).join('\n')}
Подробнее: /#achievements

## СТРИМЫ (последние)
${streams.slice(0, 5).map(s => `- ${s.title} (${s.game}) — ${s.date.toISOString().slice(0, 10)}${s.isLive ? ' [СЕЙЧАС LIVE]' : ''}`).join('\n')}

## АРХИВ ПРОСМОТРОВ
Всего просмотрено: ${archiveItems.length} позиций
Фильмов: ${movies.length}
Аниме: ${anime.length}
Сериалов: ${series.length}
Последние 5: ${archiveItems.slice(0, 5).map(x => x.title).join(', ')}
Смотреть архив: /#archive

## СОЦСЕТИ
${socials?.homeLinks?.map((l: any) => `- ${l.name}: ${l.url}`).join('\n') ?? ''}
Телеграм-каналы:
${socials?.telegramInfo?.map((l: any) => `- ${l.name}: ${l.url}`).join('\n') ?? ''}
Все ссылки: /#socials

## ПК КОНФИГУРАЦИЯ
Процессор: ${pcConfig?.components?.cpu?.name} — ${pcConfig?.components?.cpu?.description}
Видеокарта: ${pcConfig?.components?.gpu?.name} — ${pcConfig?.components?.gpu?.description}
RAM: ${pcConfig?.components?.ram?.name}
SSD: ${pcConfig?.components?.ssd?.name}
Микрофон: ${pcConfig?.audio?.microphone?.name}
Камера: ${pcConfig?.audio?.camera?.name}
Наушники: ${pcConfig?.peripherals?.headphones_over?.name}
Мышь: ${pcConfig?.peripherals?.mouse?.name}
Клавиатура: ${pcConfig?.peripherals?.keyboard?.name}
Мониторы: ${pcConfig?.peripherals?.monitors?.map((m: any) => m.name).join(', ')}
Подробнее: /#pc-config

## НАВИГАЦИЯ
- Главная: /
- Профиль: /profile
- Косплеи: /#cosplay
- Мерч: /#merch
- Соцсети: /#socials
- ПК конфиг: /#pc-config
- Архив: /#archive
- Достижения: /#achievements
`.trim();

  cached = knowledge;
  cacheTime = Date.now();
  return knowledge;
}

// Сброс кэша — вызывай после любого редактирования в админке
export function invalidateOwlCache() {
  cached = null;
  cacheTime = 0;
}