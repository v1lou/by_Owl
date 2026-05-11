'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function FullEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      // Включаем режим полного редактирования через localStorage
      localStorage.setItem('fullEditMode', 'true');
      // Перенаправляем на главную
      router.push('/');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#aaa',
        fontFamily: 'var()'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Включение режима полного редактирования...</h2>
          <p>Вы будете перенаправлены на главную</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#aaa',
      fontFamily: 'var()'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Включение режима полного редактирования...</h2>
        <p>Вы будете перенаправлены на главную</p>
      </div>
    </div>
  );
}