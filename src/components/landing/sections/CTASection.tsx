'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles, Zap, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#050a10]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-orange-500/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={contentRef}
          className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl lg:rounded-[3rem] p-8 lg:p-16 overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]" />

          {/* Floating icons */}
          <div className="absolute top-8 left-8 floating">
            <Sparkles className="w-8 h-8 text-cyan-400/50" />
          </div>
          <div className="absolute top-12 right-12 floating" style={{ animationDelay: '0.5s' }}>
            <Zap className="w-6 h-6 text-orange-400/50" />
          </div>
          <div className="absolute bottom-8 left-16 floating" style={{ animationDelay: '1s' }}>
            <Star className="w-5 h-5 text-yellow-400/50" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white">Comece sua jornada hoje</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
              Pronto para fazer seu conteúdo{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">
                brilhar
              </span>?
            </h2>

            <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Comece gratuitamente hoje e transforme suas ideias em posts
              engajadores em segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg group"
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
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                asChild
              >
                <Link href="/dashboard">
                  Ver Exemplos
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancelamento anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
