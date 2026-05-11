'use client';

import { useState, useEffect } from 'react';

export function useEditMode(): boolean {
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fullEditMode');
    setIsEditMode(saved === 'true');

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'fullEditMode') {
        setIsEditMode(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return isEditMode;
}