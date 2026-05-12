'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider';

type CosplayItem = {
  id: number;
  photos?: string[];
  photo?: string;
  characterImage: string;
  characterName: string;
  description: string;
  streamLink: string;
};

interface CosplayGalleryProps {
  cosplays: CosplayItem[];
}

export default function CosplayGallery({ cosplays }: CosplayGalleryProps) {
  const { t } = useTranslation();
  const [sliderIndices, setSliderIndices] = useState<Record<number, number>>({});

  const getSliderIndex = (id: number) => sliderIndices[id] || 0;
  const setSliderIndex = (id: number, index: number) =>
    setSliderIndices(prev => ({ ...prev, [id]: index }));

  const nextImage = (id: number, total: number) => {
    if (total <= 1) return;
    setSliderIndex(id, (getSliderIndex(id) + 1) % total);
  };
  const prevImage = (id: number, total: number) => {
    if (total <= 1) return;
    setSliderIndex(id, (getSliderIndex(id) - 1 + total) % total);
  };

  if (cosplays.length === 0) {
    return (
      <div className="cosplay-placeholder">
        {t('cosplay.empty') || 'Косплеи не найдены'}
      </div>
    );
  }

  return (
    <div className="cosplay-grid-full">
      {cosplays.map((item) => {
        const currentIdx = getSliderIndex(item.id);
        const total = item.photos?.length || 1;
        const hasMultiple = total > 1;

        return (
          <div className="cosplay-card" key={item.id}>
            <div className="cosplay-card-grid">
              <div className="card-image">
                <ImageSlider
                  images={item.photos}
                  characterName={item.characterName}
                  characterDescription={item.description}
                  characterIcon={item.characterImage}
                  streamLink={item.streamLink}
                  currentIndex={currentIdx}
                  onIndexChange={(idx) => setSliderIndex(item.id, idx)}
                />
              </div>

              <div className="card-info">
                <img
                  src={item.characterImage}
                  alt={item.characterName}
                  className="character-icon"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <h3 className="character-name">{item.characterName}</h3>
              </div>

              <div className="card-arrows">
                <button
                  className={`slider-btn-mini ${!hasMultiple ? 'disabled' : ''}`}
                  onClick={(e) => { e.stopPropagation(); prevImage(item.id, total); }}
                  disabled={!hasMultiple}
                >←</button>
                <span className="slider-counter">{currentIdx + 1} / {total}</span>
                <button
                  className={`slider-btn-mini ${!hasMultiple ? 'disabled' : ''}`}
                  onClick={(e) => { e.stopPropagation(); nextImage(item.id, total); }}
                  disabled={!hasMultiple}
                >→</button>
              </div>

              <div className="card-stream">
                <a
                  href={item.streamLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stream-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('cosplay.watchStream')}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
