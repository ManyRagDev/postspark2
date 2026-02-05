import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  Zap,
  Palette,
  Calendar,
  BarChart3,
  MessageSquare,
  Share2,
  Wand2,
  Target,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Sparkles,
    title: 'Geração com IA',
    description: 'Crie posts envolventes em segundos com nossa IA treinada nas melhores práticas de cada plataforma.',
    size: 'large',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Palette,
    title: 'Design Inteligente',
    description: 'Templates adaptativos que se ajustam automaticamente à sua marca.',
    size: 'medium',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Calendar,
    title: 'Agendamento',
    description: 'Programe posts para o momento ideal de engajamento.',
    size: 'medium',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    iconColor: 'text-orange-400',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Métricas detalhadas e insights acionáveis para otimizar sua estratégia de conteúdo em todas as plataformas.',
    size: 'large',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
  },
  {
    icon: Share2,
    title: 'Multi-plataforma',
    description: 'Publique simultaneamente no Instagram, LinkedIn, Twitter e mais.',
    size: 'small',
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: MessageSquare,
    title: 'Respostas Automáticas',
    description: 'IA que responde comentários mantendo sua voz de marca.',
    size: 'small',
    gradient: 'from-indigo-500/20 to-violet-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Target,
    title: 'Segmentação',
    description: 'Alcance o público certo na hora certa.',
    size: 'small',
    gradient: 'from-red-500/20 to-orange-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: Wand2,
    title: 'Otimização Automática',
    description: 'Ajustes automáticos baseados no desempenho.',
    size: 'small',
    gradient: 'from-teal-500/20 to-cyan-500/20',
    iconColor: 'text-teal-400',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      const cards = gridRef.current?.querySelectorAll('.bento-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
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
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">Funcionalidades Poderosas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Tudo que você precisa para{' '}
            <span className="gradient-text">brilhar</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Uma suite completa de ferramentas impulsionadas por IA para criar, 
            agendar e analisar seu conteúdo de redes sociais.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {features.map((feature, index) => {
            const sizeClasses = {
              large: 'md:col-span-2 lg:col-span-2 lg:row-span-2',
              medium: 'md:col-span-1 lg:col-span-2',
              small: 'md:col-span-1 lg:col-span-1',
            };

            return (
              <div
                key={index}
                className={`bento-card relative group rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br ${feature.gradient} border border-white/10 p-6 lg:p-8 ${sizeClasses[feature.size as keyof typeof sizeClasses]}`}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-xl`} />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 lg:w-7 lg:h-7 ${feature.iconColor}`} />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 lg:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm lg:text-base text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="mt-auto pt-4 lg:pt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                      <span>Saiba mais</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
