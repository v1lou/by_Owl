// lib/siteParser.ts
import * as cheerio from 'cheerio';

interface SiteSection {
  id: string;
  title: string;
  content: string;
  link: string;
}

let cachedContent: SiteSection[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 30; // 30 минут

export async function parseSiteContent(): Promise<SiteSection[]> {
  // Возвращаем кэш если свежий
  if (cachedContent && Date.now() - cacheTime < CACHE_TTL) {
    return cachedContent;
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const sections: SiteSection[] = [];

  // Список страниц для парсинга
  const pagesToParse = [
    { url: '/', label: 'Главная' },
    { url: '/profile', label: 'Профиль' },
    // добавь свои страницы
  ];

  for (const page of pagesToParse) {
    try {
      const res = await fetch(`${baseUrl}${page.url}`, {
        headers: { 'User-Agent': 'OwlBot/1.0' },
        next: { revalidate: 0 }
      });

      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      // Убираем мусор
      $('script, style, nav, footer, .owl-assistant').remove();

      // Парсим секции по id
      $('[id]').each((_, el) => {
        const id = $(el).attr('id');
        if (!id) return;

        const title = $(el).find('h1,h2,h3').first().text().trim()
          || id;
        const content = $(el).text()
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 800); // лимит на секцию

        if (content.length > 50) {
          sections.push({
            id,
            title,
            content,
            link: `${page.url}#${id}`
          });
        }
      });

      // Если нет секций с id — берём весь текст страницы
      if (sections.length === 0) {
        const content = $('home, .content, body')
          .text()
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 1500);

        sections.push({
          id: page.url.replace('/', '') || 'home',
          title: page.label,
          content,
          link: page.url
        });
      }

    } catch (e) {
      console.error(`Parser error for ${page.url}:`, e);
    }
  }

  cachedContent = sections;
  cacheTime = Date.now();
  return sections;
}

export function buildContextFromSections(sections: SiteSection[]): string {
  return sections
    .map(s => `[${s.title} | ссылка: ${s.link}]\n${s.content}`)
    .join('\n\n---\n\n');
}