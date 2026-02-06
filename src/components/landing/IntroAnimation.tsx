'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface IntroAnimationProps {
  onComplete: () => void;
}

// Generate sparkle positions only once on client
function generateSparkles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 15 + Math.random() * 70,
    left: 10 + Math.random() * 80,
    color: i % 2 === 0 ? '#00d4ff' : '#ff6b35',
    delay: i * 0.3,
    duration: 2 + Math.random() * 2,
  }));
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [sparkles, setSparkles] = useState<ReturnType<typeof generateSparkles>>([]);

  // Generate sparkles only on client to avoid hydration mismatch
  useEffect(() => {
    setSparkles(generateSparkles(12));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Play video and handle end
    video.play().catch(() => {
      // If autoplay fails, use image fallback
      setVideoError(true);
      setTimeout(() => setVideoEnded(true), 2000);
    });

    const handleEnded = () => {
      setVideoEnded(true);
    };

    const handleError = () => {
      setVideoError(true);
      setTimeout(() => setVideoEnded(true), 2000);
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    if (!videoEnded) return;

    const ctx = gsap.context(() => {
      // Calculate position to match navbar logo
      // Navbar logo is at: max-w-7xl container with px-4/6/8 padding
      // Logo size: w-10 h-10 (40px)
      // Vertical padding: py-3 (12px) or py-5 (20px)
      
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      // Horizontal padding based on screen size
      const paddingX = isMobile ? 16 : isTablet ? 24 : 32;
      // Vertical padding (navbar has py-3 when scrolled, py-5 initially)
      const paddingY = 20; // py-5 = 20px
      
      // Calculate position from center
      // Container is centered with max-w-7xl (1280px)
      const containerWidth = Math.min(window.innerWidth, 1280);
      const containerLeft = (window.innerWidth - containerWidth) / 2;
      
      // Logo position from center
      const logoX = containerLeft + paddingX + 20 - (window.innerWidth / 2); // +20 for half of logo width
      const logoY = paddingY + 20 - (window.innerHeight / 2); // +20 for half of logo height
      
      // Animate logo to header position with fade-out
      gsap.to(logoContainerRef.current, {
        scale: 0.125, // 320px * 0.125 = 40px (matches w-10)
        x: `${logoX}px`,
        y: `${logoY}px`,
        opacity: 0, // Fade out as it moves to navbar
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.3,
            onComplete: onComplete,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [videoEnded, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050a10 50%, #020408 100%)',
      }}
    >
      {/* Ambient glow effects matching the video - TEMPORARIAMENTE COMENTADO PARA TESTE */}
      {/*
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0, 100, 150, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 150, 50, 0.2) 0%, transparent 60%)',
          }}
        />
      </div>
      */}

      {/* Logo Container with Video or Image Fallback */}
      <div
        ref={logoContainerRef}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        {/*
        <div className="w-80 h-80 md:w-96 md:h-96 relative">
          {!videoError ? (
            <video
              ref={videoRef}
              src="/logo_web.webm"
              className="w-full h-full object-contain"
              muted
              playsInline
              style={{ filter: 'drop-shadow(0 0 60px rgba(0, 180, 255, 0.4))' }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo.png"
              alt="PostSpark"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 0 60px rgba(0, 180, 255, 0.4))' }}
            />
          )}
        </div>
        */}

        {!videoError ? (
            <video
              ref={videoRef}
              src="/logo_web.webm"
              className="w-80 h-80 md:w-96 md:h-96 object-contain"
              muted
              playsInline
              // TEMPORARIAMENTE REMOVIDO DROP-SHADOW PARA TESTE
              // style={{ filter: 'drop-shadow(0 0 60px rgba(0, 180, 255, 0.4))' }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo.png"
              alt="PostSpark"
              className="w-80 h-80 md:w-96 md:h-96 object-contain"
              // TEMPORARIAMENTE REMOVIDO DROP-SHADOW PARA TESTE
              // style={{ filter: 'drop-shadow(0 0 60px rgba(0, 180, 255, 0.4))' }}
            />
          )}
        {/* Brand name appears below logo */}
        <div className="mt-8 text-center opacity-0 animate-fade-in">
          <h1
            className="text-4xl md:text-6xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 50%, #ff9500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PostSpark
          </h1>
          <p className="text-gray-400 text-lg">
            Ilumine suas redes sociais
          </p>
        </div>
      </div>

      {/* Sparkle particles around - rendered only on client */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute w-1 h-1 rounded-full sparkle"
            style={{
              top: `${sparkle.top}%`,
              left: `${sparkle.left}%`,
              background: sparkle.color,
              boxShadow: `0 0 10px ${sparkle.color}`,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
