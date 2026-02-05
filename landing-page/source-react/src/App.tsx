import { useState, useEffect } from 'react';
import { IntroAnimation } from './components/IntroAnimation';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { StickySection } from './sections/StickySection';
import { PricingSection } from './sections/PricingSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { CTASection } from './sections/CTASection';
import './App.css';

function App() {
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
        <FeaturesSection />
        <StickySection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
