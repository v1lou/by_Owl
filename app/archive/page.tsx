'use client';

import ArchiveView from '../components/ArchiveView';
import { usePermission } from '@/hooks/usePermission';
import { useEditMode } from '@/hooks/useEditMode';
import '../../styles/archive.css';
import '../../styles/admin-archive.css';

export default function ArchivePage() {
  const { isAdmin } = usePermission();
  const isEditMode = useEditMode();
  const canEdit = isAdmin && isEditMode;

  return (
    <div className="archive-page">
      <div className="archive-container">
        <ArchiveView isAdmin={canEdit} isEditMode={canEdit} />
      </div>
    </div>
  );
}