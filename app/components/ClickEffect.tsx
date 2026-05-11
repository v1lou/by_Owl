'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Spot {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
}

interface Drip {
  id: number;
  x: number;
  y: number;
  size: number;
  length: number;
  opacity: number;
  life: number;
  speed: number;
}

// Цветовые конфиги для каждой темы
const THEME_CONFIG = {
  daylight: {
    // Кровь — как оригинал
    spot: {
      gradient: (opacity: number) =>
        `radial-gradient(circle at 40% 40%, rgba(180,30,30,${opacity}) 0%, rgba(120,15,15,${opacity * 0.6}) 40%, rgba(60,0,0,${opacity * 0.3}) 70%, rgba(60,0,0,0) 100%)`,
      shadow: (size: number, opacity: number) =>
        `0 0 ${size}px rgba(120,0,0,${opacity * 0.2})`,
    },
    drip: {
      trail: (opacity: number) =>
        `linear-gradient(to top, rgba(120,10,10,${opacity}), rgba(80,0,0,${opacity * 0.3}))`,
      drop: (opacity: number) =>
        `radial-gradient(circle at 30% 30%, rgba(180,30,30,${opacity}), rgba(100,10,10,${opacity * 0.8}))`,
      shadow: (size: number, opacity: number) =>
        `0 0 ${size}px rgba(150,0,0,${opacity * 0.4})`,
      highlight: (opacity: number) =>
        `rgba(255,200,200,${opacity * 0.5})`,
    },
    spotSizeMin: 15,
    spotSizeRange: 15,
    spotOpacityMin: 0.3,
    spotOpacityRange: 0.4,
    splashCount: 5,
    splashSizeMin: 3,
    splashSizeRange: 6,
    splashOpacityMin: 0.15,
    splashOpacityRange: 0.25,
    splashSpread: 30,
    dripCountMin: 2,
    dripCountRange: 3,
    dripSizeMin: 3,
    dripSizeRange: 5,
    dripOpacityMin: 0.3,
    dripOpacityRange: 0.4,
    dripSpeedMin: 0.15,
    dripSpeedRange: 0.15,
    dripSpread: 20,
    spotLifetime: 300,
    splashLifetime: 200,
    dripLifetime: 350,
    maxDripLength: 40,
    spotGrowth: 1.002,
    spotFade: 0.997,
    dripFade: 0.998,
  },
  twilight: {
    // Дождь — прозрачный, лёгкий
    spot: {
      gradient: (opacity: number) =>
        `radial-gradient(circle at 35% 35%, rgba(180,220,255,${opacity}) 0%, rgba(130,180,230,${opacity * 0.5}) 45%, rgba(80,140,200,${opacity * 0.2}) 75%, rgba(80,140,200,0) 100%)`,
      shadow: (size: number, opacity: number) =>
        `0 0 ${size * 0.8}px rgba(100,160,220,${opacity * 0.15})`,
    },
    drip: {
      trail: (opacity: number) =>
        `linear-gradient(to top, rgba(140,200,255,${opacity}), rgba(100,170,240,${opacity * 0.2}))`,
      drop: (opacity: number) =>
        `radial-gradient(circle at 30% 25%, rgba(210,235,255,${opacity}), rgba(120,180,240,${opacity * 0.7}))`,
      shadow: (size: number, opacity: number) =>
        `0 0 ${size}px rgba(100,170,240,${opacity * 0.25})`,
      highlight: (opacity: number) =>
        `rgba(255,255,255,${opacity * 0.75})`,
    },
    spotSizeMin: 8,
    spotSizeRange: 10,
    spotOpacityMin: 0.08,
    spotOpacityRange: 0.12,
    splashCount: 4,
    splashSizeMin: 2,
    splashSizeRange: 4,
    splashOpacityMin: 0.05,
    splashOpacityRange: 0.1,
    splashSpread: 22,
    dripCountMin: 1,
    dripCountRange: 2,
    dripSizeMin: 2,
    dripSizeRange: 3,
    dripOpacityMin: 0.15,
    dripOpacityRange: 0.2,
    dripSpeedMin: 0.25,
    dripSpeedRange: 0.2,
    dripSpread: 12,
    spotLifetime: 200,
    splashLifetime: 140,
    dripLifetime: 220,
    maxDripLength: 28,
    spotGrowth: 1.003,
    spotFade: 0.994,
    dripFade: 0.995,
  },
};

