'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Play, Sparkles, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Generate particle positions only once on client to avoid hydration mismatch
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 20 + Math.random() * 60,
    left: 10 + Math.random() * 80,
    color: i % 2 === 0 ? 'rgba(0, 212, 255, 0.6)' : 'rgba(255, 107, 53, 0.6)',
    shadowColor: i % 2 === 0 ? 'rgba(0, 212, 255, 0.8)' : 'rgba(255, 107, 53, 0.8)',
    duration: 4 + Math.random() * 4,
    delay: i * 0.5,
  }));
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);

  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateParticles(8));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animation on load
      const loadTl = gsap.timeline({ delay: 0.5 });

      loadTl.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );

      loadTl.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      );

      loadTl.fromTo(
        buttonsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      );

      loadTl.fromTo(
        imageRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.8'
      );

      // Scroll-triggered parallax
      gsap.to(imageRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(0, 80, 120, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(255, 100, 30, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(10, 30, 50, 0.5) 0%, transparent 70%),
          linear-gradient(180deg, #050a10 0%, #0a1628 50%, #050a10 100%)
        `,
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0, 150, 200, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255, 120, 50, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(80, 50, 150, 0.1) 0%, transparent 60%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 180, 255, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 180, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles - rendered only on client */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              background: particle.color,
              boxShadow: `0 0 10px ${particle.shadowColor}`,
              animationName: 'float',
              animationDuration: `${particle.duration}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div ref={contentRef} className="text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(0, 100, 150, 0.15)',
                border: '1px solid rgba(0, 180, 255, 0.2)',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#00d4ff' }} />
              <span className="text-sm text-gray-300">Nova versão 2.0 disponível</span>
            </div>

            {/* Title */}
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              Crie conteúdo que{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 50%, #ff9500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                brilha
              </span>{' '}
              nas redes sociais
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-8"
            >
              Transforme suas ideias em posts engajadores com IA.
              Do conceito ao download em segundos, não em horas.
            </p>

            {/* Buttons */}
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button
                size="lg"
                className="text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 group"
                style={{
                  background: 'linear-gradient(135deg, #00a8cc 0%, #0077b6 100%)',
                  boxShadow: '0 0 30px rgba(0, 180, 255, 0.3)',
                }}
                asChild
              >
                <Link href="/dashboard">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white hover:bg-white/10 px-8 py-6 text-lg group"
                style={{ borderColor: 'rgba(0, 180, 255, 0.3)' }}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

          </div>

          {/* Hero Image */}
          <div ref={imageRef} className="relative">
            <div
              className="relative rounded-3xl overflow-hidden border"
              style={{ borderColor: 'rgba(0, 180, 255, 0.15)' }}
            >
              {/* Glow effect */}
              <div
                className="absolute -inset-1 rounded-3xl opacity-30 -z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.4) 0%, rgba(255, 107, 53, 0.4) 100%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Mock Dashboard */}
              <div
                className="p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.9) 0%, rgba(5, 10, 16, 0.95) 100%)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #00a8cc 0%, #0077b6 100%)',
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white">PostSpark</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-4">
                  {/* AI Input */}
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      background: 'rgba(0, 100, 150, 0.1)',
                      borderColor: 'rgba(0, 180, 255, 0.15)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-5 h-5" style={{ color: '#ff6b35' }} />
                      <span className="text-sm text-gray-300">Assistente de IA</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full w-3/4" />
                    <div className="h-2 bg-white/10 rounded-full w-1/2 mt-2" />
                  </div>

                  {/* Generated Posts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-4 border"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 168, 204, 0.1) 0%, transparent 100%)',
                        borderColor: 'rgba(0, 180, 255, 0.2)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                        style={{ background: 'rgba(0, 180, 255, 0.15)' }}
                      >
                        <span className="text-lg">📱</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full w-full mb-2" />
                      <div className="h-2 bg-white/10 rounded-full w-2/3" />
                    </div>
                    <div
                      className="rounded-xl p-4 border"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, transparent 100%)',
                        borderColor: 'rgba(255, 107, 53, 0.2)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                        style={{ background: 'rgba(255, 107, 53, 0.15)' }}
                      >
                        <span className="text-lg">🎯</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full w-full mb-2" />
                      <div className="h-2 bg-white/10 rounded-full w-2/3" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      background: 'rgba(0, 100, 150, 0.1)',
                      borderColor: 'rgba(0, 180, 255, 0.15)',
                    }}
                  >
                    {/*<div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-300">Performance</span>
                      <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                    </div>
                    <div className="flex items-end gap-2 h-16">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${height}%`,
                            background: 'linear-gradient(180deg, #00a8cc 0%, #0077b6 100%)',
                          }}
                        />
                      ))}
                    </div>*/}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center floating"
              style={{
                background: 'linear-gradient(135deg, #00a8cc 0%, #0077b6 100%)',
                boxShadow: '0 10px 40px rgba(0, 180, 255, 0.3)',
              }}
            >
              <span className="text-3xl">✨</span>
            </div>
            <div
              className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl flex items-center justify-center floating"
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff9500 100%)',
                boxShadow: '0 10px 40px rgba(255, 107, 53, 0.3)',
                animationDelay: '1s',
              }}
            >
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
