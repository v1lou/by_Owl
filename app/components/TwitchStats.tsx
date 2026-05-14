'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface TwitchStatsProps {
  heartStoneImage?: string;
}

interface TwitchStatsData {
  followers: number;
  isLive: boolean;
  gameName: string;
  title?: string;
  viewerCount: number;
}

async function fetchTwitchStats(): Promise<TwitchStatsData> {
  const response = await fetch('/api/twitch/stats');
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch Twitch stats');
  return data.data;
}

// Хук анимации счётчика
function useCountUp(target: number | undefined, duration = 1500) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    if (target === undefined) return;

    const from = startValueRef.current;
    const to = target;
    if (from === to) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        startValueRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

export default function TwitchStats({ heartStoneImage }: TwitchStatsProps) {
  const { t } = useTranslation();
  const twitchUrl = "https://www.twitch.tv/by_owl";

  const { data, isLoading, error, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['twitchStats'],
    queryFn: fetchTwitchStats,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30 * 1000,
    retry: 3,
  });

  const animatedFollowers = useCountUp(data?.followers);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('ru-RU') : null;

  const formatViewers = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <section className="stats-section" id="stats">
      <div className="stats-container">
        <div className="stats-grid">
          <div className={`heart-stone-container ${data?.isLive ? 'live' : ''}`}>
            <div className="heart-glow"></div>

            {heartStoneImage && (
              <Image
                src={heartStoneImage}
                alt="Heart Stone"
                fill
                className="heart-image"
                style={{ objectFit: 'contain' }}
                priority
              />
            )}

            {data?.isLive ? (
              <a href={twitchUrl} target="_blank" rel="noopener noreferrer" className="status-under-heart live">
                🔴
              </a>
            ) : (
              <div className="status-under-heart offline">⚫</div>
            )}

            <div className="stats-overlay stat-card twitch two-columns">
              <div className="stat-left">
                <div className="stat-value-wrapper">
                  {error ? (
                    <span className="stat-value error">?</span>
                  ) : (
                    <>
                      <span className="stat-value">
                        {isLoading ? '...' : animatedFollowers.toLocaleString()}
                      </span>
                      {isFetching && !isLoading && (
                        <span className="refreshing-indicator">⟳</span>
                      )}
                    </>
                  )}
                </div>
                <span className="stat-followers">{t('twitch.followers')}</span>
                {lastUpdated && !isLoading && !error && (
                  <span className="last-updated">обновлено: {lastUpdated}</span>
                )}
              </div>

              <a
                href={twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block', flex: 1 }}
                className="stat-right-link"
              >
                <div className="stat-right">
                  <div className={`stat-status ${data?.isLive ? 'live' : 'offline'}`}>
                    <span className="stat-status-text">
                      {error ? '⚠️ Ошибка' : isLoading ? '...' : data?.isLive ? t('twitch.online') : t('twitch.offline')}
                    </span>
                    {data?.isLive && !error && !isLoading && data.viewerCount > 0 && (
                      <span className="viewer-count">
                        👁 {formatViewers(data.viewerCount)} наблюдателей
                      </span>
                    )}
                  </div>
                  {data?.isLive && data?.gameName && !error && !isLoading && (
                    <span className="stream-game">{data.gameName}</span>
                  )}
                  {error && (
                    <span className="stream-game error-text">
                      {error instanceof Error ? error.message : 'Ошибка загрузки'}
                    </span>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
