'use client';

import { useState, useEffect } from 'react';
import { useVisitorTracking, VisitorProfile } from '../../hooks/useVisitorTracking';

// Тип для профиля с ML-данными
interface EnhancedVisitorProfile extends VisitorProfile {
  persona?: string;
  phrase?: string;
  features?: {
    clickRatio: number;
    sessionDepth: number;
    activeHours: string[];
    consistencyScore: number;
  };
}

export default function ObserverCharacter() {
  const { profile } = useVisitorTracking();
  const [phrase, setPhrase] = useState('...');
  const [visible, setVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Эмодзи для разных персонажей
  const getPersonaEmoji = (persona?: string): string => {
    const emojis: Record<string, string> = {
      researcher: '🔬',
      casual: '😌',
      explorer: '🗺️',
      power_user: '⚡',
      daylight_owl: '🦉',
      weekend_warrior: '🎯',
      obsessive: '🔥',
      newbie: '🌱',
    };
    return emojis[persona || ''] || '🦉';
  };

  // Русские названия персонажей
  const getPersonaName = (persona?: string): string => {
    const names: Record<string, string> = {
      researcher: 'Исследователь',
      casual: 'Случайный гость',
      explorer: 'Искатель',
      power_user: 'Эксперт',
      daylight_owl: 'Ночная сова',
      weekend_warrior: 'Выходной воин',
      obsessive: 'Одержимый',
      newbie: 'Новичок',
    };
    return names[persona || ''] || persona || 'неизвестно';
  };

  // Получение фразы с сервера
  const fetchPhrase = async () => {
    if (!profile || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fingerprintId: profile.id,
          event: 'refresh',
        }),
      });
      
      const json = await res.json();
      if (json.visitor?.phrase) {
        setPhrase(json.visitor.phrase);
      } else if ((profile as EnhancedVisitorProfile).phrase) {
        // fallback на уже имеющуюся фразу
        setPhrase((profile as EnhancedVisitorProfile).phrase!);
      }
    } catch (error) {
      console.error('Failed to refresh phrase:', error);
      // fallback фраза
      setPhrase('Что-то пошло не так... нажми ещё раз');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    
    // Используем ML-фразу с сервера, если есть
    const enhancedProfile = profile as EnhancedVisitorProfile;
    if (enhancedProfile.phrase) {
      setPhrase(enhancedProfile.phrase);
    } else {
      // Fallback на локальную генерацию (старая логика)
      setPhrase(getFallbackPhrase(profile));
    }
    
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, [profile]);

  // Fallback фразы на случай отсутствия ML
  const getFallbackPhrase = (profile: VisitorProfile): string => {
    const { visits, clicks, character } = profile;
    const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);
    const topClick = Object.entries(clicks).sort((a, b) => b[1] - a[1])[0];

    const phrases: Record<string, string[]> = {
      new: ['Добро пожаловать... впервые здесь?', 'Смотрю на тебя. Ты смотришь на меня.', 'Только пришёл — уже интересно.'],
      curious: [`Снова ты. Уже ${visits}-й раз.`, 'О, знакомое лицо. Точнее, пятно от пальца.', 'Вернулся. Значит, что-то зацепило.'],
      returning: [`${visits} визитов. Начинает попахивать привычкой.`, topClick ? `Ты ${topClick[1]} раз нажал на "${topClick[0]}". Зачем?` : 'Много кликаешь. Нервный?', 'Уже пятый раз. Я начинаю запоминать твои паттерны.'],
      regular: [`${visits} визитов. Это уже не просто интерес.`, topClick ? `"${topClick[0]}" нажато ${topClick[1]} раз. Ты что-то ищешь?` : 'Привет, постоянный читатель.', 'Я тебя вижу каждый раз. Ты меня — нет. Обидно.'],
      obsessed: [`${visits} визитов. Это уже клиника.`, 'Ты здесь чаще, чем я сама обновляю контент.', topClick ? `${topClick[1]} нажатий на "${topClick[0]}". Что ты там ищешь?` : 'Ладно, признаю — рада видеть.'],
    };

    const pool = phrases[character] || phrases.new;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  if (!profile) return <div className="observer-character-placeholder"></div>;

  const enhancedProfile = profile as EnhancedVisitorProfile;
  const displayLevel = enhancedProfile.persona || profile.character;
  const displayEmoji = getPersonaEmoji(enhancedProfile.persona);

  return (
    <div
      className={`observer-character ${visible ? 'visible' : ''} ${isRefreshing ? 'refreshing' : ''}`}
      onClick={fetchPhrase}
      title="Нажми, чтобы услышать другое"
    >
      <div className="observer-bubble">
        <p className="observer-phrase">{isRefreshing ? '...' : phrase}</p>
<div className="observer-stats">
  <span className="observer-visits">👁️ Посещение #{profile.visits}</span>
  <span className={`observer-level ${displayLevel}`} title={getPersonaName(enhancedProfile.persona)}>
    {getPersonaName(enhancedProfile.persona) || displayLevel}
  </span>
  {enhancedProfile.features && (
    <span className="observer-activity" title="Активность">
      Активность: {(enhancedProfile.features.clickRatio * 100).toFixed(0)}%
    </span>
  )}
</div>
      </div>
      <div className="observer-avatar">
        <span className="observer-emoji">{displayEmoji}</span>
      </div>
    </div>
  );
}