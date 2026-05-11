'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FeedbackForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.message.trim()) {
      showToast(t('footer.feedback.fillRequired') || 'Заполните имя и сообщение', 'error');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        showToast(t('footer.feedback.success') || 'Спасибо! Сообщение отправлено.', 'success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        showToast(data.error || t('footer.feedback.error') || 'Ошибка при отправке', 'error');
      }
    } catch {
      showToast(t('footer.feedback.error') || 'Ошибка при отправке', 'error');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <>
      <div className="footer-feedback">
        <h4 className="feedback-title">{t('footer.feedback.title') || 'Обратная связь'}</h4>
        <p className="feedback-text">{t('footer.feedback.text') || 'Напишите свои предложения, вопросы или сообщите об ошибке'}</p>
        
        <form onSubmit={handleSubmit} className="feedback-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('footer.feedback.name') || 'Ваше имя'}
            className="feedback-input"
            disabled={status === 'loading'}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('footer.feedback.email') || 'Email (необязательно)'}
            className="feedback-input"
            disabled={status === 'loading'}
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t('footer.feedback.message') || 'Сообщение...'}
            className="feedback-textarea"
            rows={2}
            disabled={status === 'loading'}
          />
          <button 
            type="submit" 
            className="feedback-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '...' : (t('footer.feedback.send') || 'Отправить')}
          </button>
        </form>
      </div>

      {/* Тост-уведомление */}
      {toast.show && (
        <div className={`feedback-toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}