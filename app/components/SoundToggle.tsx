'use client';

import { useSound } from './SoundManager';
import { useTranslation } from 'react-i18next';

export default function SoundToggle() {
  const { enabled, toggle } = useSound();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggle}
      className="sound-toggle-btn"
      title={enabled ? 'Выключить звук' : 'Включить звук'}
      aria-label="Sound toggle"
    >
      <span className="sound-label">{enabled ? 'Sound ON' : 'Sound OFF'}</span>
    </button>
  );
}