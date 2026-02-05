'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'Starter',
    icon: Sparkles,
    description: 'Perfeito para começar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 contas de rede social',
      '10 posts por mês com IA',
      'Templates básicos',
      'Agendamento simples',
      'Analytics básico',
    ],
    cta: 'Começar Grátis',
    popular: false,
    gradient: 'from-gray-500/20 to-gray-600/20',
  },
  {
    name: 'Pro',
    icon: Zap,
    description: 'Para criadores sérios',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '10 contas de rede social',
      'Posts ilimitados com IA',
      'Templates premium',
      'Agendamento avançado',
      'Analytics completo',
      'Respostas automáticas',
      'Suporte prioritário',
    ],
    cta: 'Começar Trial',
    popular: true,
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    name: 'Enterprise',
    icon: Crown,
    description: 'Para equipes e agências',
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      'Contas ilimitadas',
      'Posts ilimitados com IA',
      'Templates customizados',
      'API access',
      'Analytics avançado',
      'Gerenciamento de equipe',
      'Suporte dedicado 24/7',
      'Onboarding personalizado',
    ],
    cta: 'Falar com Vendas',
    popular: false,
    gradient: 'from-orange-500/20 to-yellow-500/20',
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isYearly, setIsYearly] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.pricing-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
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
      id="pricing"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Planos e Preços</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Escolha o plano{' '}
            <span className="gradient-text">perfeito para você</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Comece gratuitamente e evolua conforme suas necessidades.
            Todos os planos incluem atualizações gratuitas.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
              Mensal
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-cyan-500"
            />
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-500'}`}>
              Anual
            </span>
            {isYearly && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                Economize 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card relative rounded-2xl lg:rounded-3xl overflow-hidden ${
                plan.popular
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 scale-105 z-10'
                  : 'bg-white/5 border border-white/10'
              } p-6 lg:p-8`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-bl-xl">
                  Mais Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-white">
                    R${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500">/mês</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Cobrado anualmente (R${plan.yearlyPrice * 12}/ano)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } font-semibold py-6`}
                asChild
              >
                <Link href="/dashboard">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Confiado por mais de 50.000 criadores</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {['Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'YouTube'].map((platform) => (
              <span key={platform} className="text-gray-400 font-medium">{platform}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
