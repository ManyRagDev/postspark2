# PostSpark Landing Page - Source Code

Código-fonte original da landing page PostSpark para integração com Next.js.

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── IntroAnimation.tsx    # Animação inicial com vídeo do logo
│   ├── Header.tsx            # Navbar fixa com logo
│   └── Footer.tsx            # Rodapé
├── sections/
│   ├── HeroSection.tsx       # Seção principal
│   ├── FeaturesSection.tsx   # Grid de funcionalidades (Bento)
│   ├── StickySection.tsx     # Seção "Como Funciona" com sticky
│   ├── PricingSection.tsx    # Planos e preços
│   ├── TestimonialsSection.tsx # Depoimentos
│   └── CTASection.tsx        # Call-to-action final
├── App.tsx                   # Componente principal
├── App.css                   # Estilos específicos
├── index.css                 # Estilos globais + Tailwind
└── main.tsx                  # Entry point
```

## 🚀 Integração com Next.js

### 1. Instalar Dependências

```bash
npm install gsap @gsap/react
```

### 2. Configurar Tailwind

Adicione as cores customizadas ao seu `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(210 50% 4%)',
        foreground: 'hsl(0 0% 100%)',
        primary: {
          DEFAULT: 'hsl(192 100% 50%)',
          foreground: 'hsl(210 50% 4%)',
        },
        secondary: {
          DEFAULT: 'hsl(17 100% 60%)',
          foreground: 'hsl(0 0% 100%)',
        },
        // ... ver tailwind.config.js completo
      },
    },
  },
}
```

### 3. Copiar Estilos Globais

Copie o conteúdo de `src/index.css` para seu arquivo de estilos globais.

### 4. Adaptar Componentes para Next.js

#### IntroAnimation.tsx
- Mover para `app/components/IntroAnimation.tsx` (App Router) ou `components/IntroAnimation.tsx` (Pages Router)
- O vídeo deve estar em `public/logo-animation.webm`

#### Header.tsx
- Mover para `app/components/Header.tsx`
- Usar `'use client'` se estiver no App Router

#### Sections
- Todas as sections usam GSAP ScrollTrigger
- Adicionar `'use client'` no topo de cada arquivo

### 5. Estrutura de Página (App Router)

```tsx
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { IntroAnimation } from './components/IntroAnimation';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { StickySection } from './sections/StickySection';
import { PricingSection } from './sections/PricingSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { CTASection } from './sections/CTASection';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('postspark-intro-seen');
    if (hasSeenIntro) {
      setShowIntro(false);
      setHeaderVisible(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHeaderVisible(true);
    sessionStorage.setItem('postspark-intro-seen', 'true');
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(0, 80, 120, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(255, 100, 30, 0.05) 0%, transparent 50%),
          linear-gradient(180deg, #050a10 0%, #0a1628 30%, #0a1628 70%, #050a10 100%)
        `,
      }}
    >
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      <Header isVisible={headerVisible} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StickySection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
```

### 6. Assets Necessários

Copie para a pasta `public/`:
- `logo.png` - Logo estático
- `logo-animation.webm` - Vídeo da animação

### 7. Componentes UI

Os componentes usam shadcn/ui. Instale os necessários:

```bash
npx shadcn add button switch
```

Ou adapte para usar seus próprios componentes de botão.

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Cyan | `#00d4ff` | Destaques primários |
| Cyan Escuro | `#00a8cc` | Botões, gradientes |
| Laranja | `#ff6b35` | Destaques secundários |
| Laranja Claro | `#ff9500` | Gradientes |
| Fundo | `#050a10` | Background principal |
| Fundo Claro | `#0a1628` | Seções |

## 📦 Dependências

```json
{
  "dependencies": {
    "gsap": "^3.12.5",
    "@gsap/react": "^2.1.0",
    "lucide-react": "^0.x"
  }
}
```

## ⚠️ Notas Importantes

1. **GSAP ScrollTrigger**: Registre o plugin no useEffect de cada section:
   ```tsx
   useEffect(() => {
     gsap.registerPlugin(ScrollTrigger);
     // ... animações
   }, []);
   ```

2. **Vídeo**: O vídeo `.webm` deve ter fundo transparente ou harmonizado com o background.

3. **Responsividade**: Todos os componentes são responsivos (mobile-first).

4. **Performance**: As animações usam `will-change` e `transform` para GPU acceleration.

## 🔧 Customização

- **Velocidade da intro**: Ajuste `duration` no `IntroAnimation.tsx`
- **Cores**: Modifique as variáveis CSS em `index.css`
- **Conteúdo**: Edite os textos diretamente nos componentes

---

**Desenvolvido com ❤️ para PostSpark**
