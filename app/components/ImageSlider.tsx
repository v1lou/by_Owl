'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageSliderProps {
  images?: string[];
  characterName?: string;
  characterDescription?: string;
  characterIcon?: string;
  streamLink?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ImageSlider({
  images,
  characterName,
  characterDescription,
  characterIcon,
  streamLink,
  currentIndex: externalIndex = 0,
  onIndexChange,
}: ImageSliderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeImages = Array.isArray(images)
    ? images.filter((img) => img && typeof img === 'string')
    : [];

  const activeIndex =
    safeImages.length > 0
      ? Math.max(0, Math.min(externalIndex, safeImages.length - 1))
      : 0;

  if (safeImages.length === 0) {
    return <div className="slider-placeholder">Нет фото</div>;
  }

  const normalizePath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    if (path.startsWith('/')) return path;
    return '/' + path;
  };

  const handleImageClick = () => {
    setModalIndex(activeIndex);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  const nextModalImage = () =>
    setModalIndex((prev) => (prev + 1) % safeImages.length);
  const prevModalImage = () =>
    setModalIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'ArrowLeft') prevModalImage();
      if (e.key === 'ArrowRight') nextModalImage();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="image-slider-wrapper">
      <div className="image-slider">
        {safeImages[activeIndex] && (
          <img
            src={normalizePath(safeImages[activeIndex])}
            alt={`Slide ${activeIndex + 1}`}
            onClick={handleImageClick}
            className="slider-image"
            draggable={false}
          />
        )}
      </div>

      {isModalOpen && isMounted &&
        createPortal(
          <div className="modal-overlay-portal" onClick={closeModal}>
            <div className="modal-container-portal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-image-section">
                <button className="modal-close-portal" onClick={closeModal}>✕</button>
                <div className="modal-image-wrapper">
                  <img
                    src={normalizePath(safeImages[modalIndex])}
                    alt={`Modal ${modalIndex + 1}`}
                    className="modal-image-portal"
                    draggable={false}
                  />
                </div>
                {safeImages.length > 1 && (
                  <div className="modal-nav-bottom">
<button className="modal-nav-btn" onClick={prevModalImage}>🡐</button>
<span className="modal-counter-portal">{modalIndex + 1} / {safeImages.length}</span>
<button className="modal-nav-btn" onClick={nextModalImage}>➝</button>
                  </div>
                )}
              </div>

              <div className="modal-info-section">
                <div className="modal-character-center">
                  {characterIcon && (
                    <img
                      src={normalizePath(characterIcon)}
                      alt={characterName}
                      className="modal-character-icon-large"
                    />
                  )}
                  <h3 className="modal-character-name-large">{characterName || 'Персонаж'}</h3>
                </div>
                <p className="modal-character-description">
                  {characterDescription || 'Описание отсутствует'}
                </p>
                {streamLink && streamLink !== '#' && (
                  <a href={streamLink} target="_blank" rel="noopener noreferrer" className="modal-stream-link">
                    Смотреть стрим →
                  </a>
                )}
                {safeImages.length > 1 && (
                  <div className="modal-thumbnails">
                    <h4>Другие фото:</h4>
                    <div className="thumbnails-grid">
                      {safeImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`thumbnail ${idx === modalIndex ? 'active' : ''}`}
                          onClick={() => setModalIndex(idx)}
                        >
                          <img src={normalizePath(img)} alt={`thumb ${idx + 1}`} draggable={false} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}