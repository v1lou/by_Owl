'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface SoundContextType {
  enabled: boolean;
  toggle: () => void;
  play: (soundKey: string) => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

export const useSound = () => useContext(SoundContext);

// Реестр звуков — сюда добавляете новые
const SOUNDS: Record<string, string> = {
  // Ambient (фоновые, по теме)
  'ambient-daylight':     '/sounds/ambient-daylight.mp3',
  'ambient-twilight':  '/sounds/ambient-twilight.mp3',

  // UI события
  'page-transition':   '/sounds/page-transition.mp3',
  'click':             '/sounds/click.mp3',
  'hover':             '/sounds/hover.mp3',
  'open':              '/sounds/open.mp3',
  'close':             '/sounds/close.mp3',
  'success':           '/sounds/success.mp3',

  // Специальные
  'nav':               '/sounds/nav.mp3',
  'card-hover':        '/sounds/card-hover.mp3',
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const { theme } = useTheme();
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Загружаем звук в кеш
  const preload = useCallback((key: string) => {
    if (audioCache.current.has(key)) return;
    const src = SOUNDS[key];
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioCache.current.set(key, audio);
  }, []);

  // Воспроизведение
  const play = useCallback((key: string) => {
    if (!enabled) return;
    const src = SOUNDS[key];
    if (!src) return;

    let audio = audioCache.current.get(key);
    if (!audio) {
      audio = new Audio(src);
      audioCache.current.set(key, audio);
    }

    // Клонируем для наложения звуков
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.4;
    clone.play().catch(() => {});
  }, [enabled]);

  // Фоновый ambient по теме
  useEffect(() => {
    if (!enabled) {
      ambientRef.current?.pause();
      return;
    }

    const key = theme === 'daylight' ? 'ambient-daylight' : 'ambient-twilight';
    const src = SOUNDS[key];
    if (!src) return;

    if (ambientRef.current) {
      ambientRef.current.pause();
    }

    const ambient = new Audio(src);
    ambient.loop = true;
    ambient.volume = 0.15;
    ambient.play().catch(() => {});
    ambientRef.current = ambient;

    return () => { ambient.pause(); };
  }, [enabled, theme]);

  // Глобальный обработчик data-sound атрибутов
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-sound-click]');
      if (target) {
        const key = target.getAttribute('data-sound-click') || 'click';
        play(key);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-sound-hover]');
      if (target) {
        const key = target.getAttribute('data-sound-hover') || 'hover';
        play(key);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mouseover', handleMouseEnter);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseEnter);
    };
  }, [enabled, play]);

  const toggle = () => setEnabled(prev => !prev);

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}