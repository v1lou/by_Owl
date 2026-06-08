'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function TestNotificationsButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testNotifications = () => {
    toast(`Стрим начался`, { 
      duration: 5000,
      icon: '',
    });
    
    setTimeout(() => {
      toast(`Смена игры: Valorant`, { 
        duration: 5000,
        icon: '',
      });
    }, 1000);
    
    setTimeout(() => {
      toast(`Новый заголовок: Вечерний стрим с подписчиками!`, { 
        duration: 5000,
        icon: '',
      });
    }, 2000);
    
    setTimeout(() => {
      toast(`Стрим завершён`, { 
        duration: 5000,
        icon: '',
      });
    }, 3000);
    
    setTimeout(() => {
      toast(`Пример ошибки (если что-то пошло не так)`, { 
        duration: 4000,
        icon: '',
      });
    }, 4000);
  };

  // Не рендерим на сервере
  if (!mounted) return null;

  return (
    <button
      onClick={testNotifications}
      style={{
        position: 'fixed',
        bottom: '60%',
        left: '20px',
        zIndex: 99999,
        background: 'transparent',
        color: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '0',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontFamily: 'var(), monospace',
        letterSpacing: '1px',
        transition: 'all 0.2s ease',
        border: 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
      }}
    >

    </button>
  );
}