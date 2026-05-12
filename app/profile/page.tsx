'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CosplayGallery from '../components/CosplayGallery';

type CosplayItem = { 
  id: number; 
  photos?: string[]; 
  photo?: string; 
  characterImage: string; 
  characterName: string; 
  description: string; 
  streamLink: string 
};
type Achievement = { 
  id: number; 
  title: string; 
  event: string; 
  year: number; 
  description: string; 
  photos: string[]; 
  link?: string 
};
type BioData = {
  achievements: Achievement[];
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const [cosplays, setCosplays] = useState<CosplayItem[]>([]);
  const [bio, setBio] = useState<BioData | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/data/cosplays')
        .then(r => r.json())
        .then(data => {
          setCosplays(data.map((item: any) => ({
            ...item,
            photos: item.photos || (item.photo ? [item.photo] : [])
          })));
        })
        .catch(() => setCosplays([])),

      fetch('/api/data/bio')
        .then(r => r.json())
        .then(setBio)
        .catch(() => setBio(null)),
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="profile-page-wrapper">

      {/* ПРАВАЯ КОЛОНКА - ДОСТИЖЕНИЯ */}
      <div className="profile-right-column">
        {bio?.achievements && bio.achievements.length > 0 && (
          <div className="achievements-section">
            <h2 className="achievements-title">Достижения</h2>
            <div className="achievements-list">
              {bio.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="achievement-card"
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <div className="achievement-year">{achievement.year}</div>
                  <div className="achievement-event">{achievement.event}</div>
                  <div className="achievement-title">{achievement.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ЛЕВАЯ КОЛОНКА */}
      <div className="profile-left-column">

        {/* БЛОК "ОБО МНЕ" */}
        <div className="bio-card-horizontal" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          <div className="bio-info">
            <h2 className="bio-title">{t('about.title')}</h2>
            <p className="bio-greeting">{t('about.greeting')}</p>
            <p className="bio-description">{t('about.description')}</p>
            <div className="bio-details">
              <span className="bio-detail">{t('about.birthday')}: 18 {t('about.march')}</span>
              <span className="bio-detail">{t('about.city')}: {t('about.moscow')}</span>
              <span className="bio-detail">{t('about.streamingSince')}: 2016</span>
            </div>
            <div className="bio-signature">{t('about.signature')}</div>
          </div>
        </div>

        {/* ГАЛЕРЕЯ КОСПЛЕЕВ */}
        <div className="cosplay-gallery-vertical">
          <h1 className="gothic-title" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            {t('cosplay.gallery')}
          </h1>

          {cosplays.length === 0 && !isLoading ? (
            <div className="cosplay-placeholder">
              {t('cosplay.empty') || 'Косплеи не найдены'}
            </div>
          ) : (
            <CosplayGallery cosplays={cosplays} />
          )}
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОСТИЖЕНИЯ */}
      {selectedAchievement && (
        <div className="achievement-modal-overlay" onClick={() => setSelectedAchievement(null)}>
          <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedAchievement(null)}>
              ×
            </button>
            <h3 className="modal-title">{selectedAchievement.title}</h3>
            <div className="modal-year">{selectedAchievement.year}</div>
            <div className="modal-event">{selectedAchievement.event}</div>
            <div className="modal-description">{selectedAchievement.description}</div>
            {selectedAchievement.link && (
              <a
                href={selectedAchievement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                Подробнее →
              </a>
            )}
            <div className="modal-decoration">✦</div>
          </div>
        </div>
      )}
    </div>
  );
}