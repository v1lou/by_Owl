'use client';

import dynamic from 'next/dynamic';

// Динамические импорты с ssr: false теперь работают внутри 'use client'
const VampireClickEffect = dynamic(() => import('./ClickEffect'), { ssr: false });
const TestNotificationsButton = dynamic(() => import('./TestNotificationsButton'), { ssr: false });

export default function ClientSideComponents() {
  return (
    <>
      <VampireClickEffect />
      <TestNotificationsButton />
    </>
  );
}