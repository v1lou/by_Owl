'use client';

import { useState, useEffect, useRef } from 'react';
import ObserverCharacter from './ObserverCharacter';
import { useTranslation } from 'react-i18next';
import '../../styles/community-links.css'
import '../../styles/observer-character.css';
import '../../styles/twitch-badges.css'

interface Badge {
  set_id: string;
  versions: {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
    title: string;
  }[];
}

interface Emote {
  id: string;
  name: string;
  images: {
    url_1x: string;
    url_2x: string;
    url_4x: string;
  };
  emote_type: string;
  tier?: string;
}

// Компонент карусели значков с drag/swipe
function BadgeCarousel({ badges }: { badges: any }) {
  const [current, setCurrent] = useState(0);
  const dragStart = useRef<number | null>(null);
  const isDragging = useRef(false);

  const PERIOD_GROUPS = [
    { label: '1 month — 9 months', ids: ['0', '2', '3', '6', '9'] },
    { label: '1 year — 3 years', ids: ['12', '18', '24', '30'] },
    { label: '3.5 years — 5 years', ids: ['36', '42', '48', '54', '60'] },
  ];

  if (!badges) return null;

  const groups = PERIOD_GROUPS.map(g => ({
    label: g.label,
    versions: badges.versions.filter((v: any) => g.ids.includes(v.id)),
  })).filter(g => g.versions.length > 0);

  const total = groups.length;
  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX;
    isDragging.current = false;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStart.current !== null && Math.abs(e.clientX - dragStart.current) > 5) {
      isDragging.current = true;
    }
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStart.current === null) return;
    const diff = e.clientX - dragStart.current;
    if (!isDragging.current && Math.abs(diff) < 40) {
    } else if (Math.abs(diff) > 40) {
      diff < 0 ? next() : prev();
    }
    dragStart.current = null;
    isDragging.current = false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    const diff = e.changedTouches[0].clientX - dragStart.current;
    if (Math.abs(diff) > 40) diff < 0 ? next() : prev();
    dragStart.current = null;
  };

  return (
    <div className="twitch-badge-carousel">
      <div
        className="twitch-badge-slide"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { dragStart.current = null; }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ cursor: 'grab', userSelect: 'none' }}
      >
        <div className="twitch-slide-title">{groups[current]?.label}</div>
        <div className="twitch-badge-grid">
          {groups[current]?.versions.map((v: any) => (
            <div key={v.id} className="twitch-badge-item">
              <div className="twitch-badge-img">
                <img src={v.image_url_4x} alt={v.title} loading="lazy" draggable={false} />
              </div>
              <div className="twitch-badge-label">{v.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="twitch-carousel-nav-centered">
        <button className="twitch-nav-btn" onClick={prev}>‹</button>
        <div className="twitch-nav-dots">
          {groups.map((_, i) => (
            <button
              key={i}
              className={`twitch-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <button className="twitch-nav-btn" onClick={next}>›</button>
      </div>
    </div>
  );
}

// Компонент карточки эмоута
function EmoteCard({ emote }: { emote: Emote }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const emoteName = emote.name.replace('byowl', '');
    try {
      await navigator.clipboard.writeText(emoteName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="twitch-emote-card">
      <div className="twitch-emote-img">
        <img src={emote.images.url_4x} alt={emote.name} loading="lazy" draggable={false} />
      </div>
      <div className="twitch-emote-info">
        <div className="twitch-emote-name">{emote.name.replace('byowl', '')}</div>
        <button className="twitch-emote-copy-btn" onClick={copyToClipboard}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// Компонент для эмоутов с размытием и раскрытием
function EmoteSection({ emotes, title, tagClass }: { emotes: Emote[], title: string, tagClass: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  if (emotes.length === 0) return null;

  const hasMore = emotes.length > 5;

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  return (
    <div className="twitch-tier-block" ref={sectionRef}>
      <div className={`twitch-tier-tag ${tagClass}`}>{title}</div>

      <div className={`twitch-emotes-wrapper ${!isExpanded && hasMore ? 'collapsed' : ''}`}>
        <div className="twitch-emotes-grid">
          {emotes.map((emote) => (
            <EmoteCard key={emote.id} emote={emote} />
          ))}
        </div>
        {!isExpanded && hasMore && <div className="twitch-emotes-fade" />}
      </div>

      {!isExpanded && hasMore && (
        <button className="twitch-emotes-expand-btn" onClick={handleExpand}>
          <span>Show all ({emotes.length})</span>
          <span className="expand-arrow">▼</span>
        </button>
      )}

      {isExpanded && hasMore && (
        <button className="twitch-emotes-collapse-btn" onClick={handleCollapse}>
          <span>Collapse</span>
          <span className="expand-arrow">▲</span>
        </button>
      )}
    </div>
  );
}

export default function CommunityLinks() {
  const [communityData, setCommunityData] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [twitchLoading, setTwitchLoading] = useState(true);
  const [twitchError, setTwitchError] = useState<string | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    // ИСПРАВЛЕНО: вместо /data/socials-data.json используем API роут
    fetch('/api/data/socials')
      .then(res => res.json())
      .then(data => setCommunityData(data))
      .catch(err => console.error('Error loading community data:', err));
  }, []);

  useEffect(() => {
    const fetchTwitchAssets = async () => {
      try {
        const response = await fetch('/api/twitch-badges');
        const data = await response.json();
        
        if (data.success) {
          setBadges(data.badges || []);
          setEmotes(data.emotes || []);
        } else {
          setTwitchError(data.error || 'Loading error');
        }
      } catch (error) {
        setTwitchError(String(error));
      } finally {
        setTwitchLoading(false);
      }
    };

    fetchTwitchAssets();
  }, []);

  if (!communityData) {
    return <div className="community-section">Loading...</div>;
  }

  const subscriberBadges = badges.find(b => b.set_id === 'subscriber');

  const tier1Emotes = emotes.filter(e => e.emote_type === 'subscriptions' && e.tier === '1000');
  const tier2Emotes = emotes.filter(e => e.emote_type === 'subscriptions' && e.tier === '2000');
  const tier3Emotes = emotes.filter(e => e.emote_type === 'subscriptions' && e.tier === '3000');
  const followerEmotes = emotes.filter(e => e.emote_type === 'follower');

  return (
    <section id="community" className="community-section">
      <div className="community-container">
        <h2 className="community-title">
          {t('community.title')}
        </h2>
        
        <div className="community-cards-layout">
          <div className="community-cards-left">
            <div className="discord-home-card">
              <div className="discord-card-content">
                <div className="discord-info">
                  <h3>Discord Server</h3>
                  <p className="discord-description">
                    Discord канал с 2017 года, где все желающие могут заходить общаться, 
                    играть вместе в игры или смотреть в общей компании фильмы.
                  </p>
                  
                  <div className="discord-info-block">
                    <p className="info-text">
                      В текстовом канале roles можно самостоятельно выбрать роль по категории игры.
                    </p>
                  </div>

                  <div className="discord-details">
                    <div className="detail-item">
                      <span className="detail-label">Role Millionaire</span>
                      <span className="detail-value">выдается всем, кто забустил канал</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Role Twitch Sub</span>
                      <span className="detail-value">выдается всем, кто купил подписку на Twitch</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Role Progression</span>
                      <span className="detail-value">chick → owlets → owl</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Roles girls / streamer</span>
                      <span className="detail-value">выдаются модераторами</span>
                    </div>
                  </div>

                  <div className="moderators-section">
                    <span className="detail-label">Moderators</span>
                    <div className="moderators-list">
                      <span>Даки (whxducky)</span>
                      <span>Фэня (fenya999)</span>
                      <span>Бодян (aptuctisreal)</span>
                    </div>
                  </div>

                  <a 
                    href="https://discord.gg/byowl" 
                    target="_blank" 
                    className="discord-link"
                    data-track="discord-join"
                  >
                    Join Discord →
                  </a>
                </div>
              </div>
            </div>

            <div className="subconf-card-minimal">
              <div className="subconf-content">
                <div className="subconf-info">
                  <h4>Subscriber Chat (Vampires)</h4>
                  <p>
                    Telegram конфа для подписчиков от 6 месяцев. 
                    Предупреждаю - психов туда не пускают. Заходите знакомиться!
                  </p>
                  <a 
                    href="https://t.me/oldboty_subs_bot?start=ttx05YZDkB" 
                    target="_blank" 
                    className="subconf-link"
                    data-track="subscriber-chat"
                  >
                    Access Subscriber Chat →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="community-cards-right">
            <ObserverCharacter />
          </div>
        </div>

        {!twitchLoading && !twitchError && (
          <div className="twitch-assets-minimal">
            <div className="twitch-divider">
              <div className="divider-line"></div>
              <a 
                href="https://www.twitch.tv/subs/by_owl" 
                target="_blank" 
                className="divider-subscribe-btn"
                data-track="twitch-subscribe"
              >
                Subscribe on Twitch
              </a>
              <div className="divider-line"></div>
            </div>

            <div className="twitch-badge-block">
              <div className="twitch-label">Subscriber Badges</div>
              <BadgeCarousel badges={subscriberBadges} />
            </div>

            <div className="twitch-emotes-block">
              <div className="twitch-label">Subscriber Emotes</div>
              <div className="twitch-note">
                Copy emote names and use them in chat if you're a subscriber
              </div>
              <div className="twitch-emotes-container">
                <EmoteSection emotes={tier1Emotes} title="Tier 1" tagClass="tier1-tag" />
                <EmoteSection emotes={tier2Emotes} title="Tier 2" tagClass="tier2-tag" />
                <EmoteSection emotes={tier3Emotes} title="Tier 3" tagClass="tier3-tag" />
                {followerEmotes.length > 0 && (
                  <EmoteSection emotes={followerEmotes} title="Followers" tagClass="follower-tag" />
                )}
              </div>
            </div>
          </div>
        )}

        {twitchLoading && (
          <div className="twitch-loading-minimal">
            <span>✦</span> Loading Twitch assets... <span>✦</span>
          </div>
        )}

        {twitchError && (
          <div className="twitch-error-minimal">
            <div>Unable to load badges</div>
          </div>
        )}
      </div>
    </section>
  );
}