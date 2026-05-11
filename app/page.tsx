'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroSection from './components/HeroSection';
import SocialsSection from './components/SocialsSection';
import StreamsSection from './components/StreamsSection';
import CommunityLinks from './components/CommunityLinks';
import MerchSection from './components/MerchSection';
import ConfigSection from './components/ConfigSection';
import Footer from './components/Footer';

const DEFAULT_TWITCH_DATA = {
  followers: 706279,
  isLive: false,
  streamTitle: '',
  gameName: '',
  viewerCount: 0,
};

export default function HomePage() {
  const [pcConfig, setPcConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/data/pc-config')
      .then(r => r.json())
      .then(setPcConfig)
      .catch(() => setPcConfig(null));
  }, []);

  const { data: twitchRaw, isLoading } = useQuery({
    queryKey: ['twitchStats'],
    queryFn: () =>
      fetch('/api/twitch/stats')
        .then(r => r.json())
        .then(d => d.data),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: DEFAULT_TWITCH_DATA,
  });

  const twitchData = {
    followers: twitchRaw?.followers ?? DEFAULT_TWITCH_DATA.followers,
    isLive: twitchRaw?.isLive ?? false,
    streamTitle: twitchRaw?.title ?? '',
    gameName: twitchRaw?.gameName ?? '',
    viewerCount: twitchRaw?.viewerCount ?? 0,
  };

  return (
    <div>
      <HeroSection twitchData={twitchData} isLoading={isLoading} />
      
      <div className="black-section-wrapper">
        <section id="socials">
          <SocialsSection />
        </section>
        <StreamsSection />
        <section id="community">
          <CommunityLinks />
        </section>
        <section id="merch">
          <MerchSection />
        </section>
        <section id="pc-config">
          <ConfigSection pcConfig={pcConfig} />
        </section>
        <Footer />
      </div>
    </div>
  );
}