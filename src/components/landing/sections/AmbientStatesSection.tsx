'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Flame, BookOpen, MessageSquare, Lightbulb, Zap, PenTool } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ambientStates = [
  {
    icon: Sparkles,
    emoji: '✨',
    title: 'Motivacional',
    example: '"Nunca desista dos seus sonhos"',
    layout: 'Centered',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Flame,
    emoji: '🔥',
    title: 'Promocional',
    example: '"50% OFF em todos os produtos"',
    layout: 'Hierarchy',
    gradient: 'from-red-500/20 to-orange-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: BookOpen,
    emoji: '📚',
    title: 'Educacional',
    example: '"Como criar posts virais em 5 passos"',
    layout: 'Carousel',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
  },
  {
    icon: MessageSquare,
    emoji: '💭',
    title: 'Pessoal',
    example: '"Minha jornada de empreendedor"',
    layout: 'Split',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Lightbulb,
    emoji: '💡',
    title: 'Informativo',
    example: '"Você sabia que 80% dos usuários..."',
    layout: 'Card',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'Controversial',
    example: '"O segredo que ninguém te conta"',
    layout: 'Headline',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: PenTool,
    emoji: '✏️',
    title: 'Neutro',
    example: '"Bem-vindo ao nosso perfil"',
    layout: 'Centered',
    gradient: 'from-gray-500/20 to-slate-500/20',
    iconColor: 'text-gray-400',
  },
];

export function AmbientStatesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation - aparece quando a seção entra na viewport
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards animation with stagger - aparecem suavemente
      const cards = gridRef.current?.querySelectorAll('.ambient-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ambient-states"
      ref={sectionRef}
      className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-[#050a10] to-[#0a1628]"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Estados Ambientais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            IA que entende o{' '}
            <span className="gradient-text">tom do seu conteúdo</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Nossa IA detecta automaticamente o estado do seu conteúdo e adapta o design
            para maximizar o impacto visual.
          </p>
        </div>

        {/* Ambient States Grid */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {ambientStates.map((state, index) => (
            <div
              key={index}
              className={`ambient-card group relative bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-white/20`}
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${state.gradient} blur-xl`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <state.icon className={`w-6 h-6 ${state.iconColor}`} />
                  </div>
                  <span className="text-3xl">{state.emoji}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {state.title}
                </h3>

                {/* Example */}
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  {state.example}
                </p>

                {/* Layout Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="text-xs text-gray-300">Layout:</span>
                  <span className="text-xs font-medium text-white">{state.layout}</span>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
