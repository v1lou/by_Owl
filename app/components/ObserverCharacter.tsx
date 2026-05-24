'use client';

import { useState, useEffect } from 'react';
import { useVisitorTracking, VisitorProfile } from '../../hooks/useVisitorTracking';

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
  const [displayPhrase, setDisplayPhrase] = useState('...');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      let newPhrase = '';
      if (json.visitor?.phrase) {
        newPhrase = json.visitor.phrase;
      } else if ((profile as EnhancedVisitorProfile).phrase) {
        newPhrase = (profile as EnhancedVisitorProfile).phrase!;
      }
      
      if (newPhrase) {
        setTimeout(() => {
          setPhrase(newPhrase);
          setTimeout(() => {
            setIsRefreshing(false);
          }, 50);
        }, 100);
      } else {
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error('Failed to refresh phrase:', error);
      setPhrase('Что-то пошло не так... нажми ещё раз');
      setTimeout(() => {
        setIsRefreshing(false);
      }, 100);
    }
  };

  useEffect(() => {
    if (!profile) return;
    
    const enhancedProfile = profile as EnhancedVisitorProfile;
    if (enhancedProfile.phrase) {
      setPhrase(enhancedProfile.phrase);
    } else {
      setPhrase(getFallbackPhrase(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (!isRefreshing) {
      setDisplayPhrase(phrase);
    }
  }, [phrase, isRefreshing]);

  const getFallbackPhrase = (profile: VisitorProfile): string => {
    const { visits, clicks, character } = profile;
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

  return (
    <div className="observer-character">
      <div className="observer-avatar-full">
        <img 
          src="/images/alien.png" 
          alt="Observer Character"
          className="observer-image-full"
        />
      </div>
      
      <div className="observer-bubble">
        <p className={`observer-phrase ${isRefreshing ? 'refreshing' : ''}`}>
          {displayPhrase}
        </p>
        <div className="observer-stats">
          <span className="observer-visits">Посещение #{profile.visits}</span>
          <span className={`observer-level ${displayLevel}`} title={getPersonaName(enhancedProfile.persona)}>
            {getPersonaName(enhancedProfile.persona) || displayLevel}
          </span>
          {enhancedProfile.features && (
            <span className="observer-activity" title="Активность">
              Активность: {(enhancedProfile.features.clickRatio * 100).toFixed(0)}%
            </span>
          )}
        </div>
        
        <div className="observer-refresh-wrapper">
          <button 
            className="observer-refresh-btn" 
            onClick={fetchPhrase}
            disabled={isRefreshing}
            title="Обновить сообщение"
          >
            <span>обновить</span>
            <span className="refresh-arrow">🡒</span>
          </button>
        </div>
      </div>
    </div>
  );
}