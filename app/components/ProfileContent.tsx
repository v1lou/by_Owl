'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider';
import { usePermission } from '@/hooks/usePermission';
import { useEditMode } from '@/hooks/useEditMode';

type CosplayItem = {
  id: number;
  photos?: string[];
  characterImage: string;
  characterName: string;
  description: string;
  streamLink: string;
  coverPhoto?: string;
};

type Achievement = {
  id: number;
  title: string;
  event: string;
  year: number;
  description: string;
  photos: string[];
  coverPhoto?: string;
  link?: string;
};

type BioData = {
  achievements: Achievement[];
};

type FormData = {
  characterName: string;
  description: string;
  photos: string[];
  characterImage: string;
  streamLink: string;
  coverPhoto: string;
};

type AchievementFormData = {
  title: string;
  event: string;
  year: number;
  description: string;
  link: string;
  photos: string[];
  coverPhoto?: string;
};

const emptyForm: FormData = {
  characterName: '',
  description: '',
  photos: [],
  characterImage: '',
  streamLink: '',
  coverPhoto: '',
};

const emptyAchievementForm: AchievementFormData = {
  title: '',
  event: '',
  year: new Date().getFullYear(),
  description: '',
  link: '',
  photos: [],
  coverPhoto: '',
};

export default function ProfileContent() {
  const { t } = useTranslation();
  const { isAdmin } = usePermission();
  const isEditMode = useEditMode();
  const canEdit = isAdmin && isEditMode;

  const [activeTab, setActiveTab] = useState<'cosplays' | 'achievements'>('cosplays');

  const [cosplays, setCosplays] = useState<CosplayItem[]>([]);
  const [bio, setBio] = useState<BioData | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [sliderIndices, setSliderIndices] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<number | null>(null);
  const [achievementForm, setAchievementForm] = useState<AchievementFormData>(emptyAchievementForm);
  const [savingAchievement, setSavingAchievement] = useState(false);
  const [deleteAchievementConfirm, setDeleteAchievementConfirm] = useState<number | null>(null);
  const [uploadingAchievementPhoto, setUploadingAchievementPhoto] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const achievementPhotoInputRef = useRef<HTMLInputElement>(null);

  const cosplayDragIndex = useRef<number | null>(null);
  const [cosplayDragOverIndex, setCosplayDragOverIndex] = useState<number | null>(null);

  const achievementDragIndex = useRef<number | null>(null);
  const [achievementDragOverIndex, setAchievementDragOverIndex] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cosplaysRes, achievementsRes] = await Promise.all([
        fetch('/api/data/cosplays'),
        fetch('/api/data/achievements')
      ]);
      
      const cosplaysData = await cosplaysRes.json();
      const achievementsData = await achievementsRes.json();
      
      const mappedCosplays = cosplaysData.map((item: any) => ({
        ...item,
        photos: item.photos || (item.photo ? [item.photo] : []),
        coverPhoto: item.coverPhoto || (item.photos?.[0] || '')
      }));
      setCosplays(mappedCosplays);
      
      // ← Установка индексов слайдера на обложку (с безопасной проверкой)
      const initialIndices: Record<number, number> = {};
      mappedCosplays.forEach((item: CosplayItem) => {
        const photos = item.photos;
        // Проверяем, что photos существует, это массив, и в нём больше 1 элемента
        if (item.coverPhoto && Array.isArray(photos) && photos.length > 1) {
          const idx = photos.indexOf(item.coverPhoto);
          if (idx >= 0) initialIndices[item.id] = idx;
        }
      });
      setSliderIndices(initialIndices);
      
      const savedCovers = localStorage.getItem('achievement_covers');
      const covers = savedCovers ? JSON.parse(savedCovers) : {};
      const achievementsWithCovers = achievementsData.map((item: any) => ({
        ...item,
        coverPhoto: covers[item.id] || item.coverPhoto || (item.photos?.[0] || '')
      }));
      setBio({ achievements: achievementsWithCovers });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSliderIndex = (id: number) => sliderIndices[id] || 0;
  const setSliderIndex = (id: number, index: number) =>
    setSliderIndices(prev => ({ ...prev, [id]: index }));
  const nextImage = (id: number, total: number) => {
    if (total <= 1) return;
    setSliderIndex(id, (getSliderIndex(id) + 1) % total);
  };
  const prevImage = (id: number, total: number) => {
    if (total <= 1) return;
    setSliderIndex(id, (getSliderIndex(id) - 1 + total) % total);
  };

  async function fetchCosplays() {
    const res = await fetch('/api/data/cosplays');
    const data = await res.json();
    const items = data.map((item: any) => ({
      ...item,
      photos: item.photos || (item.photo ? [item.photo] : []),
      coverPhoto: item.coverPhoto || (item.photos?.[0] || '')
    }));
    setCosplays(items);
    
    // ← Установка индексов слайдера на обложку (с безопасной проверкой)
    const initialIndices: Record<number, number> = {};
    items.forEach((item: CosplayItem) => {
      const photos = item.photos;
      // Проверяем, что photos существует, это массив, и в нём больше 1 элемента
      if (item.coverPhoto && Array.isArray(photos) && photos.length > 1) {
        const idx = photos.indexOf(item.coverPhoto);
        if (idx >= 0) initialIndices[item.id] = idx;
      }
    });
    setSliderIndices(prev => ({ ...prev, ...initialIndices }));
  }

  async function fetchBio() {
    const res = await fetch('/api/data/achievements');
    const data = await res.json();
    const savedCovers = localStorage.getItem('achievement_covers');
    const covers = savedCovers ? JSON.parse(savedCovers) : {};
    const achievementsWithCovers = data.map((item: any) => ({
      ...item,
      coverPhoto: covers[item.id] || item.coverPhoto || (item.photos?.[0] || '')
    }));
    setBio({ achievements: achievementsWithCovers });
  }

  function handleCosplayDragStart(e: React.DragEvent, index: number) {
    cosplayDragIndex.current = index;
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  }

  function handleCosplayDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setCosplayDragOverIndex(index);
  }

  async function handleCosplayDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (cosplayDragIndex.current === null || cosplayDragIndex.current === dropIndex) {
      setCosplayDragOverIndex(null);
      return;
    }

    const newOrder = [...cosplays];
    const [moved] = newOrder.splice(cosplayDragIndex.current, 1);
    newOrder.splice(dropIndex, 0, moved);

    setCosplays(newOrder);
    cosplayDragIndex.current = null;
    setCosplayDragOverIndex(null);

    try {
      const res = await fetch('/api/data/cosplays/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newOrder.map(c => c.id) }),
      });
      
      if (!res.ok) {
        await fetchCosplays();
      }
    } catch (error) {
      console.error('Error saving order:', error);
      await fetchCosplays();
    }
  }

  function handleCosplayDragEnd() {
    cosplayDragIndex.current = null;
    setCosplayDragOverIndex(null);
  }

  function handleAchievementDragStart(e: React.DragEvent, index: number) {
    achievementDragIndex.current = index;
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  }

  function handleAchievementDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setAchievementDragOverIndex(index);
  }

  async function handleAchievementDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (achievementDragIndex.current === null || achievementDragIndex.current === dropIndex) {
      setAchievementDragOverIndex(null);
      return;
    }

    const achievementsList = bio?.achievements || [];
    const newOrder = [...achievementsList];
    const [moved] = newOrder.splice(achievementDragIndex.current, 1);
    newOrder.splice(dropIndex, 0, moved);

    setBio({ achievements: newOrder });
    achievementDragIndex.current = null;
    setAchievementDragOverIndex(null);

    try {
      const res = await fetch('/api/data/achievements/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newOrder.map(a => a.id) }),
      });

      if (!res.ok) {
        await fetchBio();
      }
    } catch (error) {
      console.error('Error saving order:', error);
      await fetchBio();
    }
  }

  function handleAchievementDragEnd() {
    achievementDragIndex.current = null;
    setAchievementDragOverIndex(null);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: CosplayItem) {
    setEditingId(item.id);
    setForm({
      characterName: item.characterName,
      description: item.description,
      photos: item.photos || [],
      characterImage: item.characterImage || '',
      streamLink: item.streamLink || '',
      coverPhoto: item.coverPhoto || (item.photos?.[0] || ''),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }
  
  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  }

  async function uploadAchievementFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'achievements');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhoto(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
    setUploadingPhoto(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadFile(file);
    if (url) setForm(prev => ({ ...prev, characterImage: url }));
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  function removePhoto(idx: number) {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  }

  function handleSetCosplayCover(url: string) {
    setForm(prev => ({ ...prev, coverPhoto: url }));
  }

  async function handleSave() {
    if (!form.characterName.trim()) return;
    setSaving(true);
    try {
      const payload = editingId 
        ? { ...form, id: editingId, coverPhoto: form.coverPhoto || form.photos[0] || '' }
        : { ...form, coverPhoto: form.coverPhoto || form.photos[0] || '' };
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/data/cosplays', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchCosplays();
        closeModal();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch('/api/data/cosplays', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      await fetchCosplays();
      setDeleteConfirm(null);
    }
  }

  function openCreateAchievement() {
    setEditingAchievementId(null);
    setAchievementForm(emptyAchievementForm);
    setAchievementModalOpen(true);
  }

  function openEditAchievement(achievement: Achievement) {
    setEditingAchievementId(achievement.id);
    setAchievementForm({
      title: achievement.title,
      event: achievement.event,
      year: achievement.year,
      description: achievement.description,
      link: achievement.link || '',
      photos: achievement.photos || [],
      coverPhoto: achievement.coverPhoto || (achievement.photos?.[0] || ''),
    });
    setAchievementModalOpen(true);
  }

  function closeAchievementModal() {
    setAchievementModalOpen(false);
    setEditingAchievementId(null);
    setAchievementForm(emptyAchievementForm);
  }

  async function handleAchievementPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingAchievementPhoto(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadAchievementFile(file);
      if (url) urls.push(url);
    }
    setAchievementForm(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
    setUploadingAchievementPhoto(false);
    if (achievementPhotoInputRef.current) achievementPhotoInputRef.current.value = '';
  }

  function removeAchievementPhoto(idx: number) {
    setAchievementForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  }

  const handleSetCoverPhoto = (url: string) => {
    setAchievementForm(prev => ({ ...prev, coverPhoto: url }));
  };

  async function handleSaveAchievement() {
    if (!achievementForm.title.trim()) return;
    setSavingAchievement(true);
    try {
      const finalCoverPhoto = achievementForm.coverPhoto || (achievementForm.photos[0] || '');
      const payload = editingAchievementId 
        ? { 
            id: editingAchievementId,
            title: achievementForm.title,
            event: achievementForm.event,
            year: achievementForm.year,
            description: achievementForm.description,
            link: achievementForm.link,
            photos: achievementForm.photos,
          }
        : {
            title: achievementForm.title,
            event: achievementForm.event,
            year: achievementForm.year,
            description: achievementForm.description,
            link: achievementForm.link,
            photos: achievementForm.photos,
          };
      const method = editingAchievementId ? 'PUT' : 'POST';
      const res = await fetch('/api/data/achievements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        const savedId = editingAchievementId || result.id;
        
        const savedCovers = localStorage.getItem('achievement_covers');
        const covers = savedCovers ? JSON.parse(savedCovers) : {};
        covers[savedId] = finalCoverPhoto;
        localStorage.setItem('achievement_covers', JSON.stringify(covers));
        
        await fetchBio();
        closeAchievementModal();
      } else {
        console.error('Save error');
      }
    } finally {
      setSavingAchievement(false);
    }
  }

  async function handleDeleteAchievement(id: number) {
    const res = await fetch('/api/data/achievements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const savedCovers = localStorage.getItem('achievement_covers');
      if (savedCovers) {
        const covers = JSON.parse(savedCovers);
        delete covers[id];
        localStorage.setItem('achievement_covers', JSON.stringify(covers));
      }
      await fetchBio();
      setDeleteAchievementConfirm(null);
    }
  }

  const achievements = bio?.achievements || [];

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        <div className="bio-card-horizontal" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          <div className="bio-info">
            <h2 className="bio-title">{t('about.title')}</h2>
            <p className="bio-greeting">{t('about.greeting')}</p>
            <p className="bio-description">{t('about.description')}</p>
            <div className="bio-details">
              <span className="bio-detail">{t('about.birthday')}: 18 {t('about.march')}</span>
              <span className="bio-detail">{t('about.city')}: {t('about.moscow')}</span>
              <span className="bio-detail">{t('about.streamingSince')}: 2016</span>
            </div>
            <div className="bio-signature">{t('about.signature')}</div>
          </div>
        </div>

        <div className="profile-browser-tabs">
          <button
            className={`profile-browser-tab ${activeTab === 'cosplays' ? 'active' : ''}`}
            onClick={() => setActiveTab('cosplays')}
          >
            {t('cosplay.gallery')}
          </button>
          <button
            className={`profile-browser-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            {t('achievements.title')}
          </button>
        </div>

        <div className="profile-hint">
          <span className="hint-text">Нажмите на карточку, чтобы посмотреть больше информации.</span>
        </div>

        {activeTab === 'cosplays' && (
          <div className="profile-browser-content">
            <div className="cosplay-gallery-vertical">
              {isEditMode && cosplays.length > 1 && (
                <p className="cosplay-drag-hint">٠࣪⭑ Перетащите карточки для изменения порядка ٠࣪⭑</p>
              )}

              {cosplays.length === 0 && !isLoading && (
                <div className="cosplay-empty-with-add">
                  <div className="cosplay-placeholder">{t('cosplay.empty')}</div>
                  {isEditMode && (
                    <button className="cosplay-add-card" onClick={openCreate}>
                      <div className="cosplay-add-icon">+</div>
                      <div className="cosplay-add-label">Добавить первый косплей</div>
                    </button>
                  )}
                </div>
              )}

              {cosplays.length > 0 && (
                <div className="cosplay-grid-full">
                  {cosplays.map((item, index) => {
                    const currentIdx = getSliderIndex(item.id);
                    const total = item.photos?.length || 1;
                    const hasMultiple = total > 1;
                    const isDragOver = cosplayDragOverIndex === index;

                    return (
                      <div
                        className={`cosplay-card ${isEditMode ? 'draggable' : ''} ${isDragOver ? 'drag-over' : ''}`}
                        key={item.id}
                        draggable={isEditMode}
                        onDragStart={(e) => handleCosplayDragStart(e, index)}
                        onDragOver={(e) => handleCosplayDragOver(e, index)}
                        onDrop={(e) => handleCosplayDrop(e, index)}
                        onDragEnd={handleCosplayDragEnd}
                      >
                        {isEditMode && (
                          <div className="cosplay-admin-controls">
                            <button className="cosplay-admin-edit-btn" onClick={() => openEdit(item)} title="Редактировать">✎</button>
                            {deleteConfirm === item.id ? (
                              <>
                                <button className="cosplay-admin-confirm-btn" onClick={() => handleDelete(item.id)}>✓</button>
                                <button className="cosplay-admin-cancel-btn" onClick={() => setDeleteConfirm(null)}>✕</button>
                              </>
                            ) : (
                              <button className="cosplay-admin-delete-btn" onClick={() => setDeleteConfirm(item.id)} title="Удалить">✕</button>
                            )}
                          </div>
                        )}

                        <div className="cosplay-card-grid">
                          <div className="card-image">
                            <ImageSlider
                              images={item.photos}
                              characterName={item.characterName}
                              characterDescription={item.description}
                              characterIcon={item.characterImage}
                              streamLink={item.streamLink}
                              currentIndex={currentIdx}
                              onIndexChange={(idx) => setSliderIndex(item.id, idx)}
                            />
                          </div>
                          <div className="card-info">
                            <img
                              src={item.characterImage}
                              alt={item.characterName}
                              className="character-icon"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <h3 className="character-name">{item.characterName}</h3>
                          </div>
                          <div className="card-arrows">
                            <button className={`slider-btn-mini ${!hasMultiple ? 'disabled' : ''}`} onClick={(e) => { e.stopPropagation(); prevImage(item.id, total); }} disabled={!hasMultiple}>🡐</button>
                            <span className="slider-counter">{currentIdx + 1} / {total}</span>
                            <button className={`slider-btn-mini ${!hasMultiple ? 'disabled' : ''}`} onClick={(e) => { e.stopPropagation(); nextImage(item.id, total); }} disabled={!hasMultiple}>🡒</button>
                          </div>
                          <div className="card-stream">
                            <a href={item.streamLink} target="_blank" rel="noopener noreferrer" className="stream-link" onClick={(e) => e.stopPropagation()}>
                              <span className="stream-link-text">{t('cosplay.watchStream')}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isEditMode && (
                    <button className="cosplay-add-card" onClick={openCreate}>
                      <div className="cosplay-add-icon">+</div>
                      <div className="cosplay-add-label">Добавить косплей</div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="profile-browser-content">
            <div className="achievements-grid-container">
              {isEditMode && achievements.length > 1 && (
                <p className="cosplay-drag-hint">٠࣪⭑ Перетащите карточки для изменения порядка ٠࣪⭑</p>
              )}

              {achievements.length === 0 && !isLoading && (
                <div className="achievements-empty-with-add">
                  <div className="achievements-placeholder">Достижения не добавлены</div>
                  {isEditMode && (
                    <button className="achievement-add-card" onClick={openCreateAchievement}>
                      <div className="achievement-add-icon">+</div>
                      <div className="achievement-add-label">Добавить первое достижение</div>
                    </button>
                  )}
                </div>
              )}

              {achievements.length > 0 && (
                <div className="achievements-grid-full">
                  {achievements.map((achievement, index) => {
                    const coverPhoto = achievement.coverPhoto 
                      ? achievement.coverPhoto 
                      : (achievement.photos && achievement.photos.length > 0 ? achievement.photos[0] : null);
                    
                    const otherPhotos = achievement.photos && achievement.photos.length > 0 
                      ? (achievement.coverPhoto 
                          ? achievement.photos.filter(p => p !== achievement.coverPhoto).slice(0, 3)
                          : achievement.photos.slice(1, 4))
                      : [];
                    const remainingPhotos = achievement.photos && achievement.photos.length > (achievement.coverPhoto ? 4 : 4)
                      ? (achievement.coverPhoto 
                          ? achievement.photos.filter(p => p !== achievement.coverPhoto).length - 3
                          : achievement.photos.length - 4)
                      : 0;
                    const isDragOver = achievementDragOverIndex === index;

                    return (
                      <div
                        key={achievement.id}
                        className={`achievement-card-horizontal ${isEditMode ? 'draggable' : ''} ${isDragOver ? 'drag-over' : ''}`}
                        draggable={isEditMode}
                        onDragStart={(e) => handleAchievementDragStart(e, index)}
                        onDragOver={(e) => handleAchievementDragOver(e, index)}
                        onDrop={(e) => handleAchievementDrop(e, index)}
                        onDragEnd={handleAchievementDragEnd}
                        onClick={() => setSelectedAchievement(achievement)}
                      >
                        {isEditMode && (
                          <div className="achievement-admin-controls">
                            <button
                              className="achievement-admin-edit-btn"
                              onClick={(e) => { e.stopPropagation(); openEditAchievement(achievement); }}
                              title="Редактировать"
                            >✎</button>
                            {deleteAchievementConfirm === achievement.id ? (
                              <>
                                <button
                                  className="achievement-admin-confirm-btn"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteAchievement(achievement.id); }}
                                >✓</button>
                                <button
                                  className="achievement-admin-cancel-btn"
                                  onClick={(e) => { e.stopPropagation(); setDeleteAchievementConfirm(null); }}
                                >✕</button>
                              </>
                            ) : (
                              <button
                                className="achievement-admin-delete-btn"
                                onClick={(e) => { e.stopPropagation(); setDeleteAchievementConfirm(achievement.id); }}
                                title="Удалить"
                              >✕</button>
                            )}
                          </div>
                        )}

                        <div className="achievement-cover">
                          {coverPhoto ? (
                            <img src={coverPhoto} alt={achievement.title} />
                          ) : (
                            <div className="achievement-cover-placeholder">✦</div>
                          )}
                        </div>

                        <div className="achievement-content">
                          <div className="achievement-header">
                            <span className="achievement-year">{achievement.year}</span>
                            <span className="achievement-event">{achievement.event}</span>
                          </div>
                          <h3 className="achievement-title">{achievement.title}</h3>
                          <p className="achievement-description">
                            {achievement.description.length > 120 
                              ? `${achievement.description.substring(0, 120)}...` 
                              : achievement.description}
                          </p>
                          
                          {otherPhotos.length > 0 && (
                            <div className="achievement-photos-preview">
                              {otherPhotos.map((photo, idx) => (
                                <img key={idx} src={photo} alt="" className="achievement-preview-photo" />
                              ))}
                              {remainingPhotos > 0 && (
                                <span className="achievement-more-photos">+{remainingPhotos}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isEditMode && (
                    <button className="achievement-add-card" onClick={openCreateAchievement}>
                      <div className="achievement-add-icon">+</div>
                      <div className="achievement-add-label">Добавить достижение</div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedAchievement && (
        <div className="achievement-modal-overlay" onClick={() => setSelectedAchievement(null)}>
          <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedAchievement(null)}>✕</button>
            <h3 className="modal-title">{selectedAchievement.title}</h3>
            <div className="modal-year">{selectedAchievement.year}</div>
            <div className="modal-event">{selectedAchievement.event}</div>
            <div className="modal-description">{selectedAchievement.description}</div>
            {selectedAchievement.photos && selectedAchievement.photos.length > 0 && (
              <div className="modal-photos">
                {selectedAchievement.photos.map((photo, idx) => (
                  <img key={idx} src={photo} alt={`Фото ${idx + 1}`} className="modal-photo" />
                ))}
              </div>
            )}
            {selectedAchievement.link && (
              <a href={selectedAchievement.link} target="_blank" rel="noopener noreferrer" className="modal-link">Подробнее →</a>
            )}
          </div>
        </div>
      )}

      {isEditMode && modalOpen && (
        <div className="admin-cosplay-modal-overlay" onClick={closeModal}>
          <div className="admin-cosplay-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Редактировать косплей' : 'Новый косплей'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-modal-field">
                <label>Имя персонажа *</label>
                <input type="text" placeholder="Например: Jinx, Mina, Emily..." value={form.characterName} onChange={e => setForm(prev => ({ ...prev, characterName: e.target.value }))} />
              </div>
              <div className="admin-modal-field">
                <label>Описание</label>
                <textarea placeholder="Расскажи про этот косплей..." value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
              </div>
              <div className="admin-modal-field">
                <label>Ссылка на стрим</label>
                <input type="text" placeholder="https://twitch.tv/..." value={form.streamLink} onChange={e => setForm(prev => ({ ...prev, streamLink: e.target.value }))} />
              </div>
              <div className="admin-modal-field">
                <label>Иконка персонажа</label>
                <div className="admin-cover-upload">
                  {form.characterImage && (
                    <div className="admin-cover-preview">
                      <img src={form.characterImage} alt="cover" />
                      <button onClick={() => setForm(prev => ({ ...prev, characterImage: '' }))}>✕</button>
                    </div>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                  <button className="admin-upload-btn" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                    {uploadingCover ? 'Загружаю...' : '↑ Загрузить иконку'}
                  </button>
                </div>
              </div>
              
              <div className="admin-modal-field">
                <label>Фотографии косплея</label>
                <div className="admin-photos-grid">
                  {form.photos.map((url, idx) => (
                    <div
                      key={idx}
                      className={`admin-photo-thumb ${form.coverPhoto === url ? 'selected-cover' : ''}`}
                      onClick={() => handleSetCosplayCover(url)}
                    >
                      <img src={url} alt={`photo ${idx + 1}`} />
                      <button
                        className="admin-photo-remove"
                        onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                      >✕</button>
                      {form.coverPhoto === url && (
                        <div className="cover-badge">Обложка</div>
                      )}
                    </div>
                  ))}
                  <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  <button className="admin-photo-add-btn" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                    {uploadingPhoto ? '...' : '+'}
                  </button>
                </div>
                <div className="admin-achievement-hint">
                  * Нажмите на фото, чтобы сделать его обложкой
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-modal-cancel" onClick={closeModal}>Отмена</button>
              <button className="admin-modal-save" onClick={handleSave} disabled={saving || !form.characterName.trim()}>
                {saving ? 'Сохраняю...' : editingId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditMode && achievementModalOpen && (
        <div className="admin-achievement-modal-overlay" onClick={closeAchievementModal}>
          <div className="admin-achievement-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-achievement-modal-header">
              <h2>{editingAchievementId ? 'Редактировать достижение' : 'Новое достижение'}</h2>
              <button className="admin-achievement-modal-close" onClick={closeAchievementModal}>✕</button>
            </div>
            <div className="admin-achievement-modal-body">
              <div className="admin-achievement-modal-field">
                <label>Название достижения *</label>
                <input type="text" placeholder="Например: Лучший косплей" value={achievementForm.title} onChange={e => setAchievementForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="admin-achievement-modal-field">
                <label>Мероприятие</label>
                <input type="text" placeholder="Например: Comic-Con Russia" value={achievementForm.event} onChange={e => setAchievementForm(prev => ({ ...prev, event: e.target.value }))} />
              </div>
              <div className="admin-achievement-modal-field">
                <label>Год</label>
                <input type="number" placeholder="2024" value={achievementForm.year} onChange={e => setAchievementForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))} />
              </div>
              <div className="admin-achievement-modal-field">
                <label>Описание</label>
                <textarea placeholder="Подробности о достижении..." value={achievementForm.description} onChange={e => setAchievementForm(prev => ({ ...prev, description: e.target.value }))} rows={4} />
              </div>
              <div className="admin-achievement-modal-field">
                <label>Ссылка (опционально)</label>
                <input type="text" placeholder="https://..." value={achievementForm.link} onChange={e => setAchievementForm(prev => ({ ...prev, link: e.target.value }))} />
              </div>
              <div className="admin-achievement-modal-field">
                <label>Фотографии</label>
                <div className="admin-achievement-photos-grid">
                  {achievementForm.photos.map((url, idx) => (
                    <div 
                      key={idx} 
                      className={`admin-achievement-photo-thumb ${achievementForm.coverPhoto === url ? 'selected-cover' : ''}`}
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleSetCoverPhoto(url);
                      }}
                    >
                      <img src={url} alt={`photo ${idx + 1}`} />
                      <button 
                        className="admin-achievement-photo-remove" 
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation(); 
                          removeAchievementPhoto(idx); 
                        }}
                      >✕</button>
                      {achievementForm.coverPhoto === url && (
                        <div className="cover-badge">Обложка</div>
                      )}
                    </div>
                  ))}
                  <input ref={achievementPhotoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAchievementPhotoUpload} />
                  <button 
                    className="admin-achievement-photo-add-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      achievementPhotoInputRef.current?.click();
                    }} 
                    disabled={uploadingAchievementPhoto}
                  >
                    {uploadingAchievementPhoto ? '...' : '+'}
                  </button>
                </div>
                <div className="admin-achievement-hint">
                  * Нажмите на фото, чтобы сделать его обложкой
                </div>
              </div>
            </div>
            <div className="admin-achievement-modal-footer">
              <button className="admin-achievement-modal-cancel" onClick={closeAchievementModal}>Отмена</button>
              <button className="admin-achievement-modal-save" onClick={handleSaveAchievement} disabled={savingAchievement || !achievementForm.title.trim()}>
                {savingAchievement ? 'Сохраняю...' : editingAchievementId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}