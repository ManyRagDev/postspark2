'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  Brain,
  LayoutGrid,
  FolderOpen,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Sparkles,
    title: 'Geração com IA',
    description: 'Crie posts envolventes em segundos com Gemini 2.0 Flash. Detecta automaticamente o tom do seu conteúdo.',
    iconColor: 'text-cyan-400',
    accentColor: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
  },
  {
    icon: Brain,
    title: 'Estados Ambientais',
    description: 'IA detecta automaticamente: Motivacional, Promocional, Educacional, Pessoal e mais. Adapta o design ao seu conteúdo.',
    iconColor: 'text-purple-400',
    accentColor: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    icon: LayoutGrid,
    title: 'Layouts Inteligentes',
    description: '6 layouts profissionais: Centered, Hierarchy, Split, Card, Headline e Carousel. Cada um otimizado para seu tipo de conteúdo.',
    iconColor: 'text-green-400',
    accentColor: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    icon: FolderOpen,
    title: 'Galeria Premium',
    description: 'Biblioteca de backgrounds organizados por categorias: Acolhimento, Caos Criativo, Impacto, Luxo e Técnico.',
    iconColor: 'text-orange-400',
    accentColor: 'from-orange-500/20 to-yellow-500/20',
    borderColor: 'border-orange-500/30',
  },
  {
    icon: ImageIcon,
    title: 'Geração de Imagens',
    description: 'Gere backgrounds com IA. Imagens rápidas para o dia a dia ou realistas para projetos que exigem mais impacto.',
    iconColor: 'text-pink-400',
    accentColor: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30',
  },
  {
    icon: Sliders,
    title: 'Edição Total',
    description: 'Controle manual sobre texto, imagem (brilho, contraste, saturação, blur, zoom) e layout. Override por slide para carrosséis.',
    iconColor: 'text-indigo-400',
    accentColor: 'from-indigo-500/20 to-violet-500/20',
    borderColor: 'border-indigo-500/30',
  },
];

