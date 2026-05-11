'use client';

import { useRouter } from 'next/navigation';
import ArchiveView from '../../components/ArchiveView';
import { usePermission } from '@/hooks/usePermission';
import '../../../styles/archive.css';
import '../../../styles/admin-archive.css';

export default function AdminArchivePage() {
  const router = useRouter();
  const { hasPermission, loading: permissionLoading } = usePermission('archive');

  // Проверка прав
  if (permissionLoading) {
    return <div className="admin-loader">Загрузка...</div>;
  }

  if (!hasPermission) {
    return <div className="admin-loader">Нет доступа</div>;
  }

  // Есть права — показываем архив
  return (
    <div className="archive-page">
      <div className="archive-container">
        <ArchiveView isAdmin={true} isEditMode={true} />
      </div>
    </div>
  );
}