// components/ExportAnalytics.tsx
'use client';

export function ExportAnalytics() {
  const exportData = () => {
    const data = localStorage.getItem('owl_analytics');
    const blob = new Blob([data || ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={exportData} style={{ padding: '8px 16px', cursor: 'pointer' }}>
      📊 Экспорт аналитики
    </button>
  );
}