const ClickEffect = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [drips, setDrips] = useState<Drip[]>([]);
  const dripIdRef = useRef(0);
  const spotIdRef = useRef(0);
  const themeRef = useRef(theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!mounted) return;

    const handleClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const cfg = THEME_CONFIG[themeRef.current === 'twilight' ? 'twilight' : 'daylight'];

      // Основное пятно
      setSpots(prev => [...prev, {
        id: spotIdRef.current++,
        x,
        y,
        size: Math.random() * cfg.spotSizeRange + cfg.spotSizeMin,
        opacity: Math.random() * cfg.spotOpacityRange + cfg.spotOpacityMin,
        life: cfg.spotLifetime,
      }]);

      // Брызги вокруг
      for (let i = 0; i < cfg.splashCount; i++) {
        setSpots(prev => [...prev, {
          id: spotIdRef.current++,
          x: x + (Math.random() - 0.5) * cfg.splashSpread,
          y: y + (Math.random() - 0.5) * cfg.splashSpread,
          size: Math.random() * cfg.splashSizeRange + cfg.splashSizeMin,
          opacity: Math.random() * cfg.splashOpacityRange + cfg.splashOpacityMin,
          life: cfg.splashLifetime,
        }]);
      }

      // Подтёки / капли
      const dripCount = Math.floor(Math.random() * cfg.dripCountRange) + cfg.dripCountMin;
      for (let i = 0; i < dripCount; i++) {
        setDrips(prev => [...prev, {
          id: dripIdRef.current++,
          x: x + (Math.random() - 0.5) * cfg.dripSpread,
          y: y + Math.random() * 10,
          size: Math.random() * cfg.dripSizeRange + cfg.dripSizeMin,
          length: 0,
          opacity: Math.random() * cfg.dripOpacityRange + cfg.dripOpacityMin,
          life: cfg.dripLifetime,
          speed: Math.random() * cfg.dripSpeedRange + cfg.dripSpeedMin,
        }]);
      }
    };

    let animationFrame: number;
    let lastTheme = themeRef.current;

    const animate = () => {
      const currentTheme = themeRef.current;
      const cfg = THEME_CONFIG[currentTheme === 'twilight' ? 'twilight' : 'daylight'];

      // Сброс при смене темы
      if (currentTheme !== lastTheme) {
        setSpots([]);
        setDrips([]);
        lastTheme = currentTheme;
      }

      setSpots(prev =>
        prev
          .map(s => ({
            ...s,
            life: s.life - 1,
            opacity: s.opacity * cfg.spotFade,
            size: s.size * cfg.spotGrowth,
          }))
          .filter(s => s.life > 0 && s.opacity > 0.01)
      );

      setDrips(prev =>
        prev
          .map(d => ({
            ...d,
            y: d.y + d.speed,
            length: Math.min(d.length + d.speed * 0.5, cfg.maxDripLength),
            life: d.life - 1,
            opacity: d.opacity * cfg.dripFade,
          }))
          .filter(d => d.life > 0 && d.opacity > 0.02)
      );

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('click', handleClick);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, [mounted]);

  if (!mounted) return null;

  const cfg = THEME_CONFIG[theme === 'twilight' ? 'twilight' : 'daylight'];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 99999,
    }}>
      {/* Пятна */}
      {spots.map(spot => (
        <div
          key={spot.id}
          style={{
            position: 'absolute',
            left: spot.x,
            top: spot.y,
            width: spot.size,
            height: spot.size * 0.8,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            filter: `blur(${spot.size * 0.15}px)`,
            background: cfg.spot.gradient(spot.opacity),
            boxShadow: cfg.spot.shadow(spot.size, spot.opacity),
          }} />
        </div>
      ))}

      {/* Подтёки / капли */}
      {drips.map(drip => (
        <div
          key={drip.id}
          style={{
            position: 'absolute',
            left: drip.x,
            top: drip.y,
            transform: 'translate(-50%, 0)',
            pointerEvents: 'none',
          }}
        >
          {/* Хвост подтёка */}
          <div style={{
            width: drip.size * 0.7,
            height: drip.length,
            marginLeft: drip.size * 0.15,
            background: cfg.drip.trail(drip.opacity),
            borderRadius: `${drip.size}px ${drip.size}px 0 0`,
          }} />

          {/* Капля */}
          <div style={{
            width: drip.size,
            height: drip.size * 1.3,
            marginTop: -drip.size * 0.15,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: cfg.drip.drop(drip.opacity),
            boxShadow: cfg.drip.shadow(drip.size, drip.opacity),
          }} />

          {/* Блик */}
          <div style={{
            position: 'absolute',
            top: drip.size * 0.2,
            left: drip.size * 0.2,
            width: drip.size * 0.3,
            height: drip.size * 0.2,
            borderRadius: '50%',
            background: cfg.drip.highlight(drip.opacity),
            transform: 'rotate(-30deg)',
          }} />
        </div>
      ))}
    </div>
  );
};

export default ClickEffect;
