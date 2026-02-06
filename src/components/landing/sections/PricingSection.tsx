'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'FREE',
    icon: Sparkles,
    description: 'Comece a criar gratuitamente',
    monthlyPrice: 0,
    yearlyPrice: 0,
    sparks: '50 sparks',
    sparksPeriod: 'única vez',
    features: [
      '50 Sparks para testar',
      'Motor: Smart Match',
      'Formato: Post 1:1',
      'Marca d\'água obstrutiva',
      'Download preview (baixa res)',
    ],
    notIncluded: [
      'Sem regenerações grátis',
      'Sem carrossel',
      'Sem geração de imagens IA',
    ],
    cta: 'Começar Grátis',
    ctaLink: '/signup',
    popular: false,
    gradient: 'from-gray-500/20 to-gray-600/20',
  },
  {
    name: 'LITE',
    icon: Zap,
    description: 'Para criadores individuais',
    monthlyPrice: 19,
    yearlyPrice: 15,
    sparks: '300 sparks',
    sparksPeriod: 'por mês',
    features: [
      '300 Sparks/mês',
      'Motores: Smart Match + Pollinations',
      'Todos os formatos (1:1, 4:5, 9:16)',
      'Preview limpo sem marca',
      'Download HD (1080px)',
      '1 Regeneração grátis (Pollinations)',
    ],
    notIncluded: [
      'Sem Nano Banana Pro',
      'Sem carrossel IA',
    ],
    cta: 'Começar Trial',
    ctaLink: '/signup?plan=LITE',
    popular: true,
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    name: 'PRO',
    icon: Crown,
    description: 'Para profissionais de conteúdo',
    monthlyPrice: 79,
    yearlyPrice: 63,
    sparks: '1.500 sparks',
    sparksPeriod: 'por mês',
    features: [
      '1.500 Sparks/mês',
      'Todos os motores (incl. Nano Banana Pro)',
      'Carrosséis IA ilimitados',
      'SEO 2026 para legenda',
      'Regenerações: 2-20 Sparks',
      'Todos os formatos + Carrossel',
    ],
    notIncluded: [],
    cta: 'Virar PRO',
    ctaLink: '/signup?plan=PRO',
    popular: false,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    name: 'AGENCY',
    icon: Building2,
    description: 'Para agências e equipes',
    monthlyPrice: 249,
    yearlyPrice: 199,
    sparks: '5.000 sparks',
    sparksPeriod: 'por mês',
    features: [
      '5.000 Sparks/mês',
      'Tudo do PRO',
      'Brand Kits ilimitados',
      'Gestão de múltiplos clientes',
      'Suporte prioritário',
      'Onboarding personalizado',
    ],
    notIncluded: [],
    cta: 'Disponível em breve',
    ctaLink: null, // No link for coming soon
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
      className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#050a10]"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Top transition gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a1628] to-transparent z-0" />

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
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4">
            Pague apenas pelo que usar. Cada geração consome Sparks.
            Quanto mais você usa, mais economiza.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Sparks acumulam e nunca expiram. Upgrade ou downgrade a qualquer momento.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
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
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card relative rounded-2xl lg:rounded-3xl overflow-hidden ${plan.popular
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 scale-105 z-10'
                  : 'bg-white/5 border border-white/10'
                } p-6 lg:p-6`}
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

              {/* Sparks Info */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold text-white">{plan.sparks}</span>
                </div>
                <span className="text-xs text-gray-500 ml-7">{plan.sparksPeriod}</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    R${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-400">/mês</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    R${plan.yearlyPrice * 12} cobrado anualmente
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, featureIndex) => (
                  <li key={`not-${featureIndex}`} className="flex items-start gap-3 opacity-50">
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-600">×</span>
                    <span className="text-sm text-gray-500 line-through">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.ctaLink ? (
                <Link href={plan.ctaLink} className="block">
                  <Button
                    className={`w-full ${plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600"
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Sparks Explanation */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Como funcionam os Sparks? ⚡</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-cyan-400 mb-2">10</div>
              <p className="text-sm text-gray-400">Sparks por Post Estático</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">25</div>
              <p className="text-sm text-gray-400">Sparks por Imagem Express</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-pink-400 mb-2">80</div>
              <p className="text-sm text-gray-400">Sparks por Nano Banana Pro</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-orange-400 mb-2">100</div>
              <p className="text-sm text-gray-400">Sparks por Carrossel IA</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Regenerações a partir de 2 Sparks. Cada tipo de regeneração é gratuita 1x por post.
          </p>
        </div>
      </div>
    </section>
  );
}
