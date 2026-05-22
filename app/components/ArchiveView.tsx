'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import FavoriteList from './FavoritesList';
import { useTranslation } from 'react-i18next';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const canEdit = isAdmin || isEditMode;
  
  const getInitialTab = (): TabType => {
    const tab = searchParams.get('tab');
    if (tab === 'favorites') return 'favorites';
    if (tab === 'suggest') return 'suggest';
    if (tab === 'order') return 'order';
    return 'watched';
  };
  
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [archiveData, setArchiveData] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Item[]>([]);
  
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestComment, setSuggestComment] = useState('');
  
  const [filter, setFilter] = useState<'all' | ContentType>('all');
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', type: 'movie' as ContentType, date: '', link: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', type: 'movie' as ContentType, date: '', link: '' });
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };

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
      toast.error('Ошибка загрузки данных');
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
    toast.success('Удалено из фаворитов', {
      duration: 2000,
      position: 'top-right',
    });
  };

  const isInFavorites = (itemId: number) => {
    return favorites.some(fav => fav.id === itemId);
  };

  const handleSuggestSubmit = async () => {
    if (!suggestTitle.trim()) {
      toast.error('Пожалуйста, укажите название', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    const toastId = toast.loading('Отправка...', {
      position: 'top-right',
    });
    
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
        toast.success('Спасибо! Ваше предложение отправлено', {
          id: toastId,
          duration: 3000,
          position: 'top-right',
        });
        setSuggestTitle('');
        setSuggestComment('');
      } else {
        toast.error('Ошибка при отправке. Попробуйте позже', {
          id: toastId,
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch {
      toast.error('Ошибка соединения. Попробуйте позже', {
        id: toastId,
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const refreshData = () => {
    fetchArchiveData();
    if (onDataChange) onDataChange();
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.date || !newItem.link) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      const res = await fetch('/api/data/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (res.ok) {
        toast.success('Запись добавлена');
        refreshData();
        setIsAdding(false);
        setNewItem({ title: '', type: 'movie', date: '', link: '' });
      } else {
        toast.error('Ошибка при добавлении');
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      toast.error('Ошибка при добавлении');
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
        toast.success('Запись обновлена');
        refreshData();
        if (isInFavorites(id)) {
          const updatedFavorites = favorites.map(fav => 
            fav.id === id ? { ...fav, ...editForm } : fav
          );
          saveFavoritesToStorage(updatedFavorites);
        }
        setEditingId(null);
      } else {
        toast.error('Ошибка при обновлении');
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      toast.error('Ошибка при обновлении');
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
        toast.success('Запись удалена');
        refreshData();
        if (isInFavorites(id)) {
          removeFromFavorites(id);
        }
      } else {
        toast.error('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Ошибка при удалении');
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
      <>
        <Toaster position="top-right" />
        <div className="archive-container-simple">
          <div className="archive-home-content">
            <div className="top-social-buttons">
              <a href="https://t.me/by_owl_vods" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://boosty.to/by_owl" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M15.58 0H8.42L0 8.42v7.16L8.42 24h7.16L24 15.58V8.42L15.58 0zm-1.4 16.4H9.82L7 12l2.82-4.4h4.36l1.54 2.4H11.5l-.92 1.42v.36l.92 1.42h4.22l1.54 2.4-2.08.8z"/>
                </svg>
              </a>
            </div>
            <div className="browser-frame">
              <div className="browser-address-bar">
                <div className="address-bar-inner">
                  <span className="address-bar-text">Загрузка...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(10, 10, 10, 0.95)',
            color: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '0.9rem',
            backdropFilter: 'blur(8px)',
          },
          success: {
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="archive-container-simple">
        <div className="left-panel">
<div className="top-social-buttons">
  <a 
    href="https://t.me/by_owl_vods" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="social-icon-btn telegram" 
    data-tooltip={t('archive.viewed.stream_recordings_telegram')}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  </a>
  <a 
    href="https://boosty.to/by_owl" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="social-icon-btn boosty" 
    data-tooltip={t('archive.viewed.stream_recordings_boosty')}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.58 0H8.42L0 8.42v7.16L8.42 24h7.16L24 15.58V8.42L15.58 0zm-1.4 16.4H9.82L7 12l2.82-4.4h4.36l1.54 2.4H11.5l-.92 1.42v.36l.92 1.42h4.22l1.54 2.4-2.08.8z"/>
    </svg>
  </a>
</div>
        </div>       
        <div className="archive-home-content">
          <div className="browser-frame">
            <div className="browser-tabs">
              <button 
                className={`browser-tab ${activeTab === 'watched' ? 'active' : ''}`}
                onClick={() => handleTabChange('watched')}
              >
                Просмотренное
              </button>
              <button 
                className={`browser-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => handleTabChange('favorites')}
              >
                Лист фаворитов
              </button>
              <button 
                className={`browser-tab ${activeTab === 'suggest' ? 'active' : ''}`}
                onClick={() => handleTabChange('suggest')}
              >
                Предложка
              </button>
              <button 
                className={`browser-tab ${activeTab === 'order' ? 'active' : ''}`}
                onClick={() => handleTabChange('order')}
              >
                Заказ фильма
              </button>
            </div>

            <div className="browser-address-bar">
              <div className="browser-address-input">
                <span>https://{getAddressBarText()}</span>
              </div>
              {canEdit && activeTab === 'watched' && (
                <div className="browser-actions">
                  <button 
                    className="admin-add-btn-browser" 
                    onClick={() => setIsAdding(true)}
                    title="Добавить запись"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Фиксированный заголовок с поиском и фильтрами - НЕ СКРОЛЛИТСЯ */}
            {activeTab === 'watched' && (
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
            )}
            
            {/* Скроллящийся контент */}
            <div className="browser-content">
              {activeTab === 'watched' && (
                <>
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
                            <div className="col-link"><a href={item.link} target="_blank" rel="noopener noreferrer">Смотреть</a></div>
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

              {activeTab === 'favorites' && <FavoriteList isAdmin={canEdit} />}

              {activeTab === 'suggest' && (
                <div className="suggest-container">
                  <div className="suggest-card">
                    <div className="suggest-description">
                      <p>Хотите посмотреть что-то особенное?</p>
                      <ul className="suggest-list">
                        <li>Пишите <strong>точное название</strong> фильма/сериала/аниме</li>
                        <li>Указывайте <strong>год выпуска</strong>, если есть несколько версий</li>
                        <li>Можете добавить <strong>комментарий</strong> или причину, почему стоит посмотреть</li>
                      </ul>
                    </div>

                    <div className="suggest-form-group">
                      <input 
                        type="text" 
                        className="suggest-input" 
                        placeholder="Название фильма/сериала/аниме" 
                        value={suggestTitle} 
                        onChange={(e) => setSuggestTitle(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSuggestSubmit()} 
                      />
                    </div>

                    <div className="suggest-form-group">
                      <textarea 
                        className="suggest-textarea" 
                        placeholder="Комментарий (почему стоит посмотреть? / примечание)" 
                        value={suggestComment} 
                        onChange={(e) => setSuggestComment(e.target.value)} 
                        rows={4} 
                      />
                    </div>

                    <button 
                      className="suggest-submit-btn" 
                      onClick={handleSuggestSubmit}
                      disabled={!suggestTitle.trim()}
                    >
                      Отправить
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'order' && (
                <div className="order-container">
                  <div className="order-card">
                    <div className="order-price">За донат 25 000₽ вы можете заказать просмотр чего-либо продолжительностью ∼ 2 часа</div>
                    
                    <div className="order-rules">
                      <div className="order-rule">
                        <span className="order-rule-text">
                          <p>Нельзя: контент 18+, политические темы и деструктивный контент.</p>
                          <p>Я могу попросить поменять заказ (последнее слово остается за мной).</p>
                          <p>Оптимальный день и время для просмотра выбираю я, это может быть в тот же день или на неделе. Я также определяю, где мы смотрим: на Twitch или Boosty (фильмы Warner Brothers смотрим только на Boosty).</p>
                        </span>
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
    </>
  );
}