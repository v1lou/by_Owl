'use client';

import '../../styles/admin-login.css';
import '../../styles/admin-panel.css';
import { useTranslation } from 'react-i18next';

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [isFullEditMode, setIsFullEditMode] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem('fullEditMode');
    setIsFullEditMode(saved === 'true');
  }, []);

  useEffect(() => {
    const nav = document.querySelector('.top-nav');
    const pageContainer = document.querySelector('.page-container');

    if (!session) {
      nav?.classList.add('hidden');
      pageContainer?.classList.add('no-padding');
      document.body.classList.add('admin-login-body');
    } else {
      nav?.classList.remove('hidden');
      pageContainer?.classList.remove('no-padding');
      pageContainer?.classList.add('with-nav-padding');
      document.body.classList.remove('admin-login-body');
    }

    return () => {
      nav?.classList.remove('hidden');
      pageContainer?.classList.remove('no-padding', 'with-nav-padding');
      document.body.classList.remove('admin-login-body');
    };
  }, [session]);

  if (status === "loading" && !session) {
    return <div className="admin-loader">Загрузка...</div>;
  }

  if (session) {
    return (
      <div className="admin-panel-container">
        <div className="admin-panel-card">
          <h1 className="admin-panel-title">{t('admin.panel')}</h1>

          <div className="admin-panel-user">
            <span className="admin-panel-email">✓ {session.user?.email}</span>
            <button onClick={() => signOut()} className="admin-panel-logout">
              {t('admin.log_out')}
            </button>
          </div>

          {}
          <div className="admin-panel-two-columns">
            {}
            <div className="admin-panel-col">
              <div className="admin-panel-section-header">
                <div className="admin-panel-section-line"></div>
                <span className="admin-panel-section-text">{t('admin.choice')}</span>
                <div className="admin-panel-section-line"></div>
              </div>

              <div className="admin-panel-actions">
                <button className="admin-panel-btn" onClick={() => {
                  // Включаем edit mode
                  localStorage.setItem('fullEditMode', 'true');
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'fullEditMode',
                    newValue: 'true',
                  }));
                  setIsFullEditMode(true);
                  // Переходим на страницу профиля
                  router.push('/profile');
                }}>{t('nav.profile')}</button>
                
                <button className="admin-panel-btn" onClick={() => {
                  localStorage.setItem('fullEditMode', 'true');
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'fullEditMode',
                    newValue: 'true',
                  }));
                  setIsFullEditMode(true);
                  router.push('/archive');
                }}>{t('nav.archive')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/socials')}>{t('socials.title')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/streams')}>{t('streams.title')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/community')}>{t('nav.community')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/merch')}>{t('merch.title')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/config')}>{t('nav.config')}</button>
              </div>
            </div>

            {}
            <div className="admin-panel-col">
              <div className="admin-panel-section-header">
                <div className="admin-panel-section-line"></div>
                <span className="admin-panel-section-text">{t('admin.monitoring')}</span>
                <div className="admin-panel-section-line"></div>
              </div>

              <div className="admin-panel-actions-vertical">
                <button className="admin-panel-btn" onClick={() => router.push('/admin/users')}>{t('admin.control')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/feedback')}>{t('admin.feedback')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/analytics')}>{t('admin.analytics')}</button>
                <button className="admin-panel-btn" onClick={() => router.push('/admin/movie-suggestions')}>{t('admin.suggestions')}</button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="admin-panel-edit-mode">
          <button
            className="edit-mode-switcher-btn"
            onClick={() => {
              const newMode = !isFullEditMode;
              setIsFullEditMode(newMode);
              localStorage.setItem('fullEditMode', String(newMode));
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'fullEditMode',
                newValue: String(newMode),
              }));
            }}
          >
            <span className={`switcher-option ${!isFullEditMode ? 'active' : ''}`}>
              {t('admin.browsing')}
            </span>
            <span className={`switcher-option ${isFullEditMode ? 'active' : ''}`}>
              {t('admin.editing')}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-icon">‧₊˚🕷‧₊˚</div>
            <h1 className="admin-login-title">Admin Panel</h1>
            <p className="admin-login-subtitle">Введите ваш email для входа</p>
          </div>

          {!sent ? (
            <div className="admin-login-form">
              {error && <div className="admin-login-error">Ошибка отправки</div>}
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-login-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setError(false);
                    signIn("email", { email, callbackUrl: "/admin", redirect: false })
                      .then(() => setSent(true))
                      .catch(() => setError(true));
                  }
                }}
              />
              <button
                onClick={async () => {
                  setError(false);
                  try {
                    await signIn("email", { email, callbackUrl: "/admin", redirect: false });
                    setSent(true);
                  } catch (err) {
                    setError(true);
                  }
                }}
                className="admin-login-btn"
              >
                Отправить ключ
              </button>
            </div>
          ) : (
            <div className="admin-login-success">
              <div className="admin-login-success-icon">°˖➴</div>
              <p>Письмо отправлено!</p>
              <p className="admin-login-success-text">Проверьте почту и кликните по ссылке</p>
            </div>
          )}

          <div className="admin-login-footer">
            <p className="admin-login-footer-text">blood bound</p>
          </div>
        </div>
      </div>
    </div>
  );
}