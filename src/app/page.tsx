'use client';

import { useState, useEffect } from 'react';
import { IntroAnimation } from '@/components/landing/IntroAnimation';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { FeaturesParallaxSection } from '@/components/landing/sections/FeaturesParallaxSection';
import { StickySection } from '@/components/landing/sections/StickySection';
import { PricingSection } from '@/components/landing/sections/PricingSection';
import { AmbientStatesSection } from '@/components/landing/sections/AmbientStatesSection';
import { CTASection } from '@/components/landing/sections/CTASection';

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen intro before
    const hasSeenIntro = sessionStorage.getItem('postspark-intro-seen');
    if (hasSeenIntro) {
      setShowIntro(false);
      setHeaderVisible(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHeaderVisible(true);
    sessionStorage.setItem('postspark-intro-seen', 'true');
  };

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(0, 80, 120, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(255, 100, 30, 0.05) 0%, transparent 50%),
          linear-gradient(180deg, #050a10 0%, #0a1628 30%, #0a1628 70%, #050a10 100%)
        `,
      }}
    >
      {/* Intro Animation */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* Header */}
      <Header isVisible={headerVisible} />

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesParallaxSection />
        <StickySection />
        <PricingSection />
        <AmbientStatesSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
