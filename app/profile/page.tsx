'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../components/ImageSlider';
import { usePermission } from '@/hooks/usePermission';
import '../../styles/admin-cosplays.css';

type CosplayItem = {
  id: number;
  photos?: string[];
  characterImage: string;
  characterName: string;
  description: string;
  streamLink: string;
};

type Achievement = {
  id: number;
  title: string;
  event: string;
  year: number;
  description: string;
  photos: string[];
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
};

const emptyForm: FormData = {
  characterName: '',
  description: '',
  photos: [],
  characterImage: '',
  streamLink: '',
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { isAdmin } = usePermission();

  const [cosplays, setCosplays] = useState<CosplayItem[]>([]);
  const [bio, setBio] = useState<BioData | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [sliderIndices, setSliderIndices] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Модалка косплея
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Загрузка данных
  useEffect(() => {
    Promise.all([
      fetch('/api/data/cosplays')
        .then(r => r.json())
        .then(data => setCosplays(data.map((item: any) => ({
          ...item,
          photos: item.photos || (item.photo ? [item.photo] : [])
        }))))
        .catch(() => setCosplays([])),
      fetch('/api/data/bio')
        .then(r => r.json())
        .then(setBio)
        .catch(() => setBio(null)),
    ]).finally(() => setIsLoading(false));
  }, []);

  // Слайдер
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

  // CRUD операции
  async function fetchCosplays() {
    const res = await fetch('/api/data/cosplays');
    const data = await res.json();
    setCosplays(data.map((item: any) => ({
      ...item,
      photos: item.photos || (item.photo ? [item.photo] : [])
    })));
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

  async function handleSave() {
    if (!form.characterName.trim()) return;
    setSaving(true);
    try {
      const payload = editingId ? { ...form, id: editingId } : form;
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

  return (
    <div className="profile-page-wrapper">

      {/* ПРАВАЯ КОЛОНКА - ДОСТИЖЕНИЯ */}
      <div className="profile-right-column">
        {bio?.achievements && bio.achievements.length > 0 && (
          <div className="achievements-section">
            <h2 className="achievements-title">Достижения</h2>
            <div className="achievements-list">
              {bio.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="achievement-card"
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <div className="achievement-year">{achievement.year}</div>
                  <div className="achievement-event">{achievement.event}</div>
                  <div className="achievement-title">{achievement.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ЛЕВАЯ КОЛОНКА */}
      <div className="profile-left-column">

        {/* БИО */}
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

        {/* ГАЛЕРЕЯ КОСПЛЕЕВ */}
        <div className="cosplay-gallery-vertical">
          <h1 className="gothic-title" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            {t('cosplay.gallery')}
          </h1>

          {/* Показываем кнопку добавления и сообщение, если косплеев нет */}
          {cosplays.length === 0 && !isLoading && (
            <div className="cosplay-empty-with-add">
              <div className="cosplay-placeholder">
                {t('cosplay.empty') || 'Косплеи не найдены'}
              </div>
              {isAdmin && (
                <button className="cosplay-add-card" onClick={openCreate}>
                  <div className="cosplay-add-icon">+</div>
                  <div className="cosplay-add-label">Добавить первый косплей</div>
                </button>
              )}
            </div>
          )}

          {/* Если есть косплеи — показываем сетку */}
          {cosplays.length > 0 && (
            <div className="cosplay-grid-full">
              {cosplays.map((item) => {
                const currentIdx = getSliderIndex(item.id);
                const total = item.photos?.length || 1;
                const hasMultiple = total > 1;

                return (
                  <div className="cosplay-card" key={item.id}>
                    {/* Кнопки админа */}
                    {isAdmin && (
                      <div className="cosplay-admin-controls">
                        <button
                          className="cosplay-admin-edit-btn"
                          onClick={() => openEdit(item)}
                          title="Редактировать"
                        >✎</button>
                        {deleteConfirm === item.id ? (
                          <>
                            <button
                              className="cosplay-admin-confirm-btn"
                              onClick={() => handleDelete(item.id)}
                            >✓</button>
                            <button
                              className="cosplay-admin-cancel-btn"
                              onClick={() => setDeleteConfirm(null)}
                            >✕</button>
                          </>
                        ) : (
                          <button
                            className="cosplay-admin-delete-btn"
                            onClick={() => setDeleteConfirm(item.id)}
                            title="Удалить"
                          >✕</button>
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
                        <button
                          className={`slider-btn-mini ${!hasMultiple ? 'disabled' : ''}`}
                          onClick={(e) => { e.stopPropagation(); prevImage(item.id, total); }}
                          disabled={!hasMultiple}
                        >←</button>
                        <span className="slider-counter">{currentIdx + 1} / {total}</span>
                        <button
                          className={`slider-btn-mini ${!hasMultiple ? 'disabled' : ''}`}
                          onClick={(e) => { e.stopPropagation(); nextImage(item.id, total); }}
                          disabled={!hasMultiple}
                        >→</button>
                      </div>

                      <div className="card-stream">
                        <a
                          href={item.streamLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="stream-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t('cosplay.watchStream')}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* КАРТОЧКА ДОБАВЛЕНИЯ — ВСЕГДА В КОНЦЕ ДЛЯ АДМИНА */}
              {isAdmin && (
                <button className="cosplay-add-card" onClick={openCreate}>
                  <div className="cosplay-add-icon">+</div>
                  <div className="cosplay-add-label">Добавить косплей</div>
                </button>
              )}
            </div>
          )}

          {/* Показываем кнопку добавления отдельно, если косплеи есть и загрузка не идёт, но админ не видит её в сетке */}
          {isAdmin && cosplays.length === 0 && !isLoading && null}
        </div>
      </div>

      {/* МОДАЛКА ДОСТИЖЕНИЯ */}
      {selectedAchievement && (
        <div className="achievement-modal-overlay" onClick={() => setSelectedAchievement(null)}>
          <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedAchievement(null)}>×</button>
            <h3 className="modal-title">{selectedAchievement.title}</h3>
            <div className="modal-year">{selectedAchievement.year}</div>
            <div className="modal-event">{selectedAchievement.event}</div>
            <div className="modal-description">{selectedAchievement.description}</div>
            {selectedAchievement.link && (
              <a href={selectedAchievement.link} target="_blank" rel="noopener noreferrer" className="modal-link">
                Подробнее →
              </a>
            )}
            <div className="modal-decoration">✦</div>
          </div>
        </div>
      )}

      {/* МОДАЛКА КОСПЛЕЯ */}
      {isAdmin && modalOpen && (
        <div className="admin-cosplay-modal-overlay" onClick={closeModal}>
          <div className="admin-cosplay-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Редактировать косплей' : 'Новый косплей'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-field">
                <label>Имя персонажа *</label>
                <input
                  type="text"
                  placeholder="Например: Jinx, Mina, Emily..."
                  value={form.characterName}
                  onChange={e => setForm(prev => ({ ...prev, characterName: e.target.value }))}
                />
              </div>

              <div className="admin-modal-field">
                <label>Описание</label>
                <textarea
                  placeholder="Расскажи про этот косплей..."
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="admin-modal-field">
                <label>Ссылка на стрим</label>
                <input
                  type="text"
                  placeholder="https://twitch.tv/..."
                  value={form.streamLink}
                  onChange={e => setForm(prev => ({ ...prev, streamLink: e.target.value }))}
                />
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
                    <div key={idx} className="admin-photo-thumb">
                      <img src={url} alt={`photo ${idx + 1}`} />
                      <button className="admin-photo-remove" onClick={() => removePhoto(idx)}>✕</button>
                    </div>
                  ))}
                  <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  <button className="admin-photo-add-btn" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                    {uploadingPhoto ? '...' : '+'}
                  </button>
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
    </div>
  );
}