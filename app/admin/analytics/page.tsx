'use client';

import '../../../styles/admin-analytics.css';
import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';

// Лейблы для элементов сайта
const CLICK_LABELS: Record<string, string> = {
  'discord-join':      'Discord — вступить',
  'subscriber-chat':   'Подписчик-чат',
  'twitch-subscribe':  'Twitch подписка',
  'boosty':            'Boosty',
  'telegram-vods':     'Telegram VOD',
  'merch':             'Мерч',
  'pc-config':         'ПК конфиг',
};

const PERSONA_LABELS: Record<string, string> = {
  ghost:            'Ghost',
  lurker:           'Lurker',
  explorer:         'Explorer',
  regular:          'Regular',
  addict:           'Addict',
  daylight_hunter:  'Daylight Hunter',
  merchant:         'Merchant',
  community_seeker: 'Community Seeker',
};

const SITE_SECTIONS = [
  { id: 'home',  label: 'Главная',    color: '#9b6d8c' },
  { id: 'socials',   label: 'Соцсети',    color: '#6d7ab5' },
  { id: 'community', label: 'Сообщество', color: '#5ba08a' },
  { id: 'merch',     label: 'Мерч',       color: '#c4883e' },
  { id: 'pc-config', label: 'ПК конфиг',  color: '#8e6db5' },
];

function HeatmapBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="heatmap-row">
      <div className="heatmap-label">{label}</div>
      <div className="heatmap-bar-wrap">
        <div
          className="heatmap-bar"
          style={{
            width: `${pct}%`,
            '--bar-color': color,
            '--bar-opacity': 0.3 + (pct / 100) * 0.7
          } as React.CSSProperties}
        />
        <span className="heatmap-count">{value}</span>
      </div>
    </div>
  );
}

function SiteHeatmap({ sections }: { sections: Record<string, number> }) {
  const max = Math.max(...Object.values(sections), 1);

  return (
    <div className="site-heatmap-wrap">
      <div className="site-schema">
        <div className="site-schema-nav">навигация</div>
        {SITE_SECTIONS.map(sec => {
          const count = sections[sec.id] || 0;
          const intensity = max > 0 ? count / max : 0;
          const radius = 8 + intensity * 32;
          return (
            <div key={sec.id} className="site-schema-section">
              <div className="site-schema-label">{sec.label}</div>
              {count > 0 && (
                <div
                  className="heat-blob"
                  style={{
                    width: radius * 2,
                    height: radius * 2,
                    '--blob-color': sec.color,
                    '--blob-opacity': 0.2 + intensity * 0.5,
                    '--blob-shadow-radius': radius,
                    '--blob-shadow-spread': radius / 2,
                  } as React.CSSProperties}
                />
              )}
              <div className="site-schema-count">{count > 0 ? count : '—'}</div>
            </div>
          );
        })}
      </div>

      <div className="heatmap-legend">
        <div className="legend-row">
          <div className="legend-cold" />
          <span>Мало активности</span>
        </div>
        <div className="legend-row">
          <div className="legend-hot" />
          <span>Много активности</span>
        </div>
      </div>
    </div>
  );
}

