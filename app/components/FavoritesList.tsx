'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import '../../styles/favorites.css';

type ContentType = 'movie' | 'series' | 'anime';

type GenreItem = {
  id: number;
  genreId: number;
  title: string;
  type: ContentType;
  streamLink: string;
  description?: string | null;
  posterUrl?: string | null;
  createdAt: string;
};

type Genre = {
  id: number;
  name: string;
  coverUrl: string | null;
  order: number;
  items: GenreItem[];
};

interface FavoriteListProps {
  isAdmin?: boolean;
}

const TYPE_LABELS: Record<ContentType, string> = {
  movie: '🎬 Фильм',
  series: '📺 Сериал',
  anime: '🍥 Аниме',
};

export default function FavoriteList({ isAdmin = false }: FavoriteListProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGenreId, setOpenGenreId] = useState<number | null>(null);

  const [showGenreModal, setShowGenreModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [showItemModal, setShowItemModal] = useState<{ genreId: number; item?: GenreItem } | null>(null);
  
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/genres');
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      setGenres(data);
    } catch (error) {
      console.error('Ошибка загрузки жанров:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const deleteFile = async (fileUrl: string | null) => {
    if (!fileUrl) return;
    try {
      await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      });
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
    }
  };

  const uploadCover = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    const ext = file.name.split('.').pop();
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
    const cleanFile = new File([file], cleanName, { type: file.type });
    
    fd.append('file', cleanFile);
    fd.append('folder', 'genre-covers');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  };

  const handleCreateGenre = async (name: string, coverUrl: string | null) => {
    try {
      const res = await fetch('/api/data/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, coverUrl }),
      });
      if (res.ok) {
        setShowGenreModal(false);
        fetchGenres();
      }
    } catch (error) {
      console.error('Ошибка создания жанра:', error);
    }
  };

  const handleUpdateGenre = async (name: string, coverUrl: string | null, oldCoverUrl: string | null) => {
    if (!editingGenre) return;
    
    try {
      if (oldCoverUrl && oldCoverUrl !== coverUrl) {
        await deleteFile(oldCoverUrl);
      }
      
      const res = await fetch('/api/data/genres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingGenre.id, name, coverUrl }),
      });
      if (res.ok) {
        setEditingGenre(null);
        fetchGenres();
      }
    } catch (error) {
      console.error('Ошибка обновления жанра:', error);
    }
  };

  const handleDeleteGenre = async (id: number, coverUrl: string | null) => {
    if (!confirm('Удалить жанр и все его карточки?')) return;
    
    try {
      if (coverUrl) {
        await deleteFile(coverUrl);
      }
      
      const res = await fetch('/api/data/genres', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        if (openGenreId === id) setOpenGenreId(null);
        fetchGenres();
      }
    } catch (error) {
      console.error('Ошибка удаления жанра:', error);
    }
  };

const handleCreateItem = async (data: {
  genreId: number;
  title: string;
  type: ContentType;
  streamLink: string;
  description?: string | null;
}) => {
  try {
    const res = await fetch('/api/data/genres/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, posterUrl: null }),
    });
    if (res.ok) {
      setShowItemModal(null);
      fetchGenres();
    }
  } catch (error) {
    console.error('Ошибка создания карточки:', error);
  }
};

const handleUpdateItem = async (
  data: {
    genreId: number;
    title: string;
    type: ContentType;
    streamLink: string;
    description?: string | null;
  },
  oldPosterUrl: string | null | undefined
) => {
  if (!showItemModal?.item) return;
  
  try {
    // Удаляем старый постер, если он был
    if (oldPosterUrl) {
      await deleteFile(oldPosterUrl);
    }
    
    const res = await fetch('/api/data/genres/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: showItemModal.item.id, ...data, posterUrl: null }),
    });
    if (res.ok) {
      setShowItemModal(null);
      fetchGenres();
    }
  } catch (error) {
    console.error('Ошибка обновления карточки:', error);
  }
};

