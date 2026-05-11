// components/MovieSuggestionForm.tsx
// Вставь этот компонент в StreamsSection вместо блока "КНОПКА ЗАКАЗА ПРОСМОТРА ФИЛЬМОВ"
'use client';

import { useState } from 'react';

export default function MovieSuggestionForm() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/movie-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        setStatus('success');
        setTitle('');
        setTimeout(() => {
          setStatus('idle');
          setShowForm(false);
        }, 2500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <div className="movie-suggest-wrapper">
      {/* Кнопки в ряд */}
      <div className="bottom-order-btn">
        <button className="order-movie-btn-bottom suggest-toggle-btn" onClick={() => setShowForm(v => !v)}>
          <span>Предложка по фильмам</span>
          <span className="order-btn-arrow">{showForm ? '↑' : '→'}</span>
        </button>
      </div>

      {/* Форма — появляется при клике */}
      {showForm && (
        <div className="movie-suggest-form-container">
          <p className="movie-suggest-desc">
            Введите точное название фильма, сериала или аниме — именно так, как оно называется.
          </p>

          <div className="movie-suggest-input-row">
            <input
              className="movie-suggest-input"
              type="text"
              placeholder="Название фильма..."
              value={title}
              maxLength={200}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              className={`movie-suggest-submit ${status}`}
              onClick={handleSubmit}
              disabled={!title.trim() || status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? '...' : status === 'success' ? '✓' : status === 'error' ? '✗' : '→'}
            </button>
          </div>

          {status === 'success' && (
            <p className="movie-suggest-feedback success">Предложение по просмотру отправлено!</p>
          )}
          {status === 'error' && (
            <p className="movie-suggest-feedback error">Что-то пошло не так, попробуйте снова.</p>
          )}
        </div>
      )}
    </div>
  );
}
