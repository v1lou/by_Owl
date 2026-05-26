'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

type ContentType = 'movie' | 'series' | 'anime';

type GenreItem = {
  id: number;
  title: string;
  type: ContentType;
  streamLink: string;
  description?: string;
  posterUrl?: string;
};

type Genre = {
  id: number;
  name: string;
  color: string;
  items: GenreItem[];
};

interface GenreManagerProps {
  isAdmin?: boolean;
}

const TYPE_LABELS: Record<ContentType, string> = {
  movie: 'Фильм',
  series: 'Сериал',
  anime: 'Аниме',
};

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#2d132c', '#1b4332', '#1a3a2a', '#3d2b1f',
  '#2c2c54', '#474747', '#1e3a5f', '#4a1942',
  '#8b0000', '#2f4f4f', '#4a0e4e', '#3a5a40',
];

export default function GenreManager({ isAdmin = false }: GenreManagerProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Модалка создания жанра
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreColor, setNewGenreColor] = useState('#1a1a2e');
  
  // Модалка добавления карточки
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<Genre | null>(null);
  const [editingItem, setEditingItem] = useState<GenreItem | null>(null);
  
  // Форма для карточки
  const [itemForm, setItemForm] = useState({
    title: '',
    type: 'movie' as ContentType,
    streamLink: '',
    description: '',
    posterUrl: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка жанров
  const fetchGenres = async () => {
    try {
      const res = await fetch('/api/genres');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGenres(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Ошибка загрузки жанров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Загрузка постера
  const uploadPoster = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'genres');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  };

  // Создание жанра
  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) {
      toast.error('Введите название жанра');
      return;
    }
    
    try {
      const res = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGenreName, color: newGenreColor })
      });
      
      if (res.ok) {
        toast.success(`Жанр «${newGenreName}» создан`);
        setShowGenreModal(false);
        setNewGenreName('');
        setNewGenreColor('#1a1a2e');
        fetchGenres();
      } else {
        toast.error('Ошибка создания жанра');
      }
    } catch {
      toast.error('Ошибка создания жанра');
    }
  };

  // Удаление жанра
  const handleDeleteGenre = async (id: number, name: string) => {
    if (!confirm(`Удалить жанр «${name}» и все карточки внутри?`)) return;
    
    try {
      const res = await fetch('/api/genres', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) {
        toast.success(`Жанр «${name}» удалён`);
        fetchGenres();
      } else {
        toast.error('Ошибка удаления');
      }
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  // Открытие модалки добавления карточки
  const openAddItemModal = (genre: Genre) => {
    setCurrentGenre(genre);
    setEditingItem(null);
    setItemForm({ title: '', type: 'movie', streamLink: '', description: '', posterUrl: '' });
    setShowItemModal(true);
  };

  // Открытие модалки редактирования карточки
  const openEditItemModal = (genre: Genre, item: GenreItem) => {
    setCurrentGenre(genre);
    setEditingItem(item);
    setItemForm({
      title: item.title,
      type: item.type,
      streamLink: item.streamLink,
      description: item.description || '',
      posterUrl: item.posterUrl || ''
    });
    setShowItemModal(true);
  };

  // Сохранение карточки
  const handleSaveItem = async () => {
    if (!itemForm.title.trim()) {
      toast.error('Введите название');
      return;
    }
    if (!itemForm.streamLink.trim()) {
      toast.error('Введите ссылку на стрим');
      return;
    }
    
    const url = editingItem ? '/api/genres/items' : '/api/genres/items';
    const method = editingItem ? 'PUT' : 'POST';
    const body = editingItem
      ? { id: editingItem.id, ...itemForm, genreId: currentGenre!.id }
      : { ...itemForm, genreId: currentGenre!.id };
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        toast.success(editingItem ? 'Карточка обновлена' : 'Карточка добавлена');
        setShowItemModal(false);
        fetchGenres();
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch {
      toast.error('Ошибка сохранения');
    }
  };

  // Удаление карточки
  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Удалить карточку?')) return;
    
    try {
      const res = await fetch('/api/genres/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId })
      });
      
      if (res.ok) {
        toast.success('Карточка удалена');
        fetchGenres();
      } else {
        toast.error('Ошибка удаления');
      }
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  // Загрузка постера в модалке
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadPoster(file);
    if (url) {
      setItemForm(prev => ({ ...prev, posterUrl: url }));
      toast.success('Постер загружен');
    } else {
      toast.error('Ошибка загрузки');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return <div className="genre-loading">Загрузка жанров...</div>;
  }

  return (
    <div className="genre-manager">
      {/* Кнопка добавления жанра */}
      {isAdmin && (
        <div className="genre-add-button">
          <button onClick={() => setShowGenreModal(true)} className="btn-add-genre">
            Добавить жанр
          </button>
        </div>
      )}

      {/* Список жанров */}
      <div className="genres-list">
        {genres.length === 0 && (
          <div className="genres-empty">
            <p>Жанры ещё не созданы</p>
            {isAdmin && <p className="hint">Нажмите «Добавить жанр», чтобы начать</p>}
          </div>
        )}

        {genres.map((genre) => (
          <div key={genre.id} className="genre-card" style={{ backgroundColor: genre.color }}>
            <div className="genre-header">
              <h3 className="genre-title">{genre.name}</h3>
              <div className="genre-badge">{genre.items.length}</div>
              {isAdmin && (
                <div className="genre-actions">
                  <button onClick={() => handleDeleteGenre(genre.id, genre.name)} className="genre-delete" title="Удалить жанр">🗑</button>
                </div>
              )}
            </div>
            
            <div className="genre-items">
              {genre.items.length === 0 && (
                <div className="items-empty">Нет карточек</div>
              )}
              
              <div className="items-grid">
                {genre.items.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-poster" style={item.posterUrl ? { backgroundImage: `url(${item.posterUrl})` } : {}}>
                      {!item.posterUrl && (
                        <span className="item-no-poster">
                          {item.type === 'movie' && '🎬'}
                          {item.type === 'series' && '📺'}
                          {item.type === 'anime' && '🍥'}
                        </span>
                      )}
                      <span className={`item-type ${item.type}`}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    
                    <div className="item-info">
                      <div className="item-title">{item.title}</div>
                      {item.description && (
                        <div className="item-description">{item.description.slice(0, 60)}...</div>
                      )}
                      <div className="item-actions">
                        <a href={item.streamLink} target="_blank" rel="noopener noreferrer" className="item-link">
                          Смотреть →
                        </a>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEditItemModal(genre, item)} className="item-edit">✎</button>
                            <button onClick={() => handleDeleteItem(item.id)} className="item-delete">✕</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Кнопка добавления карточки */}
                {isAdmin && (
                  <button onClick={() => openAddItemModal(genre)} className="item-add-card">
                    <span>+</span>
                    <span className="add-text">Добавить</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модалка создания жанра */}
      {showGenreModal && (
        <div className="modal-overlay" onClick={() => setShowGenreModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Создать жанр</h2>
            
            <div className="modal-field">
              <label>Название жанра *</label>
              <input
                type="text"
                placeholder="Например: Киберпанк, Ужасы, Исекаи"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="modal-field">
              <label>Цвет фона</label>
              <div className="color-presets">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${newGenreColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGenreColor(color)}
                  />
                ))}
              </div>
              <div className="color-custom">
                <input
                  type="color"
                  value={newGenreColor}
                  onChange={(e) => setNewGenreColor(e.target.value)}
                />
                <span className="color-value">{newGenreColor}</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowGenreModal(false)}>Отмена</button>
              <button className="btn-save" onClick={handleCreateGenre}>Создать жанр</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка добавления/редактирования карточки */}
      {showItemModal && currentGenre && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Редактировать карточку' : `Добавить карточку в «${currentGenre.name}»`}</h2>
            
            <div className="modal-two-columns">
              <div className="modal-column">
                <div className="modal-field">
                  <label>Название *</label>
                  <input
                    type="text"
                    placeholder="Название фильма/сериала/аниме"
                    value={itemForm.title}
                    onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="modal-field">
                  <label>Тип</label>
                  <select
                    value={itemForm.type}
                    onChange={(e) => setItemForm(prev => ({ ...prev, type: e.target.value as ContentType }))}
                  >
                    <option value="movie">Фильм</option>
                    <option value="series">Сериал</option>
                    <option value="anime">Аниме</option>
                  </select>
                </div>
                
                <div className="modal-field">
                  <label>Ссылка на стрим *</label>
                  <input
                    type="text"
                    placeholder="https://twitch.tv/video/..."
                    value={itemForm.streamLink}
                    onChange={(e) => setItemForm(prev => ({ ...prev, streamLink: e.target.value }))}
                  />
                </div>
                
                <div className="modal-field">
                  <label>Описание</label>
                  <textarea
                    placeholder="Краткое описание..."
                    rows={3}
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="modal-column">
                <div className="modal-field">
                  <label>Постер/обложка</label>
                  <div
                    className="poster-drop"
                    onClick={() => fileInputRef.current?.click()}
                    style={itemForm.posterUrl ? { backgroundImage: `url(${itemForm.posterUrl})` } : {}}
                  >
                    {!itemForm.posterUrl && (
                      <span>{uploading ? 'Загрузка...' : '+ Загрузить постер'}</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePosterUpload}
                  />
                  {itemForm.posterUrl && (
                    <button className="remove-poster" onClick={() => setItemForm(prev => ({ ...prev, posterUrl: '' }))}>
                      Удалить постер
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowItemModal(false)}>Отмена</button>
              <button className="btn-save" onClick={handleSaveItem}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}