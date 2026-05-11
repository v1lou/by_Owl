'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ArchiveView from '../components/ArchiveView';
import '../../styles/archive.css';
import '../../styles/admin-archive.css';

export default function ArchivePage() {
  const { data: session } = useSession();
  const [isFullEditMode, setIsFullEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('fullEditMode');
    setIsFullEditMode(savedMode === 'true');
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const res = await fetch('/api/admin/check');
        
        if (!res.ok) {
          console.error('API response not OK:', res.status);
          setIsAdmin(false);
          return;
        }
        
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, [session]);

  const hasEditRights = isAdmin && isFullEditMode;

  // Функция для модалки заказа (если нужна)
  const handleOpenOrderModal = () => {
    // Здесь можно открыть модальное окно заказа фильма
    console.log('Open order modal');
  };

  return (
    <div className="archive-page">
      <div className="archive-container">
        <ArchiveView 
          isAdmin={hasEditRights} 
          isEditMode={hasEditRights}
          onOpenOrderModal={handleOpenOrderModal}
        />
      </div>
    </div>
  );
}