function HourChart({ data }: { data: { hour: number; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="hour-chart">
      {data.map(({ hour, count }) => {
        const h = hour % 12 || 12;
        const ampm = hour < 12 ? 'am' : 'pm';
        const pct = (count / max) * 100;
        const isNight = hour >= 22 || hour <= 4;
        return (
          <div key={hour} className="hour-col" title={`${hour}:00 — ${count} визитов`}>
            <div
              className={`hour-bar ${isNight ? 'hour-bar-night' : 'hour-bar-day'}`}
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {hour % 6 === 0 && (
              <div className="hour-label">{h}{ampm}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { hasPermission, loading: permissionLoading } = usePermission('analytics');

  const [owlStats, setOwlStats] = useState<any>(null);
  const [siteStats, setSiteStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'owl' | 'behavior' | 'heatmap'>('behavior');

  useEffect(() => {
    if (hasPermission) {
      const data = JSON.parse(localStorage.getItem('owl_analytics') || '[]');
      const byCategory: Record<string, number> = {};
      data.forEach((item: any) => {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      });
      setOwlStats({
        total: data.length,
        byCategory,
        lastDay: data.filter((d: any) => d.timestamp > Date.now() - 86400000).length,
        recent: data.slice(-10).reverse(),
      });

      fetch('/api/analytics')
        .then(r => r.json())
        .then(data => { setSiteStats(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [hasPermission]);

  const exportAll = () => {
    const data = {
      owl: localStorage.getItem('owl_analytics'),
      site: siteStats,
      exported: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_full_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Проверка прав
  if (permissionLoading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loader">Загрузка...</div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="analytics-page">
        <div className="analytics-loader">Нет доступа</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-header">
          <h1 className="analytics-title">Аналитика</h1>
          <div className="analytics-buttons">
            <button onClick={exportAll} className="btn-export">Экспорт</button>
          </div>
        </div>

        {/* Табы */}
        <div className="analytics-tabs">
          <button
            className={`analytics-tab ${tab === 'behavior' ? 'active' : ''}`}
            onClick={() => setTab('behavior')}
          >
            Поведение
          </button>
          <button
            className={`analytics-tab ${tab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setTab('heatmap')}
          >
            Карта сайта
          </button>
          <button
            className={`analytics-tab ${tab === 'owl' ? 'active' : ''}`}
            onClick={() => setTab('owl')}
          >
            Сова
          </button>
        </div>

        {/* ===== ТАБ: ПОВЕДЕНИЕ ===== */}
        {tab === 'behavior' && (
          <div className="analytics-body">
            {loading ? (
              <div className="analytics-loader">Загрузка...</div>
            ) : !siteStats ? (
              <div className="analytics-empty">Нет данных</div>
            ) : (
              <>
                <div className="stats-cards">
                  <div className="stat-card">
                    <h3>Посетителей</h3>
                    <p>{siteStats.overview.totalVisitors}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Всего визитов</h3>
                    <p>{siteStats.overview.totalVisits}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Возврат</h3>
                    <p>{siteStats.overview.returningRate}%</p>
                  </div>
                  <div className="stat-card">
                    <h3>Ночных сов</h3>
                    <p>{siteStats.overview.daylightOwls}</p>
                  </div>
                </div>

                <h2 className="section-title">Куда кликают чаще всего</h2>
                <div className="click-list">
                  {siteStats.topClicks.length === 0 && (
                    <div className="analytics-empty">Кликов пока нет — добавьте data-track атрибуты на элементы</div>
                  )}
                  {siteStats.topClicks.map(([key, count]: [string, number], i: number) => (
                    <div key={key} className="click-item">
                      <span className="click-rank">#{i + 1}</span>
                      <span className="click-name">{CLICK_LABELS[key] || key}</span>
                      <div className="click-bar-wrap">
                        <div
                          className="click-bar"
                          style={{ width: `${(count / siteStats.topClicks[0][1]) * 100}%` }}
                        />
                      </div>
                      <span className="click-count">{count}</span>
                    </div>
                  ))}
                </div>

                <h2 className="section-title">Типы посетителей</h2>
                <div className="persona-grid">
                  {Object.entries(siteStats.personaCounts)
                    .sort((a: any, b: any) => b[1] - a[1])
                    .map(([persona, count]: [string, any]) => (
                      <div key={persona} className="persona-card">
                        <div className="persona-name">{PERSONA_LABELS[persona] || persona}</div>
                        <div className="persona-count">{count}</div>
                        <div className="persona-pct">
                          {Math.round(count / siteStats.overview.totalVisitors * 100)}%
                        </div>
                      </div>
                    ))}
                </div>

                <h2 className="section-title">Когда заходят на сайт</h2>
                <div className="hour-chart-wrap">
                  <HourChart data={siteStats.hourActivity} />
                  <div className="hour-legend">
                    <span className="hour-legend-day">■ День</span>
                    <span className="hour-legend-night">■ Ночь (22:00–04:00)</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== ТАБ: КАРТА САЙТА ===== */}
        {tab === 'heatmap' && (
          <div className="analytics-body">
            {loading ? (
              <div className="analytics-loader">Загрузка...</div>
            ) : !siteStats ? (
              <div className="analytics-empty">Нет данных</div>
            ) : (
              <>
                <p className="analytics-hint">
                  Размер пятна = количество посетителей, просмотревших раздел
                </p>

                <SiteHeatmap sections={
                  Object.fromEntries(
                    siteStats.topSections.map(([k, v]: [string, number]) => [k, v])
                  )
                } />

                <h2 className="section-title">Детально по разделам</h2>
                <div className="heatmap-bars">
                  {(() => {
                    const sectionsMap = Object.fromEntries(
                      siteStats.topSections.map(([k, v]: [string, number]) => [k, v])
                    );
                    const max = Math.max(...Object.values(sectionsMap) as number[], 1);
                    return SITE_SECTIONS.map(sec => (
                      <HeatmapBar
                        key={sec.id}
                        label={sec.label}
                        value={(sectionsMap[sec.id] as number) || 0}
                        max={max}
                        color={sec.color}
                      />
                    ));
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== ТАБ: СОВА ===== */}
        {tab === 'owl' && owlStats && (
          <div className="analytics-body">
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Всего вопросов</h3>
                <p>{owlStats.total}</p>
              </div>
              <div className="stat-card">
                <h3>За 24 часа</h3>
                <p>{owlStats.lastDay}</p>
              </div>
            </div>

            <h2 className="section-title">По категориям</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Категория</th>
                  <th>Количество</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(owlStats.byCategory).map(([cat, count]) => (
                  <tr key={cat}>
                    <td>
                      {cat === 'age' && 'Возраст'}
                      {cat === 'schedule' && 'Расписание'}
                      {cat === 'cosplay' && 'Косплей'}
                      {cat === 'socials' && 'Соцсети'}
                      {cat === 'merch' && 'Мерч'}
                      {cat === 'achievements' && 'Достижения'}
                      {cat === 'gear' && 'Оборудование'}
                      {cat === 'other' && 'Другое'}
                    </td>
                    <td>{count as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="section-title">Последние 10 вопросов</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Вопрос</th>
                  <th>Категория</th>
                  <th>Время</th>
                </tr>
              </thead>
              <tbody>
                {owlStats.recent.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td>{item.question}</td>
                    <td>{item.category}</td>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {owlStats.recent.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty-state">Нет данных</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="analytics-clear-btn">
              <button
                onClick={() => {
                  if (confirm('Удалить всю аналитику Совы?')) {
                    localStorage.removeItem('owl_analytics');
                    window.location.reload();
                  }
                }}
                className="btn-clear"
              >
                Очистить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}