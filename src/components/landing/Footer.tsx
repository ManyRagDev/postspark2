'use client';

import { Sparkles, Twitter, Instagram, Linkedin, Youtube, Github } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', href: '#features' },
      { label: 'Preços', href: '#pricing' },
      { label: 'Integrações', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  company: {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreiras', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contato', href: '#' },
    ],
  },
  resources: {
    title: 'Recursos',
    links: [
      { label: 'Documentação', href: '#' },
      { label: 'Tutoriais', href: '#' },
      { label: 'Templates', href: '#' },
      { label: 'Comunidade', href: '#' },
      { label: 'Webinars', href: '#' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacidade', href: '#' },
      { label: 'Termos', href: '#' },
      { label: 'Cookies', href: '#' },
      { label: 'LGPD', href: '#' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="PostSpark"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold gradient-text">PostSpark</span>
            </a>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Transforme suas ideias em conteúdo brilhante para redes sociais.
              A IA que entende sua voz de marca.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PostSpark. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">Feito com</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-500">no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
