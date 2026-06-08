import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

export async function GET(req: NextRequest) {
  const err = await requireAdmin('analytics');
  if (err) return err;

  const visitors = await prisma.visitor.findMany();

  const totalClicks: Record<string, number> = {};
  const totalSections: Record<string, number> = {};
  const personaCounts: Record<string, number> = {};
  const hourCounts: Record<string, number> = {};
  let totalVisits = 0;
  let returningUsers = 0;
  let daylightOwls = 0;

  for (const v of visitors) {
    totalVisits += v.visits;
    if (v.visits > 1) returningUsers++;

    try {
      const clicks = JSON.parse(v.clicks as string || '{}');
      for (const [key, count] of Object.entries(clicks)) {
        totalClicks[key] = (totalClicks[key] || 0) + (count as number);
      }
    } catch {}

    try {
      const sections = JSON.parse(v.sections as string || '{}');
      for (const [key, count] of Object.entries(sections)) {
        totalSections[key] = (totalSections[key] || 0) + (count as number);
      }
    } catch {}


    personaCounts[v.persona] = (personaCounts[v.persona] || 0) + 1;

    try {
      const hours = JSON.parse(v.hourPattern as string || '{}');
      for (const [h, count] of Object.entries(hours)) {
        hourCounts[h] = (hourCounts[h] || 0) + (count as number);
      }
    } catch {}

    if (v.clickRatio > 0 || v.sessionDepth > 0) {
      try {
        const hours = JSON.parse(v.hourPattern as string || '{}');
        const daylightHours = ['22','23','0','1','2','3','4'];
        const total = Object.values(hours).reduce((a: number, b) => a + (b as number), 0);
        const daylight = daylightHours.reduce((a, h) => a + ((hours[h] as number) || 0), 0);
        if (total > 0 && daylight / total > 0.6) daylightOwls++;
      } catch {}
    }
  }

  const topClicks = Object.entries(totalClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const topSections = Object.entries(totalSections)
    .sort((a, b) => b[1] - a[1]);

  const hourActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourCounts[i.toString()] || 0,
  }));

  return NextResponse.json({
    overview: {
      totalVisitors: visitors.length,
      totalVisits,
      returningUsers,
      returningRate: visitors.length > 0
        ? Math.round(returningUsers / visitors.length * 100)
        : 0,
      daylightOwls,
    },
    topClicks,
    topSections,
    personaCounts,
    hourActivity,
  });
}