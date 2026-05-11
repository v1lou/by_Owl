'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function GothicLanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="gothic-lang-switch-cup">
      <div className="cup-container">
        <button 
          className={`cup-handle-circle left-handle-circle ${currentLang === 'en' ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage('en')}
          title="English"
        >
          <span className="handle-text">ENG</span>
        </button>
        
        <button 
          className={`cup-handle-circle right-handle-circle ${currentLang === 'ru' ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage('ru')}
          title="Русский"
        >
          <span className="handle-text">РУС</span>
        </button>
        
        <div className="cup-image-wrapper">
          <Image 
            src="/images/cup_mavis_twilight.png" 
            alt="Language switcher" 
            width={200}
            height={200}
            quality={100}
            priority
            className="cup-image"
          />
        </div>
      </div>
    </div>
  );
}