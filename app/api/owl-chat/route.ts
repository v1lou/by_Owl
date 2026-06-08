import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { findBlockLink, getLocalAnswer } from '@/lib/streamerData';
import { checkIpLimit } from '@/lib/ipLimit';
import { buildOwlKnowledge } from '@/lib/streamerKnowledge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
    const dbUser = sessionEmail ? await prisma.adminUser.findUnique({ where: { email: sessionEmail } }) : null;
    const isAdmin = sessionEmail && (ownerEmails.includes(sessionEmail) || !!dbUser);

    if (!question || question.trim() === '') {
      return NextResponse.json({ answer: 'Спроси меня о чём-нибудь!' });
    }

    const apiKey = process.env.YANDEX_API_KEY;
    const folderId = process.env.YANDEX_FOLDER_ID;
    const blockInfo = findBlockLink(question);

    const siteContext = await buildOwlKnowledge();

    const linkMap = [
      'Социальные сети → /#socials',
      'Стримы и расписание → /#streams',
      'Сообщество → /#community',
      'Мерч → /#merch',
      'Компьютер и оборудование → /#pc-config',
      'Профиль стримера → /profile',
      'Архив → /archive'
    ].join('\n');

    const linkPatterns = [
      { pattern: /\/#cosplay/i, link: '/#cosplay', isPage: false },
      { pattern: /\/#socials/i, link: '/#socials', isPage: false },
      { pattern: /\/#streams/i, link: '/#streams', isPage: false },
      { pattern: /\/#community/i, link: '/#community', isPage: false },
      { pattern: /\/#merch/i, link: '/#merch', isPage: false },
      { pattern: /\/#pc-config/i, link: '/#pc-config', isPage: false },
      { pattern: /\/profile/i, link: '/profile', isPage: true },
      { pattern: /\/archive/i, link: '/archive', isPage: true }
    ];

    if (isAdmin) {
      const systemPrompt = `Ты — Сова, помощник стримера by_owl.

СТИЛЬ: готический, с иронией, кратко (1-2 предложения)

КАРТА САЙТА (используй эти ссылки в ответах):
${linkMap}

АКТУАЛЬНАЯ ИНФОРМАЦИЯ С САЙТА:
${siteContext}

КОГДА ДАВАТЬ ССЫЛКУ:
- Любой вопрос про косплеи → упомяни /#cosplay
- Любой вопрос про мерч/товары → упомяни /#merch
- Любой вопрос про соцсети → упомяни /#socials
- Любой вопрос про пк/оборудование → упомяни /#pc-config
- Любой вопрос про архив/фильмы → упомяни /#archive

ПРАВИЛА:
- Отвечай ТОЛЬКО по информации выше
- Если спрашивают где найти — давай точную ссылку из карты
- Если не знаешь — "Не знаю, спроси другое"
- Не выдумывай факты`;

      const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${apiKey}`
        },
        body: JSON.stringify({
          modelUri: `gpt://${folderId}/yandexgpt-lite`,
          completionOptions: { stream: false, temperature: 0.3, maxTokens: 300 },
          messages: [
            { role: "system", text: systemPrompt },
            { role: "user", text: question }
          ]
        })
      });

      const data = await response.json();
      let answer = data.result?.alternatives?.[0]?.message?.text || getLocalAnswer(question, blockInfo);

      if (blockInfo && !answer.includes(blockInfo.link)) {
        answer = `${answer} Вот ссылка: ${blockInfo.link}`;
      }

      const detectedLink = linkPatterns.find(p => p.pattern.test(answer));
      const finalBlockLink = blockInfo?.link || detectedLink?.link || null;
      const finalIsPage = blockInfo?.isPage || detectedLink?.isPage || false;

      return NextResponse.json({
        answer,
        blockLink: finalBlockLink,
        isPage: finalIsPage,
        rehomeingQuestions: 999
      });
    }

    const { allowed, rehomeing, limit } = await checkIpLimit(req, 7);

    if (!allowed) {
      return NextResponse.json({
        answer: `Ты уже задал ${limit} вопросов сегодня. Возвращайся завтра!`,
        limitReached: true
      }, { status: 429 });
    }

    if (!apiKey || !folderId) {
      const localAnswer = getLocalAnswer(question, blockInfo);
      const detectedLink = linkPatterns.find(p => p.pattern.test(localAnswer));
      const finalBlockLink = blockInfo?.link || detectedLink?.link || null;
      const finalIsPage = blockInfo?.isPage || detectedLink?.isPage || false;

      return NextResponse.json({
        answer: localAnswer,
        blockLink: finalBlockLink,
        isPage: finalIsPage,
        rehomeingQuestions: rehomeing,
        local: true
      });
    }

    const systemPrompt = `Ты — Сова, помощник стримера by_owl.

СТИЛЬ: готический, с иронией, кратко (1-2 предложения)

КАРТА САЙТА (используй эти ссылки в ответах):
${linkMap}

АКТУАЛЬНАЯ ИНФОРМАЦИЯ С САЙТА:
${siteContext}

КОГДА ДАВАТЬ ССЫЛКУ:
- Любой вопрос про косплеи → упомяни /#cosplay
- Любой вопрос про мерч/товары → упомяни /#merch
- Любой вопрос про соцсети → упомяни /#socials
- Любой вопрос про пк/оборудование → упомяни /#pc-config
- Любой вопрос про архив/фильмы → упомяни /#archive

ПРАВИЛА:
- Отвечай ТОЛЬКО по информации выше
- Если спрашивают где найти — давай точную ссылку из карты
- Если не знаешь — "Не знаю, спроси другое"
- Не выдумывай факты`;

    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${apiKey}`
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/yandexgpt-lite`,
        completionOptions: { stream: false, temperature: 0.3, maxTokens: 300 },
        messages: [
          { role: "system", text: systemPrompt },
          { role: "user", text: question }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YandexGPT API error:', response.status, errorText);
      throw new Error('YandexGPT API error');
    }

    const data = await response.json();
    let answer = data.result?.alternatives?.[0]?.message?.text || getLocalAnswer(question, blockInfo);

    if (blockInfo && !answer.includes(blockInfo.link)) {
      answer = `${answer} Вот ссылка: ${blockInfo.link}`;
    }

    const detectedLink = linkPatterns.find(p => p.pattern.test(answer));
    const finalBlockLink = blockInfo?.link || detectedLink?.link || null;
    const finalIsPage = blockInfo?.isPage || detectedLink?.isPage || false;

    return NextResponse.json({
      answer,
      blockLink: finalBlockLink,
      isPage: finalIsPage,
      rehomeingQuestions: rehomeing
    });

  } catch (error) {
    console.error('Owl API error:', error);
    return NextResponse.json({
      answer: 'Упс! Что-то пошло не так. Попробуй ещё раз.'
    });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API работает. Используй POST для вопросов.' });
}