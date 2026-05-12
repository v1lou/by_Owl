'use client';

import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/admin-cosplays.css';

type CosplayItem = {
  id: number;
  characterName: string;
  description: string;
  photos: string[];
  characterImage: string | null;
  streamLink: string | null;
  order: number;
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

export default function AdminCosplayPage() {
  const [cosplays, setCosplays] = useState<CosplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCosplays();
  }, []);

  async function fetchCosplays() {
    setLoading(true);
    try {
      const res = await fetch('/api/data/cosplays');
      const data = await res.json();
      setCosplays(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    const res = await fetch(`${window.location.origin}/api/upload`, { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || data.path || null;
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
      const payload = editingId
        ? { ...form, id: editingId }
        : form;
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
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch('/api/data/cosplays', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchCosplays();
        setDeleteConfirm(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="admin-cosplay-page">
      <div className="admin-cosplay-header">
        <h1 className="admin-cosplay-title">Косплеи</h1>
        <p className="admin-cosplay-subtitle">{cosplays.length} образов</p>
      </div>

      {loading ? (
        <div className="admin-cosplay-loading">
          <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
        </div>
      ) : (
        <div className="admin-cosplay-grid">
          {cosplays.map((item) => (
            <div key={item.id} className="admin-cosplay-card">
              <div className="admin-card-cover">
                {item.characterImage ? (
                  <img src={item.characterImage} alt={item.characterName} />
                ) : item.photos?.[0] ? (
                  <img src={item.photos[0]} alt={item.characterName} />
                ) : (
                  <div className="admin-card-no-photo">✦</div>
                )}
                <div className="admin-card-overlay">
                  <button
                    className="admin-card-btn edit"
                    onClick={() => openEdit(item)}
                    title="Редактировать"
                  >✎</button>
                  {deleteConfirm === item.id ? (
                    <div className="admin-card-confirm">
                      <button className="admin-card-btn confirm-yes" onClick={() => handleDelete(item.id)}>✓</button>
                      <button className="admin-card-btn confirm-no" onClick={() => setDeleteConfirm(null)}>✕</button>
                    </div>
                  ) : (
                    <button
                      className="admin-card-btn delete"
                      onClick={() => setDeleteConfirm(item.id)}
                      title="Удалить"
                    >✕</button>
                  )}
                </div>
              </div>
              <div className="admin-card-info">
                <div className="admin-card-name">{item.characterName}</div>
                <div className="admin-card-meta">{item.photos?.length || 0} фото</div>
              </div>
            </div>
          ))}

          {/* Карточка добавления */}
          <button className="admin-cosplay-add-card" onClick={openCreate}>
            <div className="admin-add-icon">+</div>
            <div className="admin-add-label">Добавить косплей</div>
          </button>
        </div>
      )}

      {/* Модальное окно */}
      {modalOpen && (
        <div className="admin-cosplay-modal-overlay" onClick={closeModal}>
          <div className="admin-cosplay-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Редактировать косплей' : 'Новый косплей'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="admin-modal-body">
              {/* Название персонажа */}
              <div className="admin-modal-field">
                <label>Имя персонажа *</label>
                <input
                  type="text"
                  placeholder="Например: Jinx, Mina, Emily..."
                  value={form.characterName}
                  onChange={e => setForm(prev => ({ ...prev, characterName: e.target.value }))}
                />
              </div>

              {/* Описание */}
              <div className="admin-modal-field">
                <label>Описание</label>
                <textarea
                  placeholder="Расскажи про этот косплей..."
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Ссылка на стрим */}
              <div className="admin-modal-field">
                <label>Ссылка на стрим</label>
                <input
                  type="text"
                  placeholder="https://twitch.tv/..."
                  value={form.streamLink}
                  onChange={e => setForm(prev => ({ ...prev, streamLink: e.target.value }))}
                />
              </div>

              {/* Аватар персонажа */}
              <div className="admin-modal-field">
                <label>Иконка персонажа (аватар)</label>
                <div className="admin-cover-upload">
                  {form.characterImage && (
                    <div className="admin-cover-preview">
                      <img src={form.characterImage} alt="cover" />
                      <button onClick={() => setForm(prev => ({ ...prev, characterImage: '' }))}>✕</button>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleCoverUpload}
                  />
                  <button
                    className="admin-upload-btn"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? 'Загружаю...' : '↑ Загрузить иконку'}
                  </button>
                </div>
              </div>

              {/* Фотографии */}
              <div className="admin-modal-field">
                <label>Фотографии косплея</label>
                <div className="admin-photos-grid">
                  {form.photos.map((url, idx) => (
                    <div key={idx} className="admin-photo-thumb">
                      <img src={url} alt={`photo ${idx + 1}`} />
                      <button className="admin-photo-remove" onClick={() => removePhoto(idx)}>✕</button>
                    </div>
                  ))}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                  <button
                    className="admin-photo-add-btn"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? '...' : '+'}
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-modal-cancel" onClick={closeModal}>Отмена</button>
              <button
                className="admin-modal-save"
                onClick={handleSave}
                disabled={saving || !form.characterName.trim()}
              >
                {saving ? 'Сохраняю...' : editingId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
