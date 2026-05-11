'use client';
import { useEffect, useState } from 'react';

interface AdminInfo {
  isAdmin: boolean;
  role: string | null;
  permissions: string[];
  loading: boolean;
}

export function usePermission(permission?: string) {
  const [info, setInfo] = useState<AdminInfo>({ 
    isAdmin: false, 
    role: null, 
    permissions: [],
    loading: true,  // ← добавь
  });

  useEffect(() => {
    fetch('/api/admin/check')
      .then(r => r.json())
      .then(data => setInfo({ ...data, loading: false }))  // ← loading: false после загрузки
      .catch(() => setInfo({ isAdmin: false, role: null, permissions: [], loading: false }));
  }, []);

  const hasPermission = info.role === 'owner' ||
    info.permissions.includes('all') ||
    (permission ? info.permissions.includes(permission) : false);

  return { ...info, hasPermission };
}