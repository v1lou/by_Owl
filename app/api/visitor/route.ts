import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractFeatures, classifyPersona, generatePhrase } from '@/lib/visitorML';

export async function POST(req: NextRequest) {
  try {
    const { fingerprintId, event, data } = await req.json();
    if (!fingerprintId) return NextResponse.json({ error: 'No ID' }, { status: 400 });

    const existing = await prisma.visitor.findUnique({ where: { id: fingerprintId } });

    // Парсим JSON из строк (для SQLite)
    let clicks: Record<string, number> = {};
    let sections: Record<string, number> = {};
    let visitGaps: number[] = [];
    let hourPattern: Record<string, number> = {};

    if (existing?.clicks) {
      try {
        clicks = typeof existing.clicks === 'string' ? JSON.parse(existing.clicks) : existing.clicks;
      } catch {
        clicks = {};
      }
    }
    
    if (existing?.sections) {
      try {
        sections = typeof existing.sections === 'string' ? JSON.parse(existing.sections) : existing.sections;
      } catch {
        sections = {};
      }
    }
    
    if (existing?.visitGaps) {
      try {
        visitGaps = typeof existing.visitGaps === 'string' ? JSON.parse(existing.visitGaps) : existing.visitGaps;
      } catch {
        visitGaps = [];
      }
    }
    
    if (existing?.hourPattern) {
      try {
        hourPattern = typeof existing.hourPattern === 'string' ? JSON.parse(existing.hourPattern) : existing.hourPattern;
      } catch {
        hourPattern = {};
      }
    }

    // Обновляем данные по типу события
    if (event === 'click' && data?.target) {
      clicks[data.target] = (clicks[data.target] || 0) + 1;
    }

    if (event === 'section' && data?.id) {
      sections[data.id] = (sections[data.id] || 0) + 1;
    }

    if (event === 'visit') {
      // Считаем промежуток от последнего визита
      if (existing?.lastVisit) {
        const lastVisitTime = typeof existing.lastVisit === 'string' 
          ? new Date(existing.lastVisit).getTime() 
          : existing.lastVisit.getTime();
        const gapHours = (Date.now() - lastVisitTime) / 3600000;
        if (gapHours > 0.5) { // игнорируем < 30 минут (обновление страницы)
          visitGaps = [...visitGaps.slice(-19), gapHours]; // храним последние 20
        }
      }

      // Час визита
      const hour = new Date().getHours().toString();
      hourPattern[hour] = (hourPattern[hour] || 0) + 1;
    }

    const visits = event === 'visit'
      ? (existing?.visits || 0) + 1
      : (existing?.visits || 1);

    // ML: извлекаем фичи и классифицируем
    const features = extractFeatures(visits, clicks, sections, visitGaps, hourPattern);
    const persona = classifyPersona(features);
    const phrase = generatePhrase(persona, features);

    // Старый character для совместимости
    const character = visits >= 20 ? 'obsessed'
      : visits >= 10 ? 'regular'
      : visits >= 5 ? 'returning'
      : visits >= 2 ? 'curious' : 'new';

    const visitor = await prisma.visitor.upsert({
      where: { id: fingerprintId },
      create: {
        id: fingerprintId,
        visits,
        clicks: JSON.stringify(clicks),
        sections: JSON.stringify(sections),
        character,
        persona,
        visitGaps: JSON.stringify(visitGaps),
        hourPattern: JSON.stringify(hourPattern),
        sessionDepth: Object.keys(sections).length,
        clickRatio: features.clickRatio,
      },
      update: {
        visits,
        clicks: JSON.stringify(clicks),
        sections: JSON.stringify(sections),
        character,
        persona,
        visitGaps: JSON.stringify(visitGaps),
        hourPattern: JSON.stringify(hourPattern),
        sessionDepth: Object.keys(sections).length,
        clickRatio: features.clickRatio,
        lastVisit: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      visitor: {
        id: visitor.id,
        visits: visitor.visits,
        firstVisit: visitor.firstVisit,
        lastVisit: visitor.lastVisit,
        clicks: typeof visitor.clicks === 'string' ? JSON.parse(visitor.clicks) : visitor.clicks,
        sections: typeof visitor.sections === 'string' ? JSON.parse(visitor.sections) : visitor.sections,
        character: visitor.character,
        persona: visitor.persona,
        sessionDepth: visitor.sessionDepth,
        clickRatio: visitor.clickRatio,
        phrase,
        features,
      },
    });

  } catch (e) {
    console.error('Visitor API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}