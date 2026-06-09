'use client';

import { Suspense } from 'react';
import ArchiveView from '../components/ArchiveView';
import { usePermission } from '@/hooks/usePermission';
import { useEditMode } from '@/hooks/useEditMode';
import '../../styles/archive.css';
import '../../styles/admin-archive.css';

function ArchiveContent() {
  const { isAdmin } = usePermission();
  const isEditMode = useEditMode();

  return (
    <div className="archive-page">
      <div className="archive-container">
        <ArchiveView isAdmin={isAdmin} isEditMode={isEditMode} />
      </div>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="archive-loading">Загрузка...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}