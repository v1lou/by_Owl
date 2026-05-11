'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../../styles/admin-users.css';

const ALL_PERMISSIONS = [
  { key: 'feedback', label: 'Обратная связь' },
  { key: 'suggestions', label: 'Предложка фильмов' },
  { key: 'analytics', label: 'Аналитика совы' },
  { key: 'archive', label: 'Архив просмотров' },
  { key: 'streams', label: 'Записи стримов' },
  { key: 'merch', label: 'Мерч' },
  { key: 'cosplay', label: 'Профиль стримера' },
  { key: 'config', label: 'Конфигурация' },
];

interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: string;
  createdAt: string;
  invitedBy?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editPerms, setEditPerms] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const addUser = async () => {
    if (!newEmail.trim()) return;
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim(), role: newRole, permissions: newPerms }),
    });
    const d = await res.json();
    if (d.success) {
      setUsers(prev => [d.data, ...prev.filter(u => u.id !== d.data.id)]);
      setNewEmail('');
      setNewRole('viewer');
      setNewPerms([]);
    }
  };

  const saveEdit = async (id: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: editRole, permissions: editPerms }),
    });
    const d = await res.json();
    if (d.success) {
      setUsers(prev => prev.map(u => u.id === id ? d.data : u));
      setEditingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Удалить пользователя?')) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const togglePerm = (perm: string, current: string[], set: (p: string[]) => void) => {
    set(current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm]);
  };

  if (loading) return <div className="admin-users-loader">Загрузка...</div>;

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <button onClick={() => router.push('/admin')} className="admin-users-back-btn">
          ← Назад
        </button>
        <h1 className="admin-users-title">Управление доступом</h1>
      </div>

      {/* ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ */}
      <div className="admin-users-add-form">
        <p className="admin-users-add-label">ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ</p>
        <div className="admin-users-add-row">
          <input
            type="email"
            placeholder="email@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="admin-users-input"
          />
          <select value={newRole} onChange={e => setNewRole(e.target.value)} className="admin-users-select">
            <option value="viewer">Наблюдатель</option>
            <option value="editor">Редактор</option>
          </select>
          <button onClick={addUser} className="admin-users-add-btn">
            Добавить
          </button>
        </div>
        <div className="admin-users-perms-group">
          {ALL_PERMISSIONS.map(p => (
            <button
              key={p.key}
              onClick={() => togglePerm(p.key, newPerms, setNewPerms)}
              className={`admin-users-perm-btn ${newPerms.includes(p.key) ? 'active' : 'inactive'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* СПИСОК ПОЛЬЗОВАТЕЛЕЙ */}
      <div className="admin-users-list">
        {users.length === 0 && <div className="admin-users-empty">Пользователей пока нет</div>}
        {users.map(u => {
          const perms: string[] = JSON.parse(u.permissions || '[]');
          const isEditing = editingId === u.id;
          return (
            <div key={u.id} className="admin-users-card">
              <div className={`admin-users-card-row ${isEditing ? 'with-margin' : ''}`}>
                <span className="admin-users-email">{u.email}</span>
                <span className="admin-users-role-badge">
                  {u.role === 'editor' ? 'Редактор' : 'Наблюдатель'}
                </span>
                {!isEditing && (
                  <div className="admin-users-actions">
                    <button
                      onClick={() => {
                        setEditingId(u.id);
                        setEditRole(u.role);
                        setEditPerms(perms);
                      }}
                      className="admin-users-edit-btn"
                    >
                      Изменить
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="admin-users-delete-btn">
                      ×
                    </button>
                  </div>
                )}
                {isEditing && (
                  <div className="admin-users-actions">
                    <button onClick={() => saveEdit(u.id)} className="admin-users-save-btn">
                      Сохранить
                    </button>
                    <button onClick={() => setEditingId(null)} className="admin-users-cancel-btn">
                      Отмена
                    </button>
                  </div>
                )}
              </div>

              {/* Права — просмотр */}
              {!isEditing && perms.length > 0 && (
                <div className="admin-users-perms-list">
                  {perms.map(p => (
                    <span key={p} className="admin-users-perm-tag">
                      {ALL_PERMISSIONS.find(x => x.key === p)?.label || p}
                    </span>
                  ))}
                </div>
              )}

              {/* Редактирование */}
              {isEditing && (
                <div>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="admin-users-edit-select"
                  >
                    <option value="viewer">Наблюдатель</option>
                    <option value="editor">Редактор</option>
                  </select>
                  <div className="admin-users-edit-perms-group">
                    {ALL_PERMISSIONS.map(p => (
                      <button
                        key={p.key}
                        onClick={() => togglePerm(p.key, editPerms, setEditPerms)}
                        className={`admin-users-perm-btn ${editPerms.includes(p.key) ? 'active' : 'inactive'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}