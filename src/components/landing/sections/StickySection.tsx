'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Check, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: 'Digite sua ideia',
    description: 'Escreva o conceito do seu post. Nossa IA detecta automaticamente o estado do conteúdo (motivacional, promocional, educacional, etc.).',
  },
  {
    number: '02',
    title: 'Personalize o design',
    description: 'Escolha entre 6 layouts, selecione um background da galeria ou gere com IA, ajuste cores, fontes e overlays.',
  },
  {
    number: '03',
    title: 'Exporte e publique',
    description: 'Baixe seu post pronto para Instagram, LinkedIn ou qualquer rede social. Formatos: 1:1, 5:6 ou 9:16.',
  },
];

export function StickySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section entrance - fade in from below
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            end: 'top 60%',
            scrub: 1,
          },
        }
      );

      // Title animation
      const titleElement = contentRef.current?.querySelector('h2');
      if (titleElement) {
        gsap.fromTo(
          titleElement,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Steps animation
      const stepElements = stepsRef.current?.querySelectorAll('.step-item');
      if (stepElements) {
        gsap.fromTo(
          stepElements,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative min-h-[110vh] bg-gradient-to-b from-[#050a10] via-[#0a1628] to-[#0a1628]"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background Image - starts clear for smooth transition */}
        <div
          ref={imageRef}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-purple-900/40 to-orange-900/40" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Abstract shapes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[120px]" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <div ref={contentRef}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white">Como Funciona</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  De ideia ao download em{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">
                    3 passos simples
                  </span>
                </h2>

                <p className="text-lg text-gray-300 mb-8">
                  Nossa plataforma foi projetada para simplificar sua criação de conteúdo
                  e maximizar o impacto visual dos seus posts.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8"
                    asChild
                  >
                    <Link href="/dashboard">
                      Experimentar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Ver Tutorial
                  </Button>
                </div>
              </div>

              {/* Right Content - Steps */}
              <div ref={stepsRef} className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="step-item group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{step.number}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Check indicator */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>

                    {/* Progress line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[2.25rem] top-[4.5rem] w-0.5 h-8 bg-gradient-to-b from-cyan-500/50 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
