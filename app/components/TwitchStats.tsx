'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

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
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch Twitch stats');
  }
  
  return data.data;
}

export default function TwitchStats({ heartStoneImage }: TwitchStatsProps) {
  const { t } = useTranslation();
  const twitchUrl = "https://www.twitch.tv/by_owl";

  const { 
    data, 
    isLoading, 
    error,
    isFetching,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['twitchStats'],
    queryFn: fetchTwitchStats,
    refetchInterval: 60 * 1000,        // ← каждую минуту (было 5 минут)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30 * 1000,               // ← 30 секунд (было 4 минуты)
    retry: 3,
  });

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('ru-RU') : null;

  // Форматируем количество зрителей
  const formatViewers = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
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
              <a
                href={twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="status-under-heart live"
              >
                🔴
              </a>
            ) : (
              <div className="status-under-heart offline">
                ⚫
              </div>
            )}

            <div className="stats-overlay stat-card twitch two-columns">
              <div className="stat-left">
                <div className="stat-value-wrapper">
                  {isLoading ? (
                    <div className="stat-loader">✧</div>
                  ) : error ? (
                    <span className="stat-value error">?</span>
                  ) : (
                    <>
                      <span className="stat-value">
                        {data?.followers?.toLocaleString() || '0'}
                      </span>
                      {isFetching && !isLoading && (
                        <span className="refreshing-indicator">⟳</span>
                      )}
                    </>
                  )}
                </div>
                <span className="stat-followers">
                  {t('twitch.followers')}
                </span>
                {lastUpdated && !isLoading && !error && (
                  <span className="last-updated">
                    обновлено: {lastUpdated}
                  </span>
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
                      {error ? (
                        '⚠️ Ошибка'
                      ) : isLoading ? (
                        '...'
                      ) : (
                        data?.isLive ? t('twitch.online') : t('twitch.offline')
                      )}
                    </span>
                    {/* Количество зрителей (только если онлайн) */}
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
                    <span className="stream-game error-message">
                      {error instanceof Error ? error.message : 'Ошибка загрузки'}
                    </span>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stat-value-wrapper {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .refreshing-indicator {
          font-size: 12px;
          animation: spin 1s linear infinite;
          color: #a00303;
        }
        
        .last-updated {
          font-size: 9px;
          color: #666;
          margin-top: 4px;
          display: block;
        }
        
        .error-message {
          color: #ff4655;
          font-size: 11px;
        }
        
        .stat-status {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        
        .viewer-count {
          font-size: 11px;
          color: #888;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 20px;
          display: inline-block;
        }
        
        .stat-status.live .viewer-count {
          color: #e0d6c0;
          background: rgba(160, 3, 3, 0.15);
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}