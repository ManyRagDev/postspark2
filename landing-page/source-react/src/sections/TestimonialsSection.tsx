import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Ana Silva',
    role: 'Influenciadora Digital',
    avatar: 'AS',
    content: 'O PostSpark transformou completamente minha rotina de conteúdo. Consigo criar posts de qualidade em minutos, o que antes levava horas. Meu engajamento aumentou 300%!',
    rating: 5,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Carlos Mendes',
    role: 'CEO, TechStart',
    content: 'Como empresa B2B, precisávamos de conteúdo profissional para o LinkedIn. O PostSpark entregou exatamente isso, com uma IA que entende nossa voz de marca.',
    rating: 5,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Marina Costa',
    role: 'Social Media Manager',
    avatar: 'MC',
    content: 'Gerencio 15 contas diferentes. O PostSpark me permite manter a qualidade em todas elas sem trabalhar fins de semana. É um game changer!',
    rating: 5,
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    name: 'Pedro Oliveira',
    role: 'Criador de Conteúdo',
    avatar: 'PO',
    content: 'A funcionalidade de agendamento inteligente é incrível. Minhas publicações sempre saem no horário de pico de engajamento. Resultado: 5x mais alcance.',
    rating: 5,
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    name: 'Julia Santos',
    role: 'Empreendedora',
    avatar: 'JS',
    content: 'Comecei com o plano gratuito e em 2 semanas já vi resultados. Agora sou Pro e não imagino minha rotina sem o PostSpark.',
    rating: 5,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Ricardo Lima',
    role: 'Diretor de Marketing',
    avatar: 'RL',
    content: 'Nossa equipe economiza 20 horas semanais com o PostSpark. O ROI foi imediato e os resultados falam por si.',
    rating: 5,
    gradient: 'from-indigo-500 to-blue-500',
  },
];

export function TestimonialsSection() {
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

      // Cards animation with stagger
      const cards = gridRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: {
              each: 0.1,
              from: 'random',
            },
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
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
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
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Depoimentos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            O que nossos usuários{' '}
            <span className="gradient-text">estão dizendo</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Junte-se a milhares de criadores e empresas que já transformaram 
            sua presença nas redes sociais com o PostSpark.
          </p>
        </div>

        {/* Testimonials Grid - Masonry style */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`testimonial-card group relative bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-white/20 ${
                index === 0 || index === 3 ? 'lg:row-span-2' : ''
              }`}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-cyan-400" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}>
                  <span className="text-white font-semibold">
                    {testimonial.avatar || testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-orange-500/5 rounded-2xl lg:rounded-3xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '50K+', label: 'Usuários Ativos' },
            { value: '2M+', label: 'Posts Criados' },
            { value: '4.9', label: 'Avaliação Média' },
            { value: '300%', label: 'Aumento Médio de Engajamento' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
