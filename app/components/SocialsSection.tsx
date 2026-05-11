// components/SocialsSection.tsx - без календаря
'use client';

import { useState, useEffect } from 'react';
import '../../styles/socials-section.css'
import { useTranslation } from 'react-i18next';

export default function SocialsSection() {
  const [socialsData, setSocialsData] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch('/api/data/socials')
      .then(res => res.json())
      .then(data => setSocialsData(data))
      .catch(err => console.error('Error loading socials:', err));
  }, []);

  if (!socialsData) {
    return <div className="socials-section">Загрузка...</div>;
  }

  const socialLinks = [
    { name: 'Twitch', url: 'https://www.twitch.tv/by_owl' },
    { name: 'Telegram Основной', url: 'https://t.me/by_owl' },
    { name: 'Telegram Флуд + Фрибеты', url: 'https://t.me/by_pomoika' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@by_owl' },
    { name: 'Instagram*', url: 'https://instagram.com/by_owl', note: '*' },
    { name: 'YouTube', url: 'https://www.youtube.com/@by_owl1/videos' },
    { name: 'Steam', url: 'https://steamcommunity.com/id/by_owl' },
    { name: 'Распродажа вещей', url: 'https://t.me/buy_owl' },
  ];

  return (
    <section id="socials" className="socials-section">
      <div className="socials-container">
        <div className="socials-left">
        <h2 className="socials-title">
          {t('socials.title')}
        </h2>
          
          <div className="cooperation-wrapper">
            <div className="cooperation-text">Для сотрудничества:</div>
            <a
              href="https://t.me/JiraiyaRice"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-link"
            >
              <span className="cooperation-username">@JiraiyaRice</span>
            </a>
          </div>
          
          <div className="socials-grid">
            {socialLinks.map((link: any, idx: number) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
              >
                <span className="social-name">
                  {link.name}
                  {link.note && <span className="social-note">{link.note}</span>}
                </span>
              </a>
            ))}
          </div>

          <div className="support-row">
            <a
              href="https://new.donatepay.ru/@by_owl"
              target="_blank"
              rel="noopener noreferrer"
              className="support-card"
            >
              <span className="support-name">DonatePay (Крипта)</span>
            </a>
            <a
              href="https://x.la/l/iRHcwBAl"
              target="_blank"
              rel="noopener noreferrer"
              className="support-card"
            >
              <span className="support-name">Купить G Coin</span>
            </a>
            <a
              href="https://www.donationalerts.com/r/by_owl"
              target="_blank"
              rel="noopener noreferrer"
              className="support-card"
            >
              <span className="support-name">DonationAlerts</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}