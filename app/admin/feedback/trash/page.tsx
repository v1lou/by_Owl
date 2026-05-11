'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../../../styles/admin-trash.css';

interface TrashItem {
  id: number;
  name: string;
  email: string | null;
  message: string;
  createdAt: string;
  deletedAt: string;
}

export default function AdminTrash() {
  const router = useRouter();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      const res = await fetch('/api/feedback/trash');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading trash:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (id: number) => {
    try {
      await fetch('/api/feedback/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error restoring:', error);
    }
  };

  const deletePermanent = async (id: number) => {
    try {
      await fetch('/api/feedback/delete-permanent', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting permanently:', error);
    }
  };

  const emptyTrash = async () => {
    try {
      await fetch('/api/feedback/empty-trash', {
        method: 'DELETE'
      });
      setItems([]);
      setShowEmptyModal(false);
    } catch (error) {
      console.error('Error emptying trash:', error);
    }
  };

  const closeModal = () => {
    router.back();
  };

  if (loading) return null;

  return (
    <div className="trash-modal-overlay" onClick={closeModal}>
      <div className="trash-modal-container" onClick={e => e.stopPropagation()}>
        <div className="trash-modal-header">
          <div className="trash-modal-title">
            <span className="title-icon">🗑</span>
            <span>Корзина</span>
          </div>
          <button className="trash-modal-close" onClick={closeModal}>×</button>
        </div>

        <div className="trash-modal-content">
          {items.length === 0 ? (
            <div className="trash-modal-empty">
              <div className="empty-icon">🗑</div>
              <div>Корзина пуста</div>
            </div>
          ) : (
            <>
              <div className="trash-modal-actions-header">
                <span className="trash-count">{items.length} сообщений</span>
                <button onClick={() => setShowEmptyModal(true)} className="btn-empty-trash-modal">
                  Очистить корзину
                </button>
              </div>
              <div className="trash-items-list">
                {items.map(item => (
                  <div key={item.id} className="trash-item-modal">
                    <div className="trash-header-modal">
                      <span className="trash-name">{item.name}</span>
                      {item.email && <span className="trash-email">{item.email}</span>}
                      <span className="trash-date">
                        Удалено: {new Date(item.deletedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="trash-message">
                      {item.message}
                    </div>
                    <div className="trash-actions-modal">
                      <button onClick={() => restoreItem(item.id)} className="btn-restore-modal">
                        Восстановить
                      </button>
                      <button onClick={() => deletePermanent(item.id)} className="btn-delete-modal">
                        Удалить навсегда
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения очистки */}
      {showEmptyModal && (
        <div className="modal-confirm-overlay" onClick={() => setShowEmptyModal(false)}>
          <div className="modal-confirm-content" onClick={e => e.stopPropagation()}>
            <h3>Очистить корзину</h3>
            <p>Вы уверены? Все сообщения в корзине будут удалены навсегда.</p>
            <div className="modal-confirm-buttons">
              <button className="modal-confirm-cancel" onClick={() => setShowEmptyModal(false)}>
                Отмена
              </button>
              <button className="modal-confirm-ok" onClick={emptyTrash}>
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}