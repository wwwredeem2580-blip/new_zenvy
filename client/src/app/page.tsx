"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
