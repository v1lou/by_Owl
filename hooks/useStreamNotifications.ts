'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface TwitchStatsData {
  followers: number;
  isLive: boolean;
  gameName: string;
  title?: string;
  viewerCount?: number;
}

async function fetchTwitchStats(): Promise<TwitchStatsData> {
  const response = await fetch('/api/twitch/stats');
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  const data = await response.json();
  return data.data;
}

export function useStreamNotifications() {
  const queryClient = useQueryClient();
  const prevDataRef = useRef<TwitchStatsData | null>(null);
  const initializedRef = useRef(false);

  // Запрос живёт здесь — работает на всех страницах
  useQuery({
    queryKey: ['twitchStats'],
    queryFn: fetchTwitchStats,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] !== 'twitchStats') return;
      if (event.type !== 'updated') return;
      if (event.query.state.status !== 'success') return;

      const stats = event.query.state.data as TwitchStatsData | undefined;
      if (!stats) return;

      if (!initializedRef.current) {
        prevDataRef.current = stats;
        initializedRef.current = true;
        return;
      }

      const prevData = prevDataRef.current;
      if (!prevData) return;

      if (!prevData.isLive && stats.isLive) {
        toast('Стрим начался!', { duration: 10000 });
      }
      if (prevData.isLive && !stats.isLive) {
        toast('Стрим завершён', { duration: 5000 });
      }
      if (stats.isLive && prevData.gameName !== stats.gameName && stats.gameName) {
        toast(`Смена игры: ${stats.gameName}`, { duration: 7000 });
      }
      if (stats.isLive && prevData.title !== stats.title && stats.title) {
        toast(`Новый заголовок: ${stats.title}`, { duration: 5000 });
      }
      if (stats.isLive && prevData.viewerCount !== stats.viewerCount && stats.viewerCount !== undefined) {
        const diff = stats.viewerCount - (prevData.viewerCount || 0);
        if (Math.abs(diff) > 10) {
          toast(`Зрителей: ${stats.viewerCount}`, { duration: 3000 });
        }
      }

      prevDataRef.current = stats;
    });

    return () => unsubscribe();
  }, [queryClient]);
}