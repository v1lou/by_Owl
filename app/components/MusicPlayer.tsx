'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Track {
  id: number;
  title: string;
  src: string;
}

const TRACKS: Track[] = [
  { id: 1, title: 'UNKLE - With You In My Head', src: 'https://www.reverbnation.com/widget_code/html_widget/artist_9339822?widget_id=55&pwc[song_ids]=35401128&context_type=song&spoid=artist_9339822&pwc[size]=small' },
  { id: 2, title: 'Carter Burwell - I Know What You Are', src: 'https://www.reverbnation.com/widget_code/html_widget/artist_9339822?widget_id=55&pwc[song_ids]=35401358&context_type=song&spoid=artist_9339822&pwc[size]=small' },
  { id: 3, title: 'The Black Ghosts - Full Moon', src: 'https://www.reverbnation.com/widget_code/html_widget/artist_9339822?widget_id=55&pwc[song_ids]=35395575&context_type=song&spoid=artist_9339822&pwc[size]=small' },
  { id: 4, title: 'Blue Foundation - Eyes On Fire', src: 'https://www.reverbnation.com/widget_code/html_widget/artist_9339822?widget_id=55&pwc[song_ids]=35401164&context_type=song&spoid=artist_9339822&pwc[size]=small' },
  { id: 5, title: 'Muse OST Twilight - Supermassive Black Hole', src: 'https://www.reverbnation.com/widget_code/html_widget/artist_9339822?widget_id=55&pwc[song_ids]=35401165&context_type=song&spoid=artist_9339822&pwc[size]=small' },
  { id: 6, title: 'Twilight Soundtrack - Bellas Lullaby', src: 'https://www.reverbnation.com/widget_code/html_widget/artist_9339822?widget_id=55&pwc[song_ids]=35408593&context_type=song&spoid=artist_9339822&pwc[size]=small' },
];

export default function GothicMusicPlayer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const { t } = useTranslation();

  const stopSpinning = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimeRef.current = null;
  }, []);

  const startSpinning = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimeRef.current = null;

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        rotationRef.current = (rotationRef.current + (delta / 8000) * 360) % 360;
        if (discRef.current) {
          discRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startSpinning();
    } else {
      stopSpinning();
    }
    return () => stopSpinning();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev: boolean) => !prev);
  };

  const handleTrackChange = (newIndex: number) => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    setCurrentTrack(newIndex);
    setTimeout(() => setIsLoading(false), 500);
  };

  const nextTrack = () => handleTrackChange((currentTrack + 1) % TRACKS.length);
  const prevTrack = () => handleTrackChange((currentTrack - 1 + TRACKS.length) % TRACKS.length);

  const handleIframeLoad = () => setIsLoading(false);

  return (
    <div className="nav-music-wrapper">
      <img
        src="/images/bat_music.png"
        alt="Frame"
        className="disc-frame-overlay"
      />

      <div className="nav-music">
        <div className="gothic-music-cup">
          <div className="music-cup-container">
            <button
              ref={buttonRef}
              className={`music-cup-button ${isOpen ? 'active' : ''}`}
              onClick={togglePlayer}
              title="Music Player"
            >
              <div
                className="music-cup-icon"
                ref={discRef}
              >
                <Image
                  src="/images/disc8.png"
                  alt="Music player"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </button>

            <div
              className={`music-player-dropdown ${isOpen ? 'open' : ''}`}
              ref={dropdownRef}
            >
              <div className="music-player-content">
                <div className="reverbnation-wrapper">
                  {isLoading && (
                    <div className="player-loader-overlay">
                      <div className="player-spinner"></div>
                      <span className="player-loader-text">{t('music.loading')}...</span>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    key={currentTrack}
                    width="100%"
                    height="150"
                    src={TRACKS[currentTrack].src}
                    onLoad={handleIframeLoad}
                    style={{
                      width: '100%',
                      display: 'block',
                      backgroundColor: '#000',
                      border: 'none',
                      margin: 0,
                      padding: 0,
                      opacity: isLoading ? 0.3 : 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                </div>

                <div className="music-player-footer">
                  <span className="music-track-title">{TRACKS[currentTrack].title}</span>

                  <div className="music-track-controls">
                    <button className="music-track-prev" onClick={prevTrack}>🡐</button>
                    <span className="track-counter">{currentTrack + 1}/{TRACKS.length}</span>
                    <button className="music-track-next" onClick={nextTrack}>➝</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}