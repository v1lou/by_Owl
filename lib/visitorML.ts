// Типы фич
export interface VisitorFeatures {
  visits: number;
  avgGapHours: number;        // среднее время между визитами
  gapVariance: number;        // насколько регулярен
  daylightOwl: number;           // 0-1, насколько заходит ночью
  clickRatio: number;         // клики/визиты
  topInterest: string;        // самая кликаемая категория
  sectionBreadth: number;     // сколько разных секций посетил (0-1)
  returnRate: number;         // вернулся ли вообще (0 или 1)
}

export interface Persona {
  id: string;
  label: string;
  description: string;
}

// Прототипы персон — это "центроиды кластеров" в нашем пространстве фич
// Байесовский naive classifier: P(persona | features) ∝ P(features | persona) * P(persona)
const PERSONA_PROTOTYPES: Record<string, Partial<VisitorFeatures>> = {
  ghost: {
    visits: 1, avgGapHours: 9999, clickRatio: 0.2,
    sectionBreadth: 0.2, returnRate: 0
  },
  lurker: {
    visits: 4, avgGapHours: 168, clickRatio: 0.5,
    sectionBreadth: 0.3, returnRate: 1, daylightOwl: 0.6
  },
  explorer: {
    visits: 3, avgGapHours: 72, clickRatio: 2,
    sectionBreadth: 0.8, returnRate: 1
  },
  regular: {
    visits: 8, avgGapHours: 48, gapVariance: 0.3,
    clickRatio: 1.5, sectionBreadth: 0.6, returnRate: 1
  },
  addict: {
    visits: 20, avgGapHours: 12, gapVariance: 0.1,
    clickRatio: 3, sectionBreadth: 0.9, returnRate: 1, daylightOwl: 0.4
  },
  daylight_hunter: {
    visits: 5, avgGapHours: 48, daylightOwl: 0.9,
    clickRatio: 1, sectionBreadth: 0.5, returnRate: 1
  },
  merchant: {
    topInterest: 'merch', clickRatio: 2,
    visits: 3, returnRate: 1
  },
  community_seeker: {
    topInterest: 'discord-join', sectionBreadth: 0.7,
    visits: 4, returnRate: 1
  },
};

// Евклидово расстояние в нормализованном пространстве фич
function distance(features: VisitorFeatures, prototype: Partial<VisitorFeatures>): number {
  const weights: Partial<Record<keyof VisitorFeatures, number>> = {
    visits: 0.15,
    avgGapHours: 0.2,
    gapVariance: 0.1,
    daylightOwl: 0.15,
    clickRatio: 0.2,
    sectionBreadth: 0.15,
    returnRate: 0.3,
  };

  // Нормализация значений
  const normalize = (key: keyof VisitorFeatures, val: number): number => {
    const maxValues: Partial<Record<keyof VisitorFeatures, number>> = {
      visits: 50, avgGapHours: 336, gapVariance: 1,
      daylightOwl: 1, clickRatio: 10, sectionBreadth: 1, returnRate: 1,
    };
    return val / (maxValues[key] || 1);
  };

  let dist = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const k = key as keyof VisitorFeatures;
    const protoVal = prototype[k];
    if (protoVal === undefined) continue;

    const featureVal = features[k] as number;
    const normProto = normalize(k, protoVal as number);
    const normFeature = normalize(k, featureVal);
    dist += weight! * Math.pow(normProto - normFeature, 2);
    totalWeight += weight!;
  }

  // Штраф за несовпадение topInterest
  if (prototype.topInterest && features.topInterest !== prototype.topInterest) {
    dist += 0.2;
  }

  return Math.sqrt(dist / totalWeight);
}

// Классификация — выбираем ближайший прототип (1-NN)
export function classifyPersona(features: VisitorFeatures): string {
  let bestPersona = 'explorer';
  let bestDist = Infinity;

  for (const [persona, prototype] of Object.entries(PERSONA_PROTOTYPES)) {
    const dist = distance(features, prototype);
    if (dist < bestDist) {
      bestDist = dist;
      bestPersona = persona;
    }
  }

  return bestPersona;
}

