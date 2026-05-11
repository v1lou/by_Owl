'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // ← ИСПРАВЛЕНО
import { usePermission } from '@/hooks/usePermission';
import '../../../styles/admin-movie-suggestions.css';

interface Suggestion {
  id: string;
  title: string;
  isFavorite: boolean;
  status: 'pending' | 'watched' | 'rejected';
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  watched: 'Посмотрено',
  rejected: 'Отклонено',
};

const STATUS_NEXT: Record<string, string> = {
  pending: 'watched',
  watched: 'rejected',
  rejected: 'pending',
};

export default function MovieSuggestionsAdminPage() {
  const router = useRouter();
  const { hasPermission, loading: permissionLoading } = usePermission('suggestions');

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'watched' | 'rejected' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');

  useEffect(() => {
    if (hasPermission) {
      fetch('/api/movie-suggestions')
        .then(r => r.json())
        .then(d => {
          if (d.success) setSuggestions(d.data);
        })
        .finally(() => setLoading(false));
    }
  }, [hasPermission]);

  const toggleFavorite = async (s: Suggestion) => {
    const updated = { ...s, isFavorite: !s.isFavorite };
    setSuggestions(prev => prev.map(x => x.id === s.id ? updated : x));
    await fetch('/api/movie-suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, isFavorite: updated.isFavorite }),
    });
  };

  const cycleStatus = async (s: Suggestion) => {
    const nextStatus = STATUS_NEXT[s.status];
    const updated = { ...s, status: nextStatus as Suggestion['status'] };
    setSuggestions(prev => prev.map(x => x.id === s.id ? updated : x));
    await fetch('/api/movie-suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, status: nextStatus }),
    });
  };

  const deleteSuggestion = async (id: string) => {
    setSuggestions(prev => prev.filter(x => x.id !== id));
    await fetch(`/api/movie-suggestions?id=${id}`, { method: 'DELETE' });
  };

  const filtered = useMemo(() => {
    let result = [...suggestions];

    if (filter === 'favorites') result = result.filter(s => s.isFavorite);
    else if (filter !== 'all') result = result.filter(s => s.status === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q));
    }

    if (sortBy === 'alpha') result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [suggestions, filter, search, sortBy]);

  const counts = useMemo(() => ({
    all: suggestions.length,
    pending: suggestions.filter(s => s.status === 'pending').length,
    watched: suggestions.filter(s => s.status === 'watched').length,
    rejected: suggestions.filter(s => s.status === 'rejected').length,
    favorites: suggestions.filter(s => s.isFavorite).length,
  }), [suggestions]);

  // Проверка прав
  if (permissionLoading) return <div className="ms-loader">Загрузка...</div>;
  if (!hasPermission) return <div className="ms-loader">Нет доступа</div>;

  if (loading) return <div className="ms-loader">✦</div>;

  return (
    <div className="ms-page">
      <div className="ms-container">
        <div className="ms-header">
          <button className="ms-back-btn" onClick={() => router.push('/admin')}>← Назад</button>
          <h1 className="ms-title">Предложка по фильмам</h1>
          <span className="ms-count-badge">{counts.all}</span>
        </div>

        <div className="ms-controls">
          <div className="ms-search-wrap">
            <span className="ms-search-icon">⌕</span>
            <input
              className="ms-search"
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ms-search-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <div className="ms-sort-wrap">
            <button
              className={`ms-sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => setSortBy('date')}
            >
              По дате
            </button>
            <button
              className={`ms-sort-btn ${sortBy === 'alpha' ? 'active' : ''}`}
              onClick={() => setSortBy('alpha')}
            >
              А → Я
            </button>
          </div>
        </div>

        <div className="ms-filters">
          {(['all', 'pending', 'watched', 'rejected', 'favorites'] as const).map(f => (
            <button
              key={f}
              className={`ms-filter-tab ${filter === f ? 'active' : ''} ${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Все' :
               f === 'favorites' ? '♥ Избранное' :
               STATUS_LABELS[f]}
              <span className="ms-filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="ms-empty">
            {search ? 'Ничего не найдено' : 'Предложок пока нет'}
          </div>
        ) : (
          <div className="ms-list">
            {filtered.map(s => (
              <div key={s.id} className={`ms-item status-${s.status} ${s.isFavorite ? 'is-favorite' : ''}`}>
                <div className="ms-item-home">
                  <span className="ms-item-title">{s.title}</span>
                  <span className="ms-item-date">
                    {new Date(s.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="ms-item-actions">
                  <button
                    className={`ms-action-btn favorite-btn ${s.isFavorite ? 'active' : ''}`}
                    onClick={() => toggleFavorite(s)}
                    title="Избранное"
                  >
                    {s.isFavorite ? '♥' : '♡'}
                  </button>

                  <button
                    className={`ms-action-btn status-btn status-${s.status}`}
                    onClick={() => cycleStatus(s)}
                    title="Сменить статус"
                  >
                    {STATUS_LABELS[s.status]}
                  </button>

                  <button
                    className="ms-action-btn delete-btn"
                    onClick={() => deleteSuggestion(s.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}