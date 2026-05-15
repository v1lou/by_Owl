'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminArchivePage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('fullEditMode', 'true');
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'fullEditMode',
      newValue: 'true',
    }));
    router.replace('/archive');
  }, []);

  return <div className="admin-loader">Переход...</div>;
}