import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);

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
      // Animate logo to header position
      gsap.to(logoContainerRef.current, {
        scale: 0.12,
        x: 'calc(-50vw + 80px)',
        y: 'calc(-50vh + 40px)',
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.5,
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
      {/* Ambient glow effects matching the video */}
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

      {/* Logo Container with Video or Image Fallback */}
      <div
        ref={logoContainerRef}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        <div className="w-80 h-80 md:w-96 md:h-96 relative">
          {!videoError ? (
            <video
              ref={videoRef}
              src="/logo-animation.webm"
              className="w-full h-full object-contain"
              muted
              playsInline
              style={{ filter: 'drop-shadow(0 0 60px rgba(0, 180, 255, 0.4))' }}
            />
          ) : (
            <img
              src="/logo.png"
              alt="PostSpark"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 0 60px rgba(0, 180, 255, 0.4))' }}
            />
          )}
        </div>

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

      {/* Sparkle particles around */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full sparkle"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
              background: i % 2 === 0 ? '#00d4ff' : '#ff6b35',
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#00d4ff' : '#ff6b35'}`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          0%, 50% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 2s ease-out forwards;
          animation-delay: 1s;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
