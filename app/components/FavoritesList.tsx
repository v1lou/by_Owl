'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';

type Movie = {
  id: number;
  title: string;
  link: string | null;
  description: string;
  order: number;
};

type Genre = {
  id: number;
  name: string;
  description: string;
  coverImage: string | null;
  order: number;
  movies: Movie[];
};

export default function FavoriteList() {
  const { isAdmin } = usePermission();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  
  // Модалка для редактирования
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formGenre, setFormGenre] = useState({ name: '', description: '', coverImage: '' });
  const [formMovie, setFormMovie] = useState({ title: '', link: '', description: '' });
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    const res = await fetch('/api/data/favorites');
    const data = await res.json();
    setGenres(data);
    setIsLoading(false);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'suggestions');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadFile(file);
    if (url) setFormGenre(prev => ({ ...prev, coverImage: url }));
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // CRUD Жанров
  const openCreateGenre = () => {
    setEditingGenre(null);
    setFormGenre({ name: '', description: '', coverImage: '' });
    setModalOpen(true);
  };

  const openEditGenre = (genre: Genre) => {
    setEditingGenre(genre);
    setFormGenre({
      name: genre.name,
      description: genre.description,
      coverImage: genre.coverImage || ''
    });
    setModalOpen(true);
  };

  const saveGenre = async () => {
    if (!formGenre.name.trim()) return;
    
    const method = editingGenre ? 'PUT' : 'POST';
    const res = await fetch('/api/data/favorites', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'genre',
        id: editingGenre?.id,
        name: formGenre.name,
        description: formGenre.description,
        coverImage: formGenre.coverImage
      })
    });
    
    if (res.ok) {
      await fetchGenres();
      setModalOpen(false);
    }
  };

  const deleteGenre = async (id: number) => {
    if (!confirm('Удалить этот жанр и все фильмы в нём?')) return;
    const res = await fetch('/api/data/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'genre', id })
    });
    if (res.ok) await fetchGenres();
  };

  // CRUD Фильмов
  const openCreateMovie = (genre: Genre) => {
    setEditingGenre(genre);
    setEditingMovie(null);
    setFormMovie({ title: '', link: '', description: '' });
    setModalOpen(true);
  };

  const openEditMovie = (genre: Genre, movie: Movie) => {
    setEditingGenre(genre);
    setEditingMovie(movie);
    setFormMovie({
      title: movie.title,
      link: movie.link || '',
      description: movie.description
    });
    setModalOpen(true);
  };

  const saveMovie = async () => {
    if (!formMovie.title.trim()) return;
    
    const method = editingMovie ? 'PUT' : 'POST';
    const res = await fetch('/api/data/favorites', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'movie',
        id: editingMovie?.id,
        genreId: editingGenre?.id,
        title: formMovie.title,
        link: formMovie.link,
        description: formMovie.description
      })
    });
    
    if (res.ok) {
      await fetchGenres();
      setModalOpen(false);
    }
  };

  const deleteMovie = async (movieId: number) => {
    if (!confirm('Удалить этот фильм?')) return;
    const res = await fetch('/api/data/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'movie', id: movieId })
    });
    if (res.ok) await fetchGenres();
  };

  // Drag-and-drop для фильмов внутри жанра
  const dragIndex = React.useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number, genre: Genre) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newMovies = [...genre.movies];
    const [moved] = newMovies.splice(dragIndex.current, 1);
    newMovies.splice(dropIndex, 0, moved);

    // Обновляем локально
    setGenres(prev => prev.map(g => 
      g.id === genre.id ? { ...g, movies: newMovies } : g
    ));

    dragIndex.current = null;
    setDragOverIndex(null);

    // Сохраняем порядок
    await fetch('/api/data/favorites/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'movies',
        genreId: genre.id,
        ids: newMovies.map(m => m.id)
      })
    });
  };

  if (isLoading) return <div className="favorites-loading">Загрузка...</div>;

  return (
    <div className="favorites-page">
      <div className="favorites-grid">
        {/* КАРТОЧКИ ЖАНРОВ */}
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="favorite-genre-card"
            onClick={() => setSelectedGenre(genre)}
          >
            {isAdmin && (
              <div className="genre-admin-controls">
                <button onClick={(e) => { e.stopPropagation(); openEditGenre(genre); }}>✎</button>
                <button onClick={(e) => { e.stopPropagation(); deleteGenre(genre.id); }}>✕</button>
              </div>
            )}
            {genre.coverImage && (
              <div className="genre-cover" style={{ backgroundImage: `url(${genre.coverImage})` }} />
            )}
            <div className="genre-info">
              <h3 className="genre-name">{genre.name}</h3>
              <p className="genre-description">{genre.description}</p>
              <div className="genre-movies-count">{genre.movies.length} фильмов</div>
            </div>
          </div>
        ))}

        {isAdmin && (
          <button className="add-genre-card" onClick={openCreateGenre}>
            <div className="add-icon">+</div>
            <div className="add-label">Добавить жанр</div>
          </button>
        )}
      </div>

      {/* МОДАЛКА С ЖАНРОМ И СПИСКОМ ФИЛЬМОВ */}
      {selectedGenre && (
        <div className="genre-modal-overlay" onClick={() => setSelectedGenre(null)}>
          <div className="genre-modal" onClick={(e) => e.stopPropagation()}>
            <button className="genre-modal-close" onClick={() => setSelectedGenre(null)}>✕</button>
            
            <div className="genre-modal-header">
              {selectedGenre.coverImage && (
                <div className="genre-modal-cover" style={{ backgroundImage: `url(${selectedGenre.coverImage})` }} />
              )}
              <h2>{selectedGenre.name}</h2>
              <p>{selectedGenre.description}</p>
            </div>

            <div className="movies-list">
              <div className="movies-header">
                <span className="movies-title">Список фильмов</span>
                {isAdmin && (
                  <button className="add-movie-btn" onClick={() => openCreateMovie(selectedGenre)}>+ Добавить</button>
                )}
              </div>
              
              <div className="movies-grid">
                {selectedGenre.movies.map((movie, idx) => (
                  <div
                    key={movie.id}
                    className={`movie-item ${isAdmin ? 'draggable' : ''}`}
                    draggable={isAdmin}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx, selectedGenre)}
                    onDragEnd={() => { dragIndex.current = null; setDragOverIndex(null); }}
                  >
                    <div className="movie-number">{idx + 1}.</div>
                    <div className="movie-info">
                      <div className="movie-title">{movie.title}</div>
                      <div className="movie-description">{movie.description}</div>
                      {movie.link && (
                        <a href={movie.link} target="_blank" rel="noopener noreferrer" className="movie-link">
                          Смотреть →
                        </a>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="movie-admin-controls">
                        <button onClick={() => openEditMovie(selectedGenre, movie)}>✎</button>
                        <button onClick={() => deleteMovie(movie.id)}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ (ЖАНР/ФИЛЬМ) */}
      {isAdmin && modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingGenre && !editingMovie ? (editingGenre ? 'Редактировать жанр' : 'Новый жанр') : (editingMovie ? 'Редактировать фильм' : 'Новый фильм')}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              {editingGenre && !editingMovie ? (
                // Форма жанра
                <>
                  <div className="admin-modal-field">
                    <label>Название жанра *</label>
                    <input type="text" value={formGenre.name} onChange={e => setFormGenre(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="admin-modal-field">
                    <label>Описание</label>
                    <textarea value={formGenre.description} onChange={e => setFormGenre(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                  </div>
                  <div className="admin-modal-field">
                    <label>Обложка</label>
                    <div className="admin-cover-upload">
                      {formGenre.coverImage && (
                        <div className="admin-cover-preview">
                          <img src={formGenre.coverImage} alt="cover" />
                          <button onClick={() => setFormGenre(prev => ({ ...prev, coverImage: '' }))}>✕</button>
                        </div>
                      )}
                      <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                      <button className="admin-upload-btn" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                        {uploadingCover ? 'Загружаю...' : '↑ Загрузить обложку'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Форма фильма
                <>
                  <div className="admin-modal-field">
                    <label>Название фильма/аниме *</label>
                    <input type="text" value={formMovie.title} onChange={e => setFormMovie(prev => ({ ...prev, title: e.target.value }))} />
                  </div>
                  <div className="admin-modal-field">
                    <label>Ссылка на стрим/VOD</label>
                    <input type="text" placeholder="https://twitch.tv/videos/..." value={formMovie.link} onChange={e => setFormMovie(prev => ({ ...prev, link: e.target.value }))} />
                  </div>
                  <div className="admin-modal-field">
                    <label>Описание</label>
                    <textarea value={formMovie.description} onChange={e => setFormMovie(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                  </div>
                </>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-modal-cancel" onClick={() => setModalOpen(false)}>Отмена</button>
              <button className="admin-modal-save" onClick={editingMovie ? saveMovie : saveGenre}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}