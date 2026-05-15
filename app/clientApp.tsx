'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import MusicPlayer from './components/MusicPlayer';
import LanguageSwitcher from './components/LanguageSwitcher';
import ScrollToTop from './components/Scroll';
import { OwlAssistant } from './components/OwlAssistant';
import ThemeSwitcher from './components/ThemeSwitcher';
import SoundToggle from './components/SoundToggle';
import { PageTransition } from './components/PageTransition';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ru } from '../locales/ru';
import { en } from '../locales/en';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { ru: { translation: ru }, en: { translation: en } },
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });
}

// Компонент для кнопки с переносом слов (кроме исключений)
const NavButton = ({ children, className, onClick, disabled }: any) => {
  // Список фраз, которые должны быть в одну строку
  const noBreakPhrases = ['My merch', 'Мой мерч', 'ПК Конфиг', 'PC Specs', 'Социальные сети', 'Social Networks', 'Коллекция мерча', 'Merch Collection'];
  
  const formatText = (text: string) => {
    // Если фраза в исключении - возвращаем как есть
    if (noBreakPhrases.includes(text)) {
      return text;
    }
    
    // Разбиваем на слова и вставляем <br> между ними
    const words = text.split(' ');
    if (words.length <= 1) return text;
    return words.map((word, idx) => (
      <React.Fragment key={idx}>
        {word}
        {idx < words.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {typeof children === 'string' ? formatText(children) : children}
    </button>
  );
};

export default function ClientApp({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState('home');
  const activeSectionRef = useRef(activeSection);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ← ДОБАВИТЬ

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Блокируем скролл тела при открытом меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const pages = ['/profile', '/', '/archive'];
  const currentIndex = pages.indexOf(pathname);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToElement = (id: string, behavior: ScrollBehavior = 'smooth') => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior });
      return true;
    }
    return false;
  };

  const handleNavClick = (path: string, sectionId?: string) => {
    setIsMobileMenuOpen(false); // ← ЗАКРЫВАЕМ МЕНЮ ПРИ КЛИКЕ
    
    if (sectionId) {
      if (pathname === '/') {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          if (window.location.hash !== `#${sectionId}`) {
            window.history.replaceState(null, '', `#${sectionId}`);
          }
        } else {
          router.push(`/#${sectionId}`);
        }
      } else {
        router.push(`/#${sectionId}`);
      }
      return;
    }

    if (pathname === path) {
      scrollToTop();
      if (window.location.hash) {
        window.history.replaceState(null, '', path);
      }
    } else {
      router.push(path);
    }
  };

  const toggleAdminPanel = () => {
    if (pathname === '/admin') {
      router.back();
    } else {
      router.push('/admin');
    }
  };

  useEffect(() => {
    if (pathname !== '/') return;

    const sections = ['home', 'socials', 'streams', 'community', 'merch', 'pc-config'];
    
    const handleScroll = () => {
      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = window.innerHeight / 2;
          
          if (Math.abs(elementCenter - viewportCenter) < 300) {
            if (activeSectionRef.current !== id) {
              setActiveSection(id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(id);
        }
      }, 100);
    }
  }, [pathname]);

  useEffect(() => {
    const sectionId = sessionStorage.getItem('scrollToSection');
    
    if (sectionId && pathname === '/') {
      sessionStorage.removeItem('scrollToSection');
      
      setTimeout(() => {
        scrollToElement(sectionId, 'smooth');
        setActiveSection(sectionId);
      }, 100);
    }
  }, [pathname]);

  const goToPrevPage = () => {
    if (hasPrev) router.push(pages[currentIndex - 1]);
  };

  const goToNextPage = () => {
    if (hasNext) router.push(pages[currentIndex + 1]);
  };

  const isActivePage = (path: string) => pathname === path;
  const isActiveSection = (section: string) => pathname === '/' && activeSection === section;

  const isAdminPanelActive = pathname === '/admin';

  return (
  <div className="page-container">

    {}
    <div className="mobile-top-logo">
      <img
        src="/images/logo-small.png"
        alt="Logo"
        className="mobile-top-logo-img"
        onClick={() => handleNavClick('/', 'home')}
      />
    </div>

    {}
    <div className="top-nav">
      <div className="top-nav-inner">
        <MusicPlayer />

        <div className="nav-left-group">
          <Link href="/profile">
            <NavButton className={`nav-link ${isActivePage('/profile') ? 'active' : ''}`}>
              {t('nav.profile')}
            </NavButton>
          </Link>
          <button onClick={goToPrevPage} disabled={!isMounted ? false : !hasPrev} className="nav-arrow" suppressHydrationWarning>
            <Image src="/images/arrow_left.png" alt="Left" width={32} height={32} />
          </button>
          <NavButton onClick={() => handleNavClick('/', 'home')} className={isActiveSection('home') ? 'active' : ''}>
            {t('nav.home')}
          </NavButton>
          <button onClick={goToNextPage} disabled={!isMounted ? false : !hasNext} className="nav-arrow" suppressHydrationWarning>
            <Image src="/images/arrow_right.png" alt="Right" width={32} height={32} />
          </button>
          <Link href="/archive">
            <NavButton className={`nav-link ${isActivePage('/archive') ? 'active' : ''}`}>
              {t('nav.archive')}
            </NavButton>
          </Link>
        </div>

        <div className="nav-center-logo">
          <img src="/images/home-logo.png" alt="Logo" className="nav-logo-img" onClick={() => handleNavClick('/', 'home')} />
        </div>

        <div className="nav-socials-center">
          <NavButton onClick={() => handleNavClick('/', 'socials')} className={isActiveSection('socials') ? 'active' : ''}>
            {t('nav.socials')}
          </NavButton>
        </div>

        <div className="nav-columns">
          <div className="nav-column">
            <NavButton onClick={() => handleNavClick('/', 'streams')} className={isActiveSection('streams') ? 'active' : ''}>{t('nav.streams')}</NavButton>
            <NavButton onClick={() => handleNavClick('/', 'community')} className={isActiveSection('community') ? 'active' : ''}>{t('nav.community')}</NavButton>
          </div>
          <div className="nav-column">
            <NavButton onClick={() => handleNavClick('/', 'merch')} className={isActiveSection('merch') ? 'active' : ''}>{t('nav.store')}</NavButton>
            <NavButton onClick={() => handleNavClick('/', 'pc-config')} className={isActiveSection('pc-config') ? 'active' : ''}>{t('nav.config')}</NavButton>
          </div>
        </div>

        <LanguageSwitcher />
      </div>
    </div>

    {}
<button
  className={`burger-btn ${isMobileMenuOpen ? 'menu-open' : ''}`}
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label="Меню"
>
  <span className="burger-line" />
  <span className="burger-line" />
  <span className="burger-line" />
</button>

    {}
    <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
<div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>

  {}
  <button
    className="drawer-close-btn"
    onClick={() => setIsMobileMenuOpen(false)}
    aria-label="Закрыть"
  >
    ✕
  </button>

      {}
      <div className="drawer-music">
        <MusicPlayer />
      </div>

      {}
      <nav className="mobile-nav-links">
        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
          <div className={`mobile-nav-item ${isActivePage('/profile') ? 'active' : ''}`}>{t('nav.profile')}</div>
        </Link>
        <div className={`mobile-nav-item ${isActiveSection('home') ? 'active' : ''}`} onClick={() => handleNavClick('/', 'home')}>
          {t('nav.home')}
        </div>
        <Link href="/archive" onClick={() => setIsMobileMenuOpen(false)}>
          <div className={`mobile-nav-item ${isActivePage('/archive') ? 'active' : ''}`}>{t('nav.archive')}</div>
        </Link>
        <div className="mobile-nav-divider" />
        <div className={`mobile-nav-item ${isActiveSection('socials') ? 'active' : ''}`} onClick={() => handleNavClick('/', 'socials')}>{t('nav.socials')}</div>
        <div className={`mobile-nav-item ${isActiveSection('streams') ? 'active' : ''}`} onClick={() => handleNavClick('/', 'streams')}>{t('nav.streams')}</div>
        <div className={`mobile-nav-item ${isActiveSection('community') ? 'active' : ''}`} onClick={() => handleNavClick('/', 'community')}>{t('nav.community')}</div>
        <div className={`mobile-nav-item ${isActiveSection('merch') ? 'active' : ''}`} onClick={() => handleNavClick('/', 'merch')}>{t('nav.store')}</div>
        <div className={`mobile-nav-item ${isActiveSection('pc-config') ? 'active' : ''}`} onClick={() => handleNavClick('/', 'pc-config')}>{t('nav.config')}</div>
      </nav>

      {}
      <div className="drawer-language">
        <LanguageSwitcher />
      </div>

      {}
      <div className="drawer-utils">
        <ThemeSwitcher />
        <SoundToggle />
        {isAdmin && (
          <button className={`admin-icon-button ${isAdminPanelActive ? 'active' : ''}`} onClick={toggleAdminPanel}>
            <span className="admin-spider">‧₊˚🕷‧₊˚</span>
          </button>
        )}
      </div>

    </div>

    {}
    <PageTransition>{children}</PageTransition>

    {}
    <div className="desktop-utils">
      {isAdmin && (
        <div className="admin-spider-wrapper">
          <button className={`admin-icon-button ${isAdminPanelActive ? 'active' : ''}`} onClick={toggleAdminPanel}>
            <span className="admin-spider">‧₊˚🕷‧₊˚</span>
          </button>
        </div>
      )}
      <ScrollToTop />
      <ThemeSwitcher />
      <SoundToggle />
    </div>

    <OwlAssistant />
  </div>
);
}