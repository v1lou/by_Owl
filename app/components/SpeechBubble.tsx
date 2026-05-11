'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

interface SpeechBubbleProps {
  isLive: boolean;
}

export default function SpeechBubble({ isLive }: SpeechBubbleProps) {
  const [quote, setQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const quotes = isLive
      ? t('quotes.online', { returnObjects: true })
      : t('quotes.offline', { returnObjects: true });

    if (Array.isArray(quotes) && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
      setQuoteIndex(randomIndex);
    }
  }, [isLive, i18n.language]);

  useEffect(() => {
    if (!quote) return;

    const status = isLive ? 'online' : 'offline';
    // 🔥 Главное изменение: номер аудио от 1 до 5 (циклически)
    const audioNumber = (quoteIndex % 5) + 1;
    const audioPath = `/audio/quotes/${status}${audioNumber}.mp3`;

    const audio = new Audio(audioPath);
    audio.volume = 0.5;
    audio.play().catch(() => {});

    // Останавливаем предыдущее аудио
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [quote, quoteIndex, isLive]);

  if (!quote) return null;

  return (
    <div className="speech-bubble">
      <Image
        src="/images/cloud_speech.png"
        alt="speech bubble"
        width={320}
        height={200}
        className="speech-bubble-img"
        unoptimized
      />

      <div className="speech-bubble-text">
        {quote}
      </div>

      <button
        className="speech-bubble-sound"
        onClick={() => audioRef.current?.play()}
      >
        🔊
      </button>
    </div>
  );
}