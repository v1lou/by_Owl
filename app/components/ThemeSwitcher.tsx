'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 'auto', height: '40px' }} />;
  }

  const isdaylight = theme === 'daylight';

  return (
    <button
      onClick={() => setTheme(isdaylight ? 'twilight' : 'daylight')}
      className="theme-switcher-btn"
      aria-label={t('theme.switch')}
      title={isdaylight ? t('theme.toTwilight') : t('theme.todaylight')}
    >
      <span className="theme-name">{isdaylight ? t('theme.twilight') : t('theme.daylight')}</span>
    </button>
  );
}