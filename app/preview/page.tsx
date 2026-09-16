'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PreviewLandingPage } from '@/components/PreviewLandingPage';

export default function PreviewPage() {
  const router = useRouter();

  const handlePlayOnline = () => {
    router.push('/?play=true');
  };

  return <PreviewLandingPage onPlayOnline={handlePlayOnline} />;
}
