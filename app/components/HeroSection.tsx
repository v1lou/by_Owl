// components/HeroSection.tsx
'use client';

import Image from 'next/image';
import SpeechBubble from './SpeechBubble';
import { useThemeImage } from '@/hooks/useThemeImage';
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
  twitchData: {
    followers: number;
    isLive: boolean;
    gameName: string;
    viewerCount?: number;
  };
  isLoading: boolean;
}

export default function HeroSection({ twitchData, isLoading }: HeroSectionProps) {
  const { getVampireImage } = useThemeImage();
  const { t } = useTranslation();

  return (
    <section className="page-section" id="home">
      
      {}
      <div className="twitch-stats">
        <div className={`status ${twitchData.isLive ? 'live' : 'offline'}`}>
          <span className="dot"></span>
          <span className="status-text">
            {twitchData.isLive ? t('twitch.online') : t('twitch.offline')}
          </span>
          {twitchData.isLive && twitchData.viewerCount && twitchData.viewerCount > 0 && (
            <span className="viewer-count">
              ﴾ {twitchData.viewerCount.toLocaleString()} ﴿
            </span>
          )}
        </div>

        <div className="followers">
          {isLoading ? (
            <span className="followers-loader">✦</span>
          ) : (
            <>
              <span className="followers-count allow-select">{twitchData.followers.toLocaleString()}</span>
              <span className="followers-label allow-select">{t('twitch.followers')} </span> 
            </>
          )}
        </div>
      </div>

      {}
      <div className="left-side">
        <div className="vampire-with-bubble">
          <SpeechBubble isLive={twitchData.isLive} />
          <Image 
            src={getVampireImage()}
            alt="Vampire" 
            width={380} 
            height={480} 
            unoptimized
            priority
          />
        </div>
      </div>

      {}
      <div className="right-side">
        <div className="logo-container">
          <Image 
            src="/images/home-logo.png"
            alt="Logo" 
            width={600}
            height={240}
            className="home-logo"
            priority
          />
          <div className="links-overlay">
            <a href="https://www.twitch.tv/by_owl" target="_blank" className="hero-link">Twitch</a>
            <a href="https://t.me/byowl" target="_blank" className="hero-link">Telegram</a>
          </div>
        </div>
      </div>
    </section>
  );
}