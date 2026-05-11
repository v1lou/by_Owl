'use client';

import { useStreamNotifications } from '@/hooks/useStreamNotifications';

export default function StreamNotification() {
  // Подключаем уведомления о стриме - теперь на всех страницах
  useStreamNotifications();
  
  return null;
}