const handleDeleteItem = async (id: number) => {
  if (!confirm('Удалить карточку?')) return;
  
  try {
    const res = await fetch('/api/data/genres/items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchGenres();
    }
  } catch (error) {
    console.error('Ошибка удаления карточки:', error);
  }
};

  if (loading) {
    return <div className="favorites-loading">Загрузка жанров...</div>;
  }

  return (
    <div className="favorites-page">
      {isAdmin && (
        <div className="favorites-add-genre">
          <button className="add-genre-btn" onClick={() => setShowGenreModal(true)}>
            + Добавить жанр
          </button>
        </div>
      )}

      <div className="favorites-accordion">
        {genres.length === 0 && (
          <div className="favorites-empty">
            <p>Жанры ещё не добавлены</p>
            {isAdmin && <p className="favorites-hint">Нажмите «+ Добавить жанр», чтобы создать первый жанр</p>}
          </div>
        )}

        {genres.map((genre) => (
          <div key={genre.id} className="genre-accordion-item">
            <div
              className="genre-accordion-header"
              style={{
                backgroundImage: genre.coverUrl ? `url(${genre.coverUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '160px'
              }}
            >
              <div className="genre-header-overlay-light"></div>
              <div className="genre-header-content">
                <div className="genre-header-left">
                  <h3 className="genre-name">{genre.name}</h3>
                  <span className="genre-count">{genre.items.length}</span>
                </div>
                <div className="genre-header-right">
                  {isAdmin && (
                    <div className="genre-admin-buttons">
                      <button onClick={(e) => { e.stopPropagation(); setEditingGenre(genre); setShowGenreModal(true); }} className="genre-edit">✎</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteGenre(genre.id, genre.coverUrl); }} className="genre-delete">✕</button>
                    </div>
                  )}
                  <button 
                    className="genre-expand-btn" 
                    onClick={() => setOpenGenreId(openGenreId === genre.id ? null : genre.id)}
                  >
                    <span className="genre-arrow">{openGenreId === genre.id ? '▲' : '▼'}</span>
                    <span className="expand-text">{openGenreId === genre.id ? 'Свернуть' : 'Показать'}</span>
                  </button>
                </div>
              </div>
            </div>

            {openGenreId === genre.id && (
              <div className="genre-accordion-content">
                {genre.items.length === 0 && (
                  <div className="genre-items-empty-list">Список пока пуст</div>
                )}
                
                <div className="genre-items-list-vertical">
                  {genre.items.map((item) => (
                    <div key={item.id} className="genre-item-row">
                      {/* Информация (без постера) */}
                      <div className="genre-item-info-full">
                        <div className="genre-item-title-vertical">{item.title}</div>
                        <div className="genre-item-type-badge">{TYPE_LABELS[item.type]}</div>
                        {item.description && (
                          <div className="genre-item-desc-vertical">{item.description}</div>
                        )}
                      </div>
                      
                      {/* Действия */}
                      <div className="genre-item-actions-vertical">
                        <a href={item.streamLink} target="_blank" rel="noopener noreferrer" className="genre-item-watch-btn">
                          Смотреть →
                        </a>
                        {isAdmin && (
                          <div className="genre-item-admin-buttons">
                            <button onClick={() => setShowItemModal({ genreId: genre.id, item })} className="item-edit">✎</button>
                            <button onClick={() => handleDeleteItem(item.id)} className="item-delete">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Кнопка добавления карточки */}
                  {isAdmin && (
                    <button className="add-item-row-btn" onClick={() => setShowItemModal({ genreId: genre.id })}>
                      + Добавить карточку
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Модалки */}
      {showGenreModal && (
        <GenreModal
          initial={editingGenre ? { name: editingGenre.name, coverUrl: editingGenre.coverUrl } : undefined}
          onSave={(name, coverUrl) => {
            if (editingGenre) {
              handleUpdateGenre(name, coverUrl, editingGenre.coverUrl);
            } else {
              handleCreateGenre(name, coverUrl);
            }
          }}
          onClose={() => {
            setShowGenreModal(false);
            setEditingGenre(null);
          }}
          uploadCover={uploadCover}
          uploadingCover={uploadingCover}
          setUploadingCover={setUploadingCover}
          coverInputRef={coverInputRef}
        />
      )}

      {showItemModal && (
        <ItemModal
          genreId={showItemModal.genreId}
          initial={showItemModal.item}
          onSave={(data) => {
            if (showItemModal.item) {
              handleUpdateItem(data, showItemModal.item.posterUrl);
            } else {
              handleCreateItem(data);
            }
          }}
          onClose={() => setShowItemModal(null)}
        />
      )}
    </div>
  );
}

// Модалка жанра
function GenreModal({
  initial,
  onSave,
  onClose,
  uploadCover,
  uploadingCover,
  setUploadingCover,
  coverInputRef,
}: {
  initial?: { name: string; coverUrl: string | null };
  onSave: (name: string, coverUrl: string | null) => void;
  onClose: () => void;
  uploadCover: (file: File) => Promise<string | null>;
  uploadingCover: boolean;
  setUploadingCover: (value: boolean) => void;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? '');

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadCover(file);
    if (url) setCoverUrl(url);
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{initial ? 'Редактировать жанр' : 'Новый жанр'}</h2>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-modal-field">
            <label>Название жанра *</label>
            <input
              type="text"
              placeholder="Например: Киберпанк, Ужасы, Комедия"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="admin-modal-field">
            <label>Обложка жанра (фон)</label>
            <div
              className="cover-upload-area"
              onClick={() => coverInputRef.current?.click()}
              style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!coverUrl && (
                <span>{uploadingCover ? 'Загрузка...' : '+ Загрузить обложку'}</span>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
            {coverUrl && (
              <button className="remove-cover-btn" onClick={() => setCoverUrl('')}>
                Удалить обложку
              </button>
            )}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-modal-cancel" onClick={onClose}>Отмена</button>
          <button className="admin-modal-save" onClick={() => onSave(name.trim(), coverUrl || null)} disabled={!name.trim()}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

// Модалка карточки (без постера)
function ItemModal({
  genreId,
  initial,
  onSave,
  onClose,
}: {
  genreId: number;
  initial?: GenreItem;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<ContentType>(initial?.type ?? 'movie');
  const [streamLink, setStreamLink] = useState(initial?.streamLink ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{initial ? 'Редактировать карточку' : 'Новая карточка'}</h2>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-modal-field">
            <label>Название *</label>
            <input
              type="text"
              placeholder="Название фильма/сериала/аниме"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="admin-modal-field">
            <label>Тип</label>
            <select value={type} onChange={(e) => setType(e.target.value as ContentType)}>
              <option value="movie">Фильм</option>
              <option value="series">Сериал</option>
              <option value="anime">Аниме</option>
            </select>
          </div>
          
          <div className="admin-modal-field">
            <label>Ссылка на стрим *</label>
            <input
              type="text"
              placeholder="https://..."
              value={streamLink}
              onChange={(e) => setStreamLink(e.target.value)}
            />
          </div>
          
          <div className="admin-modal-field">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-modal-cancel" onClick={onClose}>Отмена</button>
          <button
            className="admin-modal-save"
            onClick={() => onSave({ genreId, title, type, streamLink, description: description || null })}
            disabled={!title.trim() || !streamLink.trim()}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}