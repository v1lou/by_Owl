'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import FeedbackForm from './FeedbackForm';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-top">
        
        {}
        <div className="footer-logo-col">
          <Image 
            src="/images/logo-small.png"
            alt="by_0wl logo"
            width={56}
            height={56}
            className="footer-logo"
          />
        </div>

        {}
        <div className="footer-nav-col">
          <span className="footer-nav-title">{t('footer.nav.socials')}</span>
          <a href="https://www.twitch.tv/by_owl" target="_blank" rel="noopener noreferrer">Twitch</a>
          <a href="https://t.me/byowl" target="_blank" rel="noopener noreferrer">{t('footer.nav.telegram_nain')}</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Instagram*</a>
          <a href="#" target="_blank" rel="noopener noreferrer">{t('footer.nav.channel_youtube')}</a>
          <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
        </div>

        <div className="footer-nav-col">
          <span className="footer-nav-title">{t('footer.nav.donations')}</span>
          <a href="#" target="_blank" rel="noopener noreferrer">DonationAlerts</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Boosty</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Криптодонат</a>
          <a href="#" target="_blank" rel="noopener noreferrer">{t('footer.nav.subscription_twitch')}</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Ковры</a>
        </div>

        {}
        <div className="footer-form-col">
          <FeedbackForm />
        </div>

      </div>

      {}
      <div className="footer-signature">
        <a href="https://t.me/v1lou" target="_blank" rel="noopener noreferrer">
          <Image 
            src="/images/v1lou_signature.png"
            alt="v1lou signature"
            width={100}
            height={38}
            className="footer-signature-img"
          />
        </a>
      </div>

      {}
      <div className="footer-bottom">
        <div className="footer-disclaimer">
          {t('footer.disclaimer_inst')}
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} by_0wl. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}