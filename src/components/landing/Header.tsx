'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isVisible: boolean;
}

export function Header({ isVisible }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isVisible && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, [isVisible]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Como Funciona', href: '#how-it-works' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Depoimentos', href: '#testimonials' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  if (!isVisible) return null;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3'
          : 'bg-transparent py-5'
      }`}
      style={{
        background: scrolled
          ? 'rgba(5, 10, 16, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0, 180, 255, 0.1)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo with Static Image */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative transition-transform duration-300 group-hover:scale-110">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="PostSpark"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 180, 255, 0.5))' }}
              />
            </div>
            <span
              className="text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 50%, #ff9500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              PostSpark
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-orange-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/dashboard">Entrar</Link>
            </Button>
            <Button
              className="font-semibold px-6 transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00a8cc 0%, #0077b6 100%)',
                boxShadow: '0 0 20px rgba(0, 180, 255, 0.3)',
              }}
              asChild
            >
              <Link href="/dashboard">
                <Sparkles className="w-4 h-4 mr-2" />
                Começar Grátis
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden mt-4 pb-4 border-t pt-4"
            style={{ borderColor: 'rgba(0, 180, 255, 0.2)' }}
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left text-gray-300 hover:text-white transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0, 180, 255, 0.2)' }}>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10 w-full"
                  asChild
                >
                  <Link href="/dashboard">Entrar</Link>
                </Button>
                <Button
                  className="font-semibold w-full"
                  style={{
                    background: 'linear-gradient(135deg, #00a8cc 0%, #0077b6 100%)',
                  }}
                  asChild
                >
                  <Link href="/dashboard">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Começar Grátis
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
