'use client';

import { useState, useEffect } from 'react';
import FavoriteList from './FavoritesList';

type ContentType = 'movie' | 'series' | 'anime';
type Item = { 
  id: number; 
  title: string; 
  type: ContentType; 
  date: string; 
  link: string;
  createdAt?: string;
  updatedAt?: string;
};

interface ArchiveViewProps {
  isAdmin?: boolean;
  isEditMode?: boolean;
  onDataChange?: () => void;
  onOpenOrderModal?: () => void;
}

type TabType = 'watched' | 'favorites' | 'suggest' | 'order';

export default function ArchiveView({ 
  isAdmin = false, 
  isEditMode = false, 
  onDataChange,
  onOpenOrderModal 
}: ArchiveViewProps) {
  const canEdit = isAdmin || isEditMode;
  
  const [activeTab, setActiveTab] = useState<TabType>('watched');
  const [archiveData, setArchiveData] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Item[]>([]);
  
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestComment, setSuggestComment] = useState('');
  const [suggestStatus, setSuggestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [suggestMessage, setSuggestMessage] = useState('');
  
  const [filter, setFilter] = useState<'all' | ContentType>('all');
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', type: 'movie' as ContentType, date: '', link: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', type: 'movie' as ContentType, date: '', link: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchiveData();
    loadFavoritesFromStorage();
  }, []);

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data/archive');
      const data = await response.json();
      setArchiveData(data);
    } catch (error) {
      console.error('Ошибка загрузки архива:', error);
      setArchiveData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesFromStorage = () => {
    const saved = localStorage.getItem('favoritesList');
    if (saved) {
      try {
        const favs = JSON.parse(saved);
        setFavorites(favs);
      } catch (e) {
        console.error('Ошибка загрузки фаворитов:', e);
        setFavorites([]);
      }
    }
  };

  const saveFavoritesToStorage = (newFavorites: Item[]) => {
    localStorage.setItem('favoritesList', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const removeFromFavorites = (itemId: number) => {
    const newFavorites = favorites.filter(fav => fav.id !== itemId);
    saveFavoritesToStorage(newFavorites);
  };

  const isInFavorites = (itemId: number) => {
    return favorites.some(fav => fav.id === itemId);
  };

  const handleSuggestSubmit = async () => {
    if (!suggestTitle.trim()) {
      setSuggestStatus('error');
      setSuggestMessage('Пожалуйста, укажите название');
      setTimeout(() => setSuggestStatus('idle'), 3000);
      return;
    }

    setSuggestStatus('loading');
    
    try {
      const res = await fetch('/api/movie-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestTitle.trim(),
          comment: suggestComment.trim() || 'Без комментария',
          timestamp: new Date().toISOString()
        }),
      });
      
      if (res.ok) {
        setSuggestStatus('success');
        setSuggestMessage('Спасибо! Ваша предложка отправлена ✦');
        setSuggestTitle('');
        setSuggestComment('');
        setTimeout(() => {
          setSuggestStatus('idle');
          setSuggestMessage('');
        }, 3000);
      } else {
        setSuggestStatus('error');
        setSuggestMessage('Ошибка при отправке. Попробуйте позже');
        setTimeout(() => setSuggestStatus('idle'), 3000);
      }
    } catch {
      setSuggestStatus('error');
      setSuggestMessage('Ошибка соединения. Попробуйте позже');
      setTimeout(() => setSuggestStatus('idle'), 3000);
    }
  };

  const refreshData = () => {
    fetchArchiveData();
    if (onDataChange) onDataChange();
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.date || !newItem.link) {
      alert('Заполните все поля');
      return;
    }

    try {
      const res = await fetch('/api/data/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (res.ok) {
        refreshData();
        setIsAdding(false);
        setNewItem({ title: '', type: 'movie', date: '', link: '' });
      } else {
        alert('Ошибка при добавлении');
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Ошибка при добавлении');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const res = await fetch('/api/data/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm })
      });

      if (res.ok) {
        refreshData();
        if (isInFavorites(id)) {
          const updatedFavorites = favorites.map(fav => 
            fav.id === id ? { ...fav, ...editForm } : fav
          );
          saveFavoritesToStorage(updatedFavorites);
        }
        setEditingId(null);
      } else {
        alert('Ошибка при обновлении');
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Ошибка при обновлении');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;

    try {
      const res = await fetch('/api/data/archive', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        refreshData();
        if (isInFavorites(id)) {
          removeFromFavorites(id);
        }
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении');
    }
  };

  const startEditing = (item: Item) => {
    setEditingId(item.id);
    setEditForm({ 
      title: item.title, 
      type: item.type, 
      date: item.date, 
      link: item.link 
    });
  };

  const filteredData = archiveData
    .filter(item => filter === 'all' || item.type === filter)
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === 'new'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const getAddressBarText = () => {
    switch (activeTab) {
      case 'watched':
        return 'архив.просмотров.com';
      case 'favorites':
        return 'архив.просмотров.com/фавориты';
      case 'suggest':
        return 'архив.просмотров.com/предложка';
      case 'order':
        return 'архив.просмотров.com/заказ';
      default:
        return 'архив.просмотров.com';
    }
  };

  if (loading) {
    return (
      <div className="archive-container-simple">
        <div className="side-buttons"></div>
        <div className="archive-home-content">
          <div className="archive-address-bar">
            <div className="address-bar-inner">
              <span className="address-bar-icon">🔒</span>
              <span className="address-bar-text">загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="archive-container-simple">
      <div className="side-buttons">
        <a href="https://t.me/by_owl_vods" target="_blank" rel="noopener noreferrer" className="side-btn telegram">
          <span>Telegram</span>
        </a>
        <a href="https://boosty.to/by_owl" target="_blank" rel="noopener noreferrer" className="side-btn boosty">
          <span>Boosty</span>
        </a>
      </div>

      <div className="archive-home-content">
        <div className="browser-frame">
          <div className="browser-tabs">
            <button 
              className={`browser-tab ${activeTab === 'watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('watched')}
            >
              Просмотренное
            </button>
            <button 
              className={`browser-tab ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              Лист фаворитов
            </button>
            <button 
              className={`browser-tab ${activeTab === 'suggest' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggest')}
            >
              Предложка
            </button>
            <button 
              className={`browser-tab ${activeTab === 'order' ? 'active' : ''}`}
              onClick={() => setActiveTab('order')}
            >
              Заказ фильма
            </button>
          </div>

          <div className="browser-address-bar">
            <div className="browser-address-input">
              <span>https://{getAddressBarText()}</span>
            </div>
          </div>

          <div className="browser-content">
            {activeTab === 'watched' && (
              <>
                <div className="archive-header">
                  <div className="archive-controls">
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Найти..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="filter-group">
                      <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Все</button>
                      <button className={filter === 'movie' ? 'active' : ''} onClick={() => setFilter('movie')}>Фильмы</button>
                      <button className={filter === 'series' ? 'active' : ''} onClick={() => setFilter('series')}>Сериалы</button>
                      <button className={filter === 'anime' ? 'active' : ''} onClick={() => setFilter('anime')}>Аниме</button>
                    </div>
                    <div className="sort-group">
                      <button className={sort === 'new' ? 'active' : ''} onClick={() => setSort('new')}>Новые ↓</button>
                      <button className={sort === 'old' ? 'active' : ''} onClick={() => setSort('old')}>Старые ↑</button>
                    </div>
                  </div>

                  <div className={`list-header ${canEdit ? 'with-actions' : ''}`}>
                    <div className="col-title">Название</div>
                    <div className="col-type">Тип</div>
                    <div className="col-date">Дата</div>
                    <div className="col-link">Ссылка</div>
                    {canEdit && <div className="col-actions">Действия</div>}
                  </div>
                </div>

                {canEdit && isAdding && (
                  <div className="admin-form">
                    <input type="text" placeholder="Название" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                    <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ContentType })}>
                      <option value="movie">Фильм</option>
                      <option value="series">Сериал</option>
                      <option value="anime">Аниме</option>
                    </select>
                    <input type="date" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} />
                    <input type="text" placeholder="Ссылка" value={newItem.link} onChange={(e) => setNewItem({ ...newItem, link: e.target.value })} />
                    <button onClick={handleAdd} className="admin-save-btn">Сохранить</button>
                    <button onClick={() => setIsAdding(false)} className="admin-cancel-btn">Отмена</button>
                  </div>
                )}

                <div className="archive-list-scroll-only">
                  {filteredData.map((item) => (
                    <div className={`list-row ${canEdit ? 'with-actions' : ''}`} key={item.id}>
                      {editingId === item.id && canEdit ? (
                        <>
                          <div className="col-title"><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                          <div className="col-type">
                            <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as ContentType })}>
                              <option value="movie">Фильм</option>
                              <option value="series">Сериал</option>
                              <option value="anime">Аниме</option>
                            </select>
                          </div>
                          <div className="col-date"><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} /></div>
                          <div className="col-link"><input type="text" value={editForm.link} onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} /></div>
                          <div className="col-actions">
                            <button onClick={() => handleUpdate(item.id)} className="admin-save-small">✓</button>
                            <button onClick={() => setEditingId(null)} className="admin-cancel-small">✗</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-title">{item.title}</div>
                          <div className="col-type"><span className={`type-badge ${item.type}`}>{item.type === 'movie' && 'Фильм'}{item.type === 'series' && 'Сериал'}{item.type === 'anime' && 'Аниме'}</span></div>
                          <div className="col-date">{item.date}</div>
                          <div className="col-link"><a href={item.link} target="_blank" rel="noopener noreferrer">Смотреть →</a></div>
                          {canEdit && (
                            <div className="col-actions">
                              <button onClick={() => startEditing(item)} className="admin-edit-btn">✎</button>
                              <button onClick={() => handleDelete(item.id)} className="admin-delete-btn">🗑</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {filteredData.length === 0 && <div className="no-results">Ничего не найдено</div>}
                </div>
              </>
            )}

            {activeTab === 'favorites' && <FavoriteList />}

            {activeTab === 'suggest' && (
              <div className="suggest-container">
                <div className="suggest-card">
                  <div className="suggest-description">
                    <p>Хотите, чтобы я посмотрел что-то особенное?</p>
                    <ul>
                      <li>Пишите <strong>точное название</strong> фильма/сериала/аниме</li>
                      <li>Указывайте <strong>год выпуска</strong>, если есть несколько версий</li>
                      <li>Можете добавить <strong>комментарий</strong> или причину, почему стоит посмотреть</li>
                    </ul>
                    <p style={{ marginTop: '10px', fontSize: '0.75rem', color: '#666' }}>Все предложки приходят мне в Telegram ✦</p>
                  </div>

                  <div className="suggest-form-group">
                    <input type="text" className="suggest-input" placeholder="Название фильма/сериала/аниме *" value={suggestTitle} onChange={(e) => setSuggestTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSuggestSubmit()} disabled={suggestStatus === 'loading'} />
                  </div>

                  <div className="suggest-form-group">
                    <textarea className="suggest-textarea" placeholder="Комментарий (почему стоит посмотреть? / примечание)" value={suggestComment} onChange={(e) => setSuggestComment(e.target.value)} disabled={suggestStatus === 'loading'} rows={4} />
                  </div>

                  <button className="suggest-submit-btn" onClick={handleSuggestSubmit} disabled={suggestStatus === 'loading' || !suggestTitle.trim()}>
                    {suggestStatus === 'loading' ? 'Отправка...' : 'Отправить предложку →'}
                  </button>

                  {suggestStatus !== 'idle' && <div className={`suggest-status ${suggestStatus}`}>{suggestMessage}</div>}

                  <div className="suggest-decoration">✦ ✦ ✦</div>
                </div>
              </div>
            )}

            {activeTab === 'order' && (
              <div className="order-container">
                <div className="order-card">
                  <div className="order-price">За донат 25 000₽ вы можете заказать просмотр чего-либо продолжительностью ~2 часа</div>
                  
                  <div className="order-rules">
                    <div className="order-rule">
                      <span className="rule-title">Нельзя:</span>
                      <span className="rule-text">контент 18+, политические темы и деструктивный контент.</span>
                    </div>
                    <div className="order-rule">
                      <span className="rule-title">Правила:</span>
                      <span className="rule-text">Я могу попросить поменять заказ (последнее слово остается за мной).</span>
                    </div>
                    <div className="order-rule">
                      <span className="rule-title">Организация:</span>
                      <span className="rule-text">Оптимальный день и время для просмотра выбираю я, это может быть в тот же день или на неделе. Я также определяю, где мы смотрим: на Twitch или Boosty (фильмы Warner Brothers смотрим только на Boosty).</span>
                    </div>
                  </div>

                  <div className="order-donate-links">
                    <a href="https://www.donationalerts.com/r/by_owl" target="_blank" rel="noopener noreferrer" className="order-donate-btn">DonationAlerts</a>
                    <a href="https://new.donatepay.ru/@by_owl" target="_blank" rel="noopener noreferrer" className="order-donate-btn">DonatePay (крипта)</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}