export function FeaturesParallaxSection() {
  // Group features into pairs (2 per row)
  const featurePairs = [];
  for (let i = 0; i < features.length; i += 2) {
    featurePairs.push(features.slice(i, i + 2));
  }

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const image = imageRef.current;
    const overlay = overlayRef.current;
    const featuresEl = featuresRef.current;
    const progressBar = progressRef.current;

    if (!section || !container || !image || !overlay || !featuresEl || !progressBar) return;

    const featureRows = featuresEl.querySelectorAll('.feature-row');
    const totalRows = featureRows.length;

    const ctx = gsap.context(() => {
      // Initial setup - all rows except first are hidden
      featureRows.forEach((row, index) => {
        const cards = row.querySelectorAll('.feature-card');
        const isFirst = index === 0;
        
        gsap.set(row, {
          opacity: isFirst ? 1 : 0,
          y: isFirst ? 0 : 80,
          zIndex: totalRows - index,
        });
        
        cards.forEach((card) => {
          gsap.set(card, {
            opacity: isFirst ? 1 : 0,
            y: isFirst ? 0 : 40,
            scale: isFirst ? 1 : 0.95,
          });
        });
      });

      // Pin the section while features scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${window.innerHeight * (totalRows * 0.9 + 0.4)}`,
          pin: container,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Update progress bar
            gsap.to(progressBar, {
              scaleY: self.progress,
              duration: 0.1,
              ease: 'none',
            });

            // Update active dots
            const activeIndex = Math.min(
              Math.floor(self.progress * totalRows),
              totalRows - 1
            );
            const dots = section.querySelectorAll('.feature-dot');
            dots.forEach((dot, index) => {
              if (index === activeIndex) {
                gsap.to(dot, { scale: 1.5, backgroundColor: '#00a8cc', duration: 0.2 });
              } else {
                gsap.to(dot, { scale: 1, backgroundColor: 'rgba(255,255,255,0.2)', duration: 0.2 });
              }
            });
          },
        },
      });

      // Animate each row of cards
      featureRows.forEach((row, index) => {
        const isFirst = index === 0;
        const prevRow = index > 0 ? featureRows[index - 1] : null;
        const cards = row.querySelectorAll('.feature-card');
        const rowPosition = index * 0.9;

        if (!isFirst && prevRow) {
          // Fade out previous row
          const prevCards = prevRow.querySelectorAll('.feature-card');
          tl.to(
            prevRow,
            {
              opacity: 0,
              y: -80,
              duration: 0.4,
              ease: 'power3.in',
            },
            rowPosition - 0.3
          );
          prevCards.forEach((card, cardIndex) => {
            tl.to(
              card,
              {
                opacity: 0,
                y: -40,
                scale: 0.95,
                duration: 0.35,
                ease: 'power3.in',
              },
              rowPosition - 0.35 + (cardIndex * 0.05)
            );
          });

          // Fade in current row
          tl.to(
            row,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
            },
            rowPosition - 0.2
          );
          cards.forEach((card, cardIndex) => {
            tl.to(
              card,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.45,
                ease: 'power3.out',
              },
              rowPosition - 0.15 + (cardIndex * 0.08)
            );
          });
        }

        // Hold position for reading
        tl.to({}, { duration: 0.6 }, rowPosition + 0.2);
      });

      // Clean exit animation sequence
      const exitStart = totalRows * 0.9;

      // Fade out last row cards completely
      const lastRow = featureRows[totalRows - 1];
      const lastCards = lastRow.querySelectorAll('.feature-card');
      
      lastCards.forEach((card, cardIndex) => {
        tl.to(
          card,
          {
            opacity: 0,
            y: -60,
            scale: 0.9,
            duration: 0.3,
            ease: 'power3.in',
          },
          exitStart + (cardIndex * 0.05)
        );
      });

      tl.to(
        lastRow,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        },
        exitStart + 0.1
      );

      // Fade out the entire background image
      tl.to(
        image,
        {
          opacity: 0,
          scale: 1.1,
          duration: 0.4,
          ease: 'power2.inOut',
        },
        exitStart + 0.15
      );

      // Bring up the solid overlay to ensure clean transition
      tl.to(
        overlay,
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        },
        exitStart + 0.25
      );

      // Hide progress indicator
      tl.to(
        progressBar.parentElement?.parentElement || progressBar,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        exitStart + 0.2
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${featurePairs.length * 90 + 40}vh` }}
    >
      {/* Pinned Container */}
      <div
        ref={containerRef}
        className="h-screen w-full relative overflow-hidden"
      >
        {/* Background Image - Pinned */}
        <div
          ref={imageRef}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(/images/backgrounds/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        {/* Transition Overlay - covers at the end */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-b from-[#050a10] via-[#0a1628] to-[#0a1628] opacity-0 z-[5]"
        />

        {/* Progress Indicator */}
        <div className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20">
          <div className="h-48 lg:h-64 w-1 bg-white/10 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="w-full bg-gradient-to-b from-cyan-500 to-purple-500 origin-top"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            {featurePairs.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-white/20 feature-dot transition-all duration-200"
                data-index={index}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-200">Explore as Funcionalidades</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Tudo que você precisa para{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                criar
              </span>
            </h2>
          </div>
        </div>

        {/* Features Container */}
        <div
          ref={featuresRef}
          className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 lg:px-8"
        >
          <div className="relative w-full max-w-6xl h-[400px]">
            {featurePairs.map((pair, rowIndex) => (
              <div
                key={rowIndex}
                className="feature-row absolute inset-0 flex items-center justify-center gap-4 lg:gap-8"
              >
                {pair.map((feature, cardIndex) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={cardIndex}
                      className="feature-card w-full max-w-md"
                    >
                      <div
                        className={`p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-gradient-to-br ${feature.accentColor} backdrop-blur-xl border ${feature.borderColor} shadow-2xl`}
                      >
                        {/* Feature Number */}
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                          <span className="text-xs lg:text-sm font-medium text-white/60">
                            {String(rowIndex * 2 + cardIndex + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
                          </span>
                          <div
                            className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center ${feature.iconColor}`}
                          >
                            <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 lg:mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-200 leading-relaxed">
                          {feature.description}
                        </p>

                        {/* Decorative line */}
                        <div className="mt-4 lg:mt-6 h-1 w-16 lg:w-20 rounded-full bg-gradient-to-r from-white/40 to-transparent" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
