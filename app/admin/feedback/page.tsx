'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePermission } from '@/hooks/usePermission';
import '../../../styles/admin-feedback.css';

interface Feedback {
  id: number;
  name: string;
  email: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission, loading: permissionLoading } = usePermission('feedback');

  useEffect(() => {
    if (hasPermission) {
      fetchFeedback();
    }
  }, [hasPermission]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch('/api/feedback/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setFeedback(prev =>
        prev.map(item =>
          item.id === id ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const moveToTrash = async (id: number) => {
    if (!confirm('Переместить сообщение в корзину?')) return;
    try {
      await fetch('/api/feedback/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setFeedback(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error moving to trash:', error);
    }
  };

  // Проверка прав
  if (permissionLoading) return <div className="admin-loader">Загрузка...</div>;
  if (!hasPermission) return <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 80 }}>Нет доступа</div>;

  if (loading) return <div className="admin-loader">Загрузка...</div>;

  return (
    <div className="admin-feedback">
      <div className="admin-feedback-card">
        <div className="admin-feedback-header">
          <h1 className="admin-feedback-title">Обратная связь</h1>
          <div className="header-actions">
            <Link href="/admin/feedback/trash" className="btn-trash">
              🗑 Корзина
            </Link>
            <span className="admin-feedback-count">{feedback.length} сообщений</span>
          </div>
        </div>

        {feedback.length === 0 ? (
          <div className="admin-feedback-empty">Нет сообщений</div>
        ) : (
          <div className="feedback-list">
            {feedback.map(item => (
              <div key={item.id} className={`feedback-item ${!item.read ? 'unread' : ''}`}>
                <div className="feedback-header">
                  <span className="feedback-name">{item.name}</span>
                  {item.email && <span className="feedback-email">{item.email}</span>}
                  <span className="feedback-date">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="feedback-message-body">
                  {item.message}
                </div>
                <div className="feedback-actions">
                  {!item.read && (
                    <button onClick={() => markAsRead(item.id)} className="btn-read">
                      Отметить прочитанным
                    </button>
                  )}
                  <button onClick={() => moveToTrash(item.id)} className="btn-delete">
                    В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}