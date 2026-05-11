import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), 'public/data');

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
}

async function home() {
  const cosplays = readJson('cosplays.json');
  const products = readJson('products.json');
  const bio = readJson('bio.json');
  const archive = readJson('archive.json');
  const socials = readJson('socials-data.json');
  const pcConfig = readJson('pc-config.json');

  // Косплеи
  for (const c of cosplays) {
    await prisma.cosplay.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        characterName: c.characterName,
        description: c.description || '',
        photos: JSON.stringify(c.photos || []),
        characterImage: c.characterImage,
        streamLink: c.streamLink,
      }
    });
  }

  // Товары
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        link: p.link,
        image: p.image,
        type: p.type || 'merch',
      }
    });
  }

  // Достижения
  for (const a of bio.achievements) {
    await prisma.achievement.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        title: a.title,
        event: a.event,
        year: a.year,
        description: a.description || '',
        photos: JSON.stringify(a.photos || []),
        link: a.link,
      }
    });
  }

  // Архив просмотров
  for (const item of archive) {
    await prisma.watchArchive.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        type: item.type || 'movie',
        date: item.date || '',
        link: item.link || '#',
      }
    });
  }

  // SiteConfig — соцсети, пк, биография
  const configs = [
    { key: 'socials', value: JSON.stringify(socials) },
    { key: 'pc_config', value: JSON.stringify(pcConfig) },
    { key: 'bio', value: JSON.stringify({
        name: 'by_owl',
        age: 24,
        // добавь остальные поля из bio.json
      })
    },
  ];

  for (const cfg of configs) {
    await prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: cfg,
    });
  }

  console.log('✅ Seed завершён');
}

home().catch(console.error).finally(() => prisma.$disconnect());