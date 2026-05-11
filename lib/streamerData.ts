// lib/streamerData.ts

// ========== ТИПЫ ==========

export type Achievement = {
  id: number;
  title: string;
  event: string;
  year: number;
  description: string;
  photos?: string[];
  photo?: string[];
  link: string;
};

export type BioData = {
  name?: string;
  age?: number;
  city?: string;
  startedStreaming?: string;
  schedule?: string;
  description?: string;
  achievements?: Achievement[];
};

export type CosplayItem = {
  id: number;
  photos: string[];
  characterImage: string;
  characterName: string;
  description: string;
  streamLink: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  link: string;
  image: string;
  type: string;
};

export type SocialLink = {
  name: string;
  url: string;
  icon: string;
};

export type TelegramInfo = {
  name: string;
  url: string;
};

export type ExtraLink = {
  name: string;
  url: string;
};

export type PCConfig = {
  components: {
    cpu: { name: string; description: string };
    gpu: { name: string; description: string };
    motherboard: { name: string; description: string };
    ram: { name: string; description: string };
    ssd: { name: string; description: string };
    cooling: { name: string; description: string };
    psu: { name: string; description: string };
    case: { name: string; description: string };
  };
  peripherals: {
    monitors: { name: string; description: string }[];
    mouse: { name: string; description: string };
    keyboard: { name: string; description: string };
    headphones_in: { name: string; description: string };
    headphones_over: { name: string; description: string };
    mousepad: { name: string; description: string };
  };
  audio: {
    microphone: { name: string; description: string };
    soundcard: { name: string; description: string };
    camera: { name: string; description: string };
    lens: { name: string; description: string };
    light: { name: string; description: string };
  };
  furniture: {
    chair: { name: string; description: string };
    desk: { name: string; description: string };
  };
};

export type SocialsData = {
  homeLinks: SocialLink[];
  telegramInfo: TelegramInfo[];
  extraLinks: ExtraLink[];
  roles: string[];
  moderators: string;
  discordDescription: string;
  discordJoinUrl: string;
};

export type BlockInfo = {
  link: string;
  isPage: boolean;
  description: string;
};


export function findBlockLink(question: string): BlockInfo | null {
  const q = question.toLowerCase();
  
  const blockMap: Record<string, { keywords: string[]; link: string; isPage: boolean; description: string }> = {
    merch: {
      keywords: ['мерч', 'товар', 'купить', 'магазин', 'кофе', 'худи', 'постер', 'products', 'shop', 'мерча'],
      link: '/#merch',
      isPage: false,
      description: 'магазин с мерчем'
    },
    socials: {
      keywords: ['соцсети', 'ссылки', 'telegram', 'twitch', 'discord', 'vk', 'instagram', 'tiktok', 'steam', 'подписаться'],
      link: '/#socials',
      isPage: false,
      description: 'все соцсети'
    },
    pc: {
      keywords: ['компьютер', 'железо', 'пк', 'конфигурация', 'pc', 'gear', 'оборудование', 'микрофон', 'камера', 'наушники'],
      link: '/#pc-config',
      isPage: false,
      description: 'конфигурация ПК'
    },
    home: {
      keywords: ['главная', 'начало', 'наверх', 'топ'],
      link: '/#home',
      isPage: false,
      description: 'главный экран'
    },
    cosplay: {
      keywords: ['косплей', 'костюм', 'образ', 'cosplay', 'мина', 'alien', 'джинкс', 'эмили', 'ада'],
      link: '/#cosplay',
      isPage: false,
      description: 'галерея косплеев'
    },
    profile: {
      keywords: ['профиль', 'о себе', 'биография', 'кто такой', 'био', 'достижения', 'bio', 'achievements'],
      link: '/profile',
      isPage: true,
      description: 'страница профиля'
    },
    archive: {
      keywords: ['архив', 'прошлые стримы', 'записи', 'старые видео', 'archive'],
      link: '/archive',
      isPage: true,
      description: 'архив стримов'
    }
  };

  for (const [_, value] of Object.entries(blockMap)) {
    for (const keyword of value.keywords) {
      if (q.includes(keyword)) {
        return { link: value.link, isPage: value.isPage, description: value.description };
      }
    }
  }
  
  return null;
}

// ========== ЛОКАЛЬНЫЕ ОТВЕТЫ (ФОЛБЭК) - БЕЗ ЗАВИСИМОСТИ ОТ JSON ==========

export function getLocalAnswer(question: string, blockInfo: BlockInfo | null = null): string {
  const q = question.toLowerCase();
  
  // Если есть информация о блоке
  if (blockInfo) {
    if (blockInfo.isPage) {
      return `🦇 Это можно найти на странице: ${blockInfo.link}. Переходи! 🦇`;
    } else {
      return `🦇 Это можно найти в разделе ${blockInfo.description}: ${blockInfo.link} 🦇`;
    }
  }
  
  // Общие вопросы (без привязки к данным из JSON)
  if (q.includes('возраст')) {
    return `🦇 Спроси у меня в чате, сколько мне лет! 🦇`;
  }
  
  if (q.includes('начал') || q.includes('стримить')) {
    return `🦇 Я начал(а) стримить давно! Точную дату уточни в профиле /profile 🦇`;
  }
  
  if (q.includes('расписание') || q.includes('когда стримит')) {
    return `🦇 Расписание обычно вечером! Следи за анонсами в Telegram 🦇`;
  }
  
  if (q.includes('косплей')) {
    return `🦇 У меня много крутых косплеев! Смотри в галерее: /#cosplay 🦇`;
  }
  
  if (q.includes('соцсети') || q.includes('ссылки')) {
    return `🦇 Все соцсети собраны тут: /#socials 🦇`;
  }
  
  if (q.includes('дискорд') || q.includes('discord')) {
    return `🦇 Присоединяйся к Discord серверу по ссылке в разделе /#socials 🦇`;
  }
  
  if (q.includes('мерч') || q.includes('товар') || q.includes('купить')) {
    return `🦇 Мерч можно посмотреть в разделе /#merch 🦇`;
  }
  
  if (q.includes('компьютер') || q.includes('пк') || q.includes('оборудование')) {
    return `🦇 Конфигурация ПК и оборудование в разделе /#pc-config 🦇`;
  }
  
  return `🦇 Спроси меня про возраст, расписание, косплей, соцсети или мерч! 🦇`;
}

export const streamerData = null;

export async function loadStreamerData() {
  return null;
}