'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface TwitchStatsData {
  followers: number;
  isLive: boolean;
  gameName: string;
  title?: string;
  viewerCount?: number;
}

export function useStreamNotifications() {
  const queryClient = useQueryClient();
  const prevDataRef = useRef<TwitchStatsData | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Только наш запрос и только тип 'updated' (новые данные с сервера)
      if (event.query.queryKey[0] !== 'twitchStats') return;
      if (event.type !== 'updated') return;
      if (event.query.state.status !== 'success') return;

      // Данные уже плоские, без обёртки .data
      const stats = event.query.state.data as TwitchStatsData | undefined;
      if (!stats) return;

      // Первый раз — просто запоминаем
      if (!initializedRef.current) {
        prevDataRef.current = stats;
        initializedRef.current = true;
        return;
      }

      const prevData = prevDataRef.current;
      if (!prevData) return;

      // Стрим начался
      if (!prevData.isLive && stats.isLive) {
        toast('Стрим начался!', { duration: 10000});
      }

      // Стрим завершился
      if (prevData.isLive && !stats.isLive) {
        toast('Стрим завершён', { duration: 5000});
      }

      // Смена игры
      if (stats.isLive && prevData.gameName !== stats.gameName && stats.gameName) {
        toast(`Смена игры: ${stats.gameName}`, { duration: 7000});
      }

      // Смена заголовка
      if (stats.isLive && prevData.title !== stats.title && stats.title) {
        toast(`Новый заголовок: ${stats.title}`, { duration: 5000});
      }

      // Изменение количества зрителей (опционально)
      if (stats.isLive && prevData.viewerCount !== stats.viewerCount && stats.viewerCount !== undefined) {
        const diff = (stats.viewerCount - (prevData.viewerCount || 0));
        if (Math.abs(diff) > 10) { // только значительные изменения
          toast(`Зрителей: ${stats.viewerCount}`, { duration: 3000});
        }
      }

      prevDataRef.current = stats;
    });

    return () => unsubscribe();
  }, [queryClient]);
}