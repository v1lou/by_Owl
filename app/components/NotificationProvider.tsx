'use client';

import { useStreamNotifications } from '@/hooks/useStreamNotifications';
import { Toaster } from 'react-hot-toast';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useStreamNotifications();
  
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName="toast-container"
        toastOptions={{
          className: 'toast-custom',
          duration: Infinity,
        }}
      />
    </>
  );
}