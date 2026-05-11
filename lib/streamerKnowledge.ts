import { prisma } from './prisma';

// Определим типы для данных, чтобы избежать ошибок TypeScript
interface SocialLink {
  name: string;
  url: string;
}

interface SocialsConfig {
  homeLinks?: SocialLink[];
  telegramInfo?: SocialLink[];
}

interface PcComponent {
  name: string;
  description?: string;
}

interface PcConfig {
  components?: {
    cpu?: PcComponent;
    gpu?: PcComponent;
    ram?: PcComponent;
    ssd?: PcComponent;
  };
  audio?: {
    microphone?: PcComponent;
    camera?: PcComponent;
  };
  peripherals?: {
    headphones_over?: PcComponent;
    mouse?: PcComponent;
    keyboard?: PcComponent;
    monitors?: PcComponent[];
  };
}

interface BioConfig {
  age?: number;
  description?: string;
}

interface CosplayItem {
  characterName: string;
  description: string | null;
}

interface ProductItem {
  name: string;
  price: string;
  description: string | null;
}

interface AchievementItem {
  year: number;
  title: string;
  event: string;
  description: string | null;
}

interface StreamItem {
  title: string;
  game: string;
  date: Date;
  isLive: boolean;
}

interface ArchiveItem {
  title: string;
  type: string;
}

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

  // Архив по типам — ДОБАВЛЕНЫ ТИПЫ ДЛЯ ПАРАМЕТРА x
  const movies = archiveItems.filter((x: any) => x.type === 'movie');
  const anime = archiveItems.filter((x: any) => x.type === 'anime');
  const series = archiveItems.filter((x: any) => x.type === 'series');

  const knowledge = `
# БАЗА ЗНАНИЙ СТРИМЕРА BY_OWL

## БИОГРАФИЯ
Ник: by_owl
Возраст: ${(bio as BioConfig)?.age ?? '?'} лет
${(bio as BioConfig)?.description ?? ''}

## КОСПЛЕИ (всего: ${cosplays.length})
${(cosplays as CosplayItem[]).map((c: CosplayItem) => `- ${c.characterName}: ${c.description}`).join('\n')}
Смотреть: /#cosplay

## МЕРЧ (${products.length} товара)
${(products as ProductItem[]).map((p: ProductItem) => `- ${p.name} — ${p.price}. ${p.description}`).join('\n')}
Купить: /#merch

## ДОСТИЖЕНИЯ (${achievements.length})
${(achievements as AchievementItem[]).map((a: AchievementItem) => `- ${a.year}: ${a.title} (${a.event}). ${a.description}`).join('\n')}
Подробнее: /#achievements

## СТРИМЫ (последние)
${(streams as StreamItem[]).slice(0, 5).map((s: StreamItem) => `- ${s.title} (${s.game}) — ${s.date.toISOString().slice(0, 10)}${s.isLive ? ' [СЕЙЧАС LIVE]' : ''}`).join('\n')}

## АРХИВ ПРОСМОТРОВ
Всего просмотрено: ${archiveItems.length} позиций
Фильмов: ${movies.length}
Аниме: ${anime.length}
Сериалов: ${series.length}
Последние 5: ${(archiveItems as ArchiveItem[]).slice(0, 5).map((x: ArchiveItem) => x.title).join(', ')}
Смотреть архив: /#archive

## СОЦСЕТИ
${(socials as SocialsConfig)?.homeLinks?.map((l: SocialLink) => `- ${l.name}: ${l.url}`).join('\n') ?? ''}
Телеграм-каналы:
${(socials as SocialsConfig)?.telegramInfo?.map((l: SocialLink) => `- ${l.name}: ${l.url}`).join('\n') ?? ''}
Все ссылки: /#socials

## ПК КОНФИГУРАЦИЯ
Процессор: ${(pcConfig as PcConfig)?.components?.cpu?.name} — ${(pcConfig as PcConfig)?.components?.cpu?.description}
Видеокарта: ${(pcConfig as PcConfig)?.components?.gpu?.name} — ${(pcConfig as PcConfig)?.components?.gpu?.description}
RAM: ${(pcConfig as PcConfig)?.components?.ram?.name}
SSD: ${(pcConfig as PcConfig)?.components?.ssd?.name}
Микрофон: ${(pcConfig as PcConfig)?.audio?.microphone?.name}
Камера: ${(pcConfig as PcConfig)?.audio?.camera?.name}
Наушники: ${(pcConfig as PcConfig)?.peripherals?.headphones_over?.name}
Мышь: ${(pcConfig as PcConfig)?.peripherals?.mouse?.name}
Клавиатура: ${(pcConfig as PcConfig)?.peripherals?.keyboard?.name}
Мониторы: ${(pcConfig as PcConfig)?.peripherals?.monitors?.map((m: PcComponent) => m.name).join(', ')}
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