// Извлечение фич из сырых данных
export function extractFeatures(
  visits: number,
  clicks: Record<string, number>,
  sections: Record<string, number>,
  visitGaps: number[],
  hourPattern: Record<string, number>,
): VisitorFeatures {
  // Среднее время между визитами
  const avgGapHours = visitGaps.length > 0
    ? visitGaps.reduce((a, b) => a + b, 0) / visitGaps.length
    : 9999;

  // Дисперсия промежутков (насколько регулярен)
  const gapVariance = visitGaps.length > 1
    ? Math.sqrt(
        visitGaps.reduce((acc, g) => acc + Math.pow(g - avgGapHours, 2), 0) / visitGaps.length
      ) / (avgGapHours || 1)
    : 1;

  // Ночная активность (22:00 - 04:00)
  const daylightHours = ['22', '23', '0', '1', '2', '3', '4'];
  const totalHourVisits = Object.values(hourPattern).reduce((a, b) => a + b, 0);
  const daylightVisits = daylightHours.reduce((acc, h) => acc + (hourPattern[h] || 0), 0);
  const daylightOwl = totalHourVisits > 0 ? daylightVisits / totalHourVisits : 0;

  // Клики на визит
  const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);
  const clickRatio = visits > 0 ? totalClicks / visits : 0;

  // Топ интерес
  const topInterest = Object.entries(clicks).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  // Разнообразие секций (сколько из 5 возможных посетил)
  const TOTAL_SECTIONS = 5;
  const visitedSections = Object.keys(sections).length;
  const sectionBreadth = Math.min(visitedSections / TOTAL_SECTIONS, 1);

  return {
    visits,
    avgGapHours,
    gapVariance: Math.min(gapVariance, 1),
    daylightOwl,
    clickRatio,
    topInterest,
    sectionBreadth,
    returnRate: visits > 1 ? 1 : 0,
  };
}

// Генерация реплик на основе персоны и фич
export function generatePhrase(persona: string, features: VisitorFeatures): string {
  const { visits, avgGapHours, daylightOwl, topInterest, clickRatio } = features;

  const timeHint = avgGapHours < 24
    ? 'каждый день'
    : avgGapHours < 72
    ? 'каждые пару дней'
    : avgGapHours < 168
    ? 'раз в неделю'
    : 'изредка';

  const phrases: Record<string, string[]> = {
    ghost: [
      'Заглянул и исчез. Классика.',
      'Один визит. Может, хватит?',
      'Ты как привидение — появился и нет.',
    ],
    lurker: [
      `Заходишь ${timeHint}, ничего не нажимаешь. Просто смотришь.`,
      `${visits} визитов, минимум кликов. Наблюдатель.`,
      daylightOwl > 0.7 ? 'Ночной lurker. Классика жанра.' : 'Молча изучаешь. Уважаю.',
    ],
    explorer: [
      `${visits} визит, везде заглянул. Исследователь.`,
      'Тыкаешь везде. Это хорошо.',
      topInterest !== 'none' ? `Больше всего тебя интересует "${topInterest}".` : 'Всё смотришь понемногу.',
    ],
    regular: [
      `Заходишь ${timeHint}. Уже ритуал?`,
      `${visits} визитов — не случайность. Ты наш.`,
      `Регулярно здесь. Спасибо, правда.`,
    ],
    addict: [
      `${visits} раз. Это уже диагноз.`,
      `Заходишь ${timeHint}. Я начинаю беспокоиться.`,
      clickRatio > 5 ? `${Math.round(clickRatio)} кликов за визит в среднем. Что ты ищешь?` : 'Ладно, рада видеть. Снова.',
    ],
    daylight_hunter: [
      'Поздно не спишь — на сайт заходишь. Знакомо.',
      `${Math.round(daylightOwl * 100)}% визитов ночью. Совпадение? Не думаю.`,
      'Ночью сайт выглядит иначе? Нет. Но ты всё равно приходишь.',
    ],
    merchant: [
      'Мерч смотришь. Намекаю — есть хорошие варианты.',
      'Товары изучаешь тщательно. Ценю подход.',
      'За мерчем пришёл? Правильное место.',
    ],
    community_seeker: [
      'Discord смотришь. Там хорошие люди.',
      'Общение ищешь? Discord открыт.',
      'Заходи в сообщество — не пожалеешь.',
    ],
  };

  const pool = phrases[persona] || phrases.explorer;
  return pool[Math.floor(Math.random() * pool.length)];
}