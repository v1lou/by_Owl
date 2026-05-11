// hooks/useThemeImage.ts
'use client';

import { useState, useEffect } from 'react';

export function useThemeImage() {
  const [theme, setTheme] = useState<string>('default');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'default';
      setTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const getThemeImage = (basePath: string) => {
    if (theme === 'twilight') {
      return `${basePath}-twilight.png`;
    }
    return `${basePath}-daylight.png`;
  };

  const getVampireImage = () => {
    if (theme === 'twilight') {
      return '/images/vampire-twilight.png';
    }
    return '/images/vampire-daylight.png';
  };

  return { getThemeImage, getVampireImage, theme };
}