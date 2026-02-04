# 📚 Investigação Completa: Controladores de Design da V1

> **Data**: 3 de Fevereiro de 2026  
> **Objetivo**: Documentar detalhadamente todos os 6 módulos de controle de design da versão anterior (V1) para reaproveitamento na V2  
> **Status**: ✅ Investigação Concluída

---

## 📖 Sumário Executivo

A versão 1 do PostSpark possuía **6 módulos de controle de design** que permitiam aos usuários customizar completamente seus posts após a geração automática com IA. Este documento detalha:

1. **TextModule.tsx** - Edição de texto
2. **ImageModule.tsx** - Controle de imagem (ALTAMENTE REAPROVEITÁVEL)
3. **DesignModule.tsx** - Paletas e templates (ALTAMENTE REAPROVEITÁVEL)
4. **LayoutModule.tsx** - Posições e alinhamento
5. **CopyModule.tsx** - Legendas e hashtags (REAPROVEITÁVEL)
6. **AdvancedModule.tsx** - Configurações avançadas

---

## 1️⃣ TextModule.tsx - Edição de Texto

### 🎯 Objetivo
Permitir que o usuário edite e customize todos os elementos de texto do post com controles avançados de tipografia.

### 📋 Funcionalidades Principais

#### A) Edição de Campos de Texto
Permitia edição de 4 campos principais:

```typescript
interface TextFields {
  title: string;          // Headline principal (máx: 60 caracteres)
  subtitle: string;       // Texto de suporte (máx: 80 caracteres)
  bodyText: string;       // Corpo principal (máx: 150 caracteres)
  cta: string;           // Call-To-Action (máx: 40 caracteres)
}
```

**Características:**
- Cada campo com contador de caracteres
- Validação de limite em tempo real
- Preview ao vivo enquanto digita
- Sugestões de IA (melhorar texto com IA)

#### B) Controles de Fonte (FontFamily)
```typescript
interface FontControls {
  titleFont: string;     // Inter, Plus Jakarta Sans, Merriweather, etc
  subtitleFont: string;
  bodyFont: string;
  ctaFont: string;
}

// Fontes disponíveis:
const AVAILABLE_FONTS = [
  'Inter',
  'Plus Jakarta Sans',
  'Merriweather',
  'Playfair Display',
  'JetBrains Mono',
  'Poppins',
  'Montserrat'
];
```

**UI**: Dropdown com preview live de cada fonte

#### C) Controles de Tamanho (FontSize)
```typescript
interface FontSizes {
  titleFontSize: number;       // 24px - 72px (default: 42px)
  subtitleFontSize: number;    // 16px - 48px (default: 24px)
  bodyTextFontSize: number;    // 12px - 32px (default: 16px)
  ctaFontSize: number;         // 12px - 28px (default: 14px)
}
```

**Ui**: Sliders com input numérico, range recomendado por hierarquia

#### D) Controles de Peso (FontWeight)
```typescript
interface FontWeights {
  titleWeight: 'normal' | 'semibold' | 'bold';      // default: bold
  subtitleWeight: 'normal' | 'semibold' | 'bold';   // default: semibold
  bodyWeight: 'normal' | 'semibold' | 'bold';       // default: normal
  ctaWeight: 'normal' | 'semibold' | 'bold';        // default: semibold
}
```

#### E) Controles de Espaçamento (LineHeight)
```typescript
interface LineHeightControls {
  titleLineHeight: number;     // 1.0 - 2.0 (default: 1.2)
  subtitleLineHeight: number;  // 1.2 - 2.2 (default: 1.4)
  bodyLineHeight: number;      // 1.4 - 2.0 (default: 1.6)
}
```

### 🎨 Estrutura de Dados Completa
```typescript
interface TextModuleData {
  // Conteúdo
  title: string;
  subtitle: string;
  bodyText: string;
  cta: string;
  
  // Fonte
  titleFont: string;
  subtitleFont: string;
  bodyFont: string;
  ctaFont: string;
  
  // Tamanho
  titleFontSize: number;
  subtitleFontSize: number;
  bodyTextFontSize: number;
  ctaFontSize: number;
  
  // Peso
  titleWeight: FontWeight;
  subtitleWeight: FontWeight;
  bodyWeight: FontWeight;
  ctaWeight: FontWeight;
  
  // Espaçamento
  titleLineHeight: number;
  subtitleLineHeight: number;
  bodyLineHeight: number;
}
```

### ⚠️ Problemas Identificados na V1
- Interface poluída com muitos inputs
- Sem preview side-by-side do resultado
- Limite de caracteres podia ser confuso
- Sem modo dark/light toggle

### ✅ Reaproveitamento Recomendado
- **Percentual**: 60%
- **O que reusar**: Estrutura de dados, validações, lógica de limites
- **O que reescrever**: UI/UX com tabs, preview melhorado, IA integrada

---

## 2️⃣ ImageModule.tsx - Controle de Imagem

### 🎯 Objetivo
Dar controle total ao usuário sobre a imagem de fundo: upload customizado, ajustes visuais, efeitos e posicionamento.

### 📋 Funcionalidades Principais

#### A) Upload de Imagem Customizada

**Suporte de Formatos:**
- JPG (JPEG)
- PNG (com transparência)
- WEBP (compressão moderna)

**Limite de Tamanho**: 5MB por arquivo

**Implementação:**
```typescript
const handleImageUpload = async (file: File) => {
  // Validações
  if (!file.type.match(/image\/(jpeg|png|webp)/)) {
    throw new Error('Formato não suportado');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Arquivo muito grande (máx: 5MB)');
  }
  
  // FileReader para preview local
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageData = e.target?.result; // base64
    updatePostData('customImage', imageData);
  };
  reader.readAsDataURL(file);
};
```

#### B) Ajustes de Imagem com Sliders

**1) Zoom/Scale**
```typescript
interface ZoomControl {
  zoomLevel: number;  // 0.5 - 3.0 (default: 1.0)
  // 0.5 = reduz 50%, 1.0 = tamanho original, 3.0 = 3x maior
}
```

**Como funciona:**
- Aplica `transform: scale(zoomLevel)` no canvas
- Permite ampliar detalhes ou reduzir para efeito panorâmico
- Preview em tempo real

**UI**: 
```
Zoom: [░░░░░░░░░░] 1.0x
      0.5x       3.0x
```

**2) Brightness**
```typescript
interface BrightnessControl {
  brightness: number;  // 0.5 - 1.5 (default: 1.0)
  // 0.5 = escuro demais, 1.0 = normal, 1.5 = muito claro
}
```

**CSS Aplicado:**
```css
filter: brightness(1.2);  /* Exemplo com 1.2 */
```

**UI**:
```
Brilho: [░░░░░░░░░░] 1.0
        0.5         1.5
```

**3) Posição (Pan)**
```typescript
interface PanControl {
  positionX: number;  // -100 a 100 (default: 0)
  positionY: number;  // -100 a 100 (default: 0)
}
```

**Como funciona:**
- Permite mover a imagem dentro do canvas
- Util para centralizar elementos da imagem
- Aplicado via `transform: translate(X%, Y%)`

#### C) Efeitos Visuais

**1) Overlay Escuro**
```typescript
interface OverlayEffect {
  overlayOpacity: number;  // 0 - 1 (default: 0.3)
  overlayColor: string;    // hex color (default: '#000000')
  // Criava uma camada semi-transparente sobre a imagem
  // Melhorava legibilidade do texto
}
```

**CSS:**
```css
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}
```

**2) Blur (Desfoque)**
```typescript
interface BlurEffect {
  blurLevel: number;  // 0 - 10px (default: 0)
}

// CSS: filter: blur(5px);
```

**3) Blend Mode**
```typescript
type BlendMode = 'overlay' | 'multiply' | 'screen' | 'darken' | 'lighten';

interface BlendModeControl {
  blendMode: BlendMode;  // default: 'overlay'
}

// CSS: mix-blend-mode: overlay;
```

#### D) Aplicação de Filtros CSS

```typescript
interface ImageFilters {
  saturation: number;      // 0 - 2 (default: 1.0)
  contrast: number;        // 0.5 - 2 (default: 1.0)
  hueRotation: number;     // 0 - 360 (default: 0)
  sepia: number;          // 0 - 1 (default: 0)
  grayscale: number;      // 0 - 1 (default: 0)
}

// Aplicado como: filter: saturate(1.2) contrast(1.1) hue-rotate(10deg);
```

### 🎨 Estrutura de Dados Completa
```typescript
interface ImageModuleData {
  // Upload
  customImage: string | null;  // base64 ou URL
  
  // Ajustes de transformação
  zoom: number;                // 0.5 - 3.0
  brightness: number;          // 0.5 - 1.5
  positionX: number;           // -100 a 100
  positionY: number;           // -100 a 100
  
  // Efeitos
  overlayOpacity: number;      // 0 - 1
  overlayColor: string;        // hex
  blurLevel: number;           // 0 - 10px
  blendMode: BlendMode;        // overlay, multiply, etc
  
  // Filtros CSS
  saturation: number;          // 0 - 2
  contrast: number;            // 0.5 - 2
  hueRotation: number;         // 0 - 360
  sepia: number;              // 0 - 1
  grayscale: number;          // 0 - 1
}
```

### ✅ Reaproveitamento Recomendado
- **Percentual**: 95% (MUITO ALTO!)
- **Status**: REUSAR QUASE INTEGRALMENTE
- **Apenas adaptar**: UI para nova versão, integração com upload server
- **Manter**: Toda a lógica de transformação, sliders, validações

---

## 3️⃣ DesignModule.tsx - Paletas e Templates

### 🎯 Objetivo
Permitir que usuários escolham entre paletas de cores predefinidas e templates de layout para customizar a aparência geral do post.

### 📋 Funcionalidades Principais

#### A) Sistema de 10 Paletas de Cores

**Paletas Implementadas na V1:**

```typescript
export const PALETTES: Record<string, ColorPalette> = {
  
  // 1. WARM NIGHT - Noite Quente
  'warm_night': {
    id: 'warm_night',
    name: 'Noite Quente',
    description: 'Tons quentes de azul e laranja para criação noturna',
    colors: {
      background: '#0f0f14',      // Preto azulado
      text: '#ffffff',             // Branco puro
      accent: '#ff8c42',          // Laranja quente
      secondary: '#7f39fb',       // Roxo vibrante
      tertiary: '#fbbf24'         // Âmbar
    },
    preview: 'linear-gradient(135deg, #0f0f14 0%, #7f39fb 50%, #ff8c42 100%)',
    bestFor: ['Conteúdo criativo', 'Posts noturnos', 'Eventos']
  },
  
  // 2. OCEAN - Oceano
  'ocean': {
    id: 'ocean',
    name: 'Oceano',
    description: 'Azuis profundos e ciano para frescor e tecnologia',
    colors: {
      background: '#0a1428',      // Azul escuro
      text: '#ffffff',
      accent: '#00d4ff',          // Ciano vibrante
      secondary: '#5b8dee',       // Azul céu
      tertiary: '#e0f2fe'         // Azul claro
    },
    preview: 'linear-gradient(135deg, #0a1428 0%, #5b8dee 50%, #00d4ff 100%)',
    bestFor: ['Tech', 'SaaS', 'Inovação']
  },
  
  // 3. VIBRANT GREEN - Verde Vibrante
  'vibrant_green': {
    id: 'vibrant_green',
    name: 'Verde Vibrante',
    description: 'Verdes brilhantes para sustentabilidade e crescimento',
    colors: {
      background: '#0a2e1f',      // Verde escuro
      text: '#ffffff',
      accent: '#22c55e',          // Verde claro
      secondary: '#84cc16',       // Limão
      tertiary: '#fbbf24'         // Âmbar
    },
    preview: 'linear-gradient(135deg, #0a2e1f 0%, #22c55e 50%, #84cc16 100%)',
    bestFor: ['Sustentabilidade', 'Saúde', 'Crescimento']
  },
  
  // 4. SUNSET - Pôr do Sol
  'sunset': {
    id: 'sunset',
    name: 'Pôr do Sol',
    description: 'Laranja e rosa para ambientes calorosos e acolhedores',
    colors: {
      background: '#1f1515',      // Marrom escuro
      text: '#ffffff',
      accent: '#ff6b35',          // Laranja
      secondary: '#f7931e',       // Laranja médio
      tertiary: '#ff1744'         // Rosa
    },
    preview: 'linear-gradient(135deg, #1f1515 0%, #ff6b35 50%, #ff1744 100%)',
    bestFor: ['Lifestyle', 'Food', 'Viagens']
  },
  
  // 5. NIGHT MODE - Modo Noite
  'night_mode': {
    id: 'night_mode',
    name: 'Modo Noite',
    description: 'Preto puro com roxo para máximo contraste',
    colors: {
      background: '#0a0a0f',      // Preto quase puro
      text: '#ffffff',
      accent: '#a855f7',          // Roxo
      secondary: '#8b5cf6',       // Roxo médio
      tertiary: '#d8b4fe'         // Roxo claro
    },
    preview: 'linear-gradient(135deg, #0a0a0f 0%, #a855f7 50%, #8b5cf6 100%)',
    bestFor: ['Dark mode', 'Tech', 'Gaming']
  },
  
  // 6. FOREST - Floresta
  'forest': {
    id: 'forest',
    name: 'Floresta',
    description: 'Verdes naturais para autenticidade e confiança',
    colors: {
      background: '#1a2e1a',      // Verde escuro profundo
      text: '#ffffff',
      accent: '#34d399',          // Verde água
      secondary: '#10b981',       // Verde médio
      tertiary: '#6ee7b7'         // Verde claro
    },
    preview: 'linear-gradient(135deg, #1a2e1a 0%, #10b981 50%, #34d399 100%)',
    bestFor: ['Natureza', 'Wellness', 'Sustentabilidade']
  },
  
  // 7. CRIMSON - Carmesim
  'crimson': {
    id: 'crimson',
    name: 'Carmesim',
    description: 'Vermelho profundo para paixão e urgência',
    colors: {
      background: '#2a0a0a',      // Vermelho muito escuro
      text: '#ffffff',
      accent: '#dc2626',          // Vermelho brilhante
      secondary: '#ef4444',       // Vermelho médio
      tertiary: '#fca5a5'         // Vermelho claro
    },
    preview: 'linear-gradient(135deg, #2a0a0a 0%, #dc2626 50%, #ef4444 100%)',
    bestFor: ['Alerta', 'Promoção', 'Urgência']
  },
  
  // 8. INDIGO - Índigo
  'indigo': {
    id: 'indigo',
    name: 'Índigo',
    description: 'Azul profundo para profissionalismo e confiança',
    colors: {
      background: '#1e1b4b',      // Índigo muito escuro
      text: '#ffffff',
      accent: '#6366f1',          // Índigo brilhante
      secondary: '#818cf8',       // Índigo médio
      tertiary: '#c7d2fe'         // Índigo claro
    },
    preview: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 50%, #818cf8 100%)',
    bestFor: ['Negócios', 'SaaS', 'Corporativo']
  },
  
  // 9. PEACHY - Pêssego
  'peachy': {
    id: 'peachy',
    name: 'Pêssego',
    description: 'Tons quentes de rosa e pêssego para leveza',
    colors: {
      background: '#2a1810',      // Marrom claro
      text: '#ffffff',
      accent: '#fb923c',          // Pêssego
      secondary: '#f97316',       // Laranja pêssego
      tertiary: '#fed7aa'         // Pêssego claro
    },
    preview: 'linear-gradient(135deg, #2a1810 0%, #fb923c 50%, #f97316 100%)',
    bestFor: ['Lifestyle', 'Beleza', 'Alimentos']
  },
  
  // 10. CYBER - Cibernético
  'cyber': {
    id: 'cyber',
    name: 'Cibernético',
    description: 'Rosa neon e ciano para futurismo extremo',
    colors: {
      background: '#0a0a14',      // Preto azulado
      text: '#ffffff',
      accent: '#ec4899',          // Rosa neon
      secondary: '#00d4ff',       // Ciano neon
      tertiary: '#ff006e'         // Rosa intenso
    },
    preview: 'linear-gradient(135deg, #0a0a14 0%, #ec4899 50%, #00d4ff 100%)',
    bestFor: ['Tech', 'Gaming', 'Futurista']
  }
};
```

**Estrutura de Cada Paleta:**
```typescript
interface ColorPalette {
  id: string;                    // Identificador único
  name: string;                  // Nome exibível
  description: string;           // Descrição da paleta
  colors: {
    background: string;          // Cor de fundo (hex)
    text: string;               // Cor de texto
    accent: string;             // Cor destaque principal
    secondary: string;          // Cor destaque secundária
    tertiary: string;           // Cor adicional
  };
  preview: string;              // CSS gradient para preview
  bestFor: string[];            // Casos de uso sugeridos
}
```

#### B) Seletor de Templates

**Templates Disponíveis (exemplos):**
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  layout: {
    titlePosition: Position;
    bodyPosition: Position;
    ctaPosition: Position;
    imageRatio: number;  // 0-100 percentual
  };
  bestFor: string[];
}

const TEMPLATES = [
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Layout clean com título grande e texto pequeno',
    layout: {
      titlePosition: 'top-center',
      bodyPosition: 'bottom-center',
      ctaPosition: 'bottom-right',
      imageRatio: 60
    },
    bestFor: ['Produtos', 'Tecnologia']
  },
  {
    id: 'classico',
    name: 'Clássico',
    description: 'Estrutura tradicional com partes iguais',
    layout: {
      titlePosition: 'top-center',
      bodyPosition: 'middle-center',
      ctaPosition: 'bottom-center',
      imageRatio: 50
    },
    bestFor: ['Geral', 'Artigos']
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Sem imagem, foco apenas em texto',
    layout: {
      titlePosition: 'top-center',
      bodyPosition: 'middle-center',
      ctaPosition: 'bottom-center',
      imageRatio: 20
    },
    bestFor: ['Minimalista', 'Poesia']
  },
  // ... mais templates
];
```

#### C) Configurações de Plataforma

```typescript
interface PlatformConfig {
  id: string;
  name: string;
  aspectRatio: string;      // ex: '1:1', '4:5', '9:16'
  width: number;            // pixels
  height: number;           // pixels
  maxChars: number;         // limite de caracteres
  bestPractices: string[];
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  'instagram_feed': {
    id: 'instagram_feed',
    name: 'Instagram Feed',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    maxChars: 2200,
    bestPractices: [
      'Use 30 hashtags no máximo',
      'Primeira linha crítica',
      'Emojis quebram o texto'
    ]
  },
  'instagram_story': {
    id: 'instagram_story',
    name: 'Instagram Story',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxChars: 150,
    bestPractices: [
      'Simples e impactante',
      'Foco em imagem grande',
      'Texto grande e legível'
    ]
  },
  'linkedin': {
    id: 'linkedin',
    name: 'LinkedIn Post',
    aspectRatio: '4:3',
    width: 1200,
    height: 900,
    maxChars: 3000,
    bestPractices: [
      'Profissional mas amigável',
      'Use hashtags (#), não @',
      'Primeira linha importante'
    ]
  },
  'twitter': {
    id: 'twitter',
    name: 'Twitter / X',
    aspectRatio: '16:9',
    width: 1600,
    height: 900,
    maxChars: 280,
    bestPractices: [
      'Conciso e impactante',
      'Use conversação',
      'Emojis quebram padrão'
    ]
  },
  'tiktok': {
    id: 'tiktok',
    name: 'TikTok',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxChars: 150,
    bestPractices: [
      'Muito visual',
      'Trending sounds',
      'Rápido e envolvente'
    ]
  },
  'facebook': {
    id: 'facebook',
    name: 'Facebook',
    aspectRatio: '4:5',
    width: 1200,
    height: 1500,
    maxChars: 1500,
    bestPractices: [
      'Engajamento importante',
      'Perguntas funcionam',
      'Compartilhamento fácil'
    ]
  }
};
```

### 🎨 Estrutura de Dados Completa
```typescript
interface DesignModuleData {
  // Paleta
  colorPalette: string;         // ID da paleta selecionada
  
  // Template
  template: string;             // ID do template
  
  // Plataforma
  platform: string;             // instagram_feed, linkedin, etc
  aspectRatio: string;          // 1:1, 9:16, etc
  
  // Cores customizadas (override)
  customColors?: {
    background?: string;
    text?: string;
    accent?: string;
  };
}
```

### ✅ Reaproveitamento Recomendado
- **Percentual**: 90%
- **Status**: REUSAR QUASE INTEGRALMENTE
- **Apenas adaptar**: UI para nova paleta de cores V2, integração com preview
- **Manter**: Todas as 10 paletas, lógica de seleção, aplicação de cores

---

## 4️⃣ LayoutModule.tsx - Posições e Alinhamento

### 🎯 Objetivo
Permitir que o usuário customize a posição de cada elemento de texto no canvas e o alinhamento horizontal, bem como a proporção entre imagem e texto.

### 📋 Funcionalidades Principais

#### A) Grid de Posições (9 Posições)

**Sistema de Posicionamento 3x3:**

```
┌────────────┬────────────┬────────────┐
│   TOP-     │   TOP-     │   TOP-     │
│   LEFT     │   CENTER   │   RIGHT    │
├────────────┼────────────┼────────────┤
│  MIDDLE-   │   CENTER   │  MIDDLE-   │
│   LEFT     │            │   RIGHT    │
├────────────┼────────────┼────────────┤
│  BOTTOM-   │  BOTTOM-   │  BOTTOM-   │
│   LEFT     │   CENTER   │   RIGHT    │
└────────────┴────────────┴────────────┘
```

**Tipos de Posição:**
```typescript
type Position = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
```

**Implementação de Posições:**
```typescript
interface PositionMap {
  'top-left': { top: '10%', left: '10%' };
  'top-center': { top: '10%', left: '50%', transform: 'translateX(-50%)' };
  'top-right': { top: '10%', right: '10%' };
  'middle-left': { top: '50%', left: '10%', transform: 'translateY(-50%)' };
  'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  'middle-right': { top: '50%', right: '10%', transform: 'translateY(-50%)' };
  'bottom-left': { bottom: '10%', left: '10%' };
  'bottom-center': { bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
  'bottom-right': { bottom: '10%', right: '10%' };
}
```

**UI**: Grade clicável com 9 botões. O selecionado fica destacado. Clique em um para atualizar a posição.

**Cada Elemento Pode Ter Sua Posição:**
```typescript
interface PositionConfig {
  titlePosition: Position;        // Posição do título
  subtitlePosition: Position;     // Posição do subtítulo
  bodyTextPosition: Position;     // Posição do corpo
  ctaPosition: Position;          // Posição do CTA
}
```

#### B) Alinhamento Horizontal de Texto

**Tipos de Alinhamento:**
```typescript
type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface AlignmentConfig {
  titleAlign: TextAlign;          // Alinhamento do título
  subtitleAlign: TextAlign;       // Alinhamento do subtítulo
  bodyAlign: TextAlign;           // Alinhamento do corpo
  ctaAlign: TextAlign;            // Alinhamento do CTA
}
```

**CSS Aplicado:**
```css
.text-left    { text-align: left; }
.text-center  { text-align: center; }
.text-right   { text-align: right; }
.text-justify { text-align: justify; }
```

**UI**: 4 botões com ícones de alinhamento para cada elemento:
- `[⬅️]` Left
- `[⏺️]` Center
- `[➡️]` Right
- `[⏭️]` Justify

#### C) Proporção Imagem/Texto

```typescript
interface ImageTextRatio {
  imageToTextRatio: number;  // 30 - 70 (percentual)
  // 30% imagem, 70% texto
  // 50% imagem, 50% texto
  // 70% imagem, 30% texto
}
```

**Como funciona:**
- Slider para ajustar proporção
- Redistribui espaço vertical entre imagem e área de texto
- Valor em tempo real exibido (ex: "60%")

**Aplicação:**
```typescript
const imageHeight = (imageToTextRatio / 100) * canvasHeight;
const textHeight = canvasHeight - imageHeight;
```

**UI**:
```
Proporção: [░░░░░░░░░░] 60%
           30% ───────── 70%
           (Mais imagem) (Mais texto)
```

### 🎨 Estrutura de Dados Completa
```typescript
interface LayoutModuleData {
  // Posições
  titlePosition: Position;
  subtitlePosition: Position;
  bodyTextPosition: Position;
  ctaPosition: Position;
  
  // Alinhamento
  titleAlign: TextAlign;
  subtitleAlign: TextAlign;
  bodyAlign: TextAlign;
  ctaAlign: TextAlign;
  
  // Proporções
  imageToTextRatio: number;      // 30 - 70%
}
```

### ⚠️ Problemas Identificados na V1
- Sem feedback visual de posição antes de aplicar
- Possibilidade de overlap entre elementos
- Sem contraints de colisão

### ✅ Reaproveitamento Recomendado
- **Percentual**: 70%
- **O que reusar**: Sistema de 9 posições, tipos de alinhamento, slider de proporção
- **O que melhorar**: Detecção de overlap, preview ao vivo, constraining de posições

---

## 5️⃣ CopyModule.tsx - Legendas e Hashtags

### 🎯 Objetivo
Permitir customização de legendas para cada plataforma social e geração/edição de hashtags relevantes.

### 📋 Funcionalidades Principais

#### A) Edição de Legenda por Plataforma

**Limites de Caracteres:**
```typescript
interface CaptionLimits {
  instagram: 2200,      // Instagram permite 2200 chars
  linkedin: 3000,       // LinkedIn é mais generoso
  twitter: 280,         // X/Twitter padrão (Premium = 25k)
  tiktok: 150,          // TikTok tem limite curto
  facebook: 1500        // Facebook limite médio
}

interface CaptionControl {
  platform: string;           // Plataforma alvo
  caption: string;            // Texto da legenda
  characterCount: number;     // Contador automático
  remainingChars: number;     // Caracteres restantes
  isOverLimit: boolean;       // Aviso se excedeu
}
```

**UI**: 
```
Legenda para Instagram (1200 / 2200):
┌──────────────────────────────────────┐
│ Aqui é o texto da legenda             │
│ que pode ser bem longo...             │
│ ...e continuar por várias linhas     │
│                                       │
└──────────────────────────────────────┘
Caracteres: 1200 / 2200 (⚠️ 1000 restantes)
```

#### B) Sistema de Hashtags

**Geração Automática com IA:**
```typescript
interface HashtagGeneration {
  topic: string;           // Tema do post
  numberOfHashtags: number; // Quantos gerar (default: 10)
  style: 'trending' | 'niche' | 'mixed'; // Estilo de hashtags
}

// Resposta:
interface HashtagResult {
  hashtags: string[];      // ['#produtividade', '#dev', ...]
  explanation: string;     // Por que essas hashtags
}
```

**Edição Manual de Hashtags:**
```typescript
interface HashtagControl {
  hashtags: string[];         // Array de hashtags
  addHashtag: (tag: string) => void;
  removeHashtag: (tag: string) => void;
  reorderHashtags: (from: number, to: number) => void;
  generateNew: () => void;    // Gerar novos automaticamente
}
```

**UI**: Tags removíveis com botão "+" para adicionar novas

#### C) Formatação por Plataforma

```typescript
interface PlatformFormatting {
  // Instagram: hashtags ao final ou no primeiro comentário
  instagram: {
    placement: 'caption-end' | 'first-comment';
    separator: '\n\n';  // Quebra de linha dupla
  },
  
  // LinkedIn: hashtags dispersas ou ao final
  linkedin: {
    placement: 'dispersed' | 'end';
    format: (caption: string, hashtags: string[]) => string;
  },
  
  // Twitter: hashtags inline ou ao final
  twitter: {
    placement: 'inline' | 'end';
    maxHashtags: 5;  // Limite prático
  }
}
```

**Exemplo de Formatação:**
```
Legenda + Hashtags:

Instagram:
"Meu post incrível... #produtividade #dev"

LinkedIn:
"Meu post incrível #produtividade 
Este é um tema que me apaixona... #dev"

Twitter:
"Meu post! #produtividade #dev"
```

#### D) Sugestões de Hashtags Trending

```typescript
interface TrendingHashtags {
  platform: string;
  trending: string[];        // Hashtags trending agora
  recommended: string[];     // Recomendadas para o tema
  niche: string[];          // Nicho específico
}

// Exemplo:
{
  trending: ['#motivation', '#entrepreneur'],
  recommended: ['#productivitytips', '#developerlife'],
  niche: ['#codewriting', '#devtools']
}
```

### 🎨 Estrutura de Dados Completa
```typescript
interface CopyModuleData {
  // Caption
  platform: string;
  caption: string;
  characterCount: number;
  
  // Hashtags
  hashtags: string[];
  includeEmojis: boolean;
  hashtagPlacement: 'caption-end' | 'first-comment' | 'dispersed' | 'inline' | 'end';
  
  // Seleções de trending
  useTrending: boolean;
  trendingHashtags: string[];
}
```

### ✅ Reaproveitamento Recomendado
- **Percentual**: 85%
- **Status**: REUSAR LARGAMENTE
- **Apenas adaptar**: UI para nova versão, integração com novos provedores de trending
- **Manter**: Toda a lógica de contadores, limitadores, geradores de hashtag

---

## 6️⃣ AdvancedModule.tsx - Configurações Avançadas

### 🎯 Objetivo
Oferecer controles avançados para usuários experientes que querem refinement máximo: sombras, espaçamento, bordas, efeitos sofisticados.

### 📋 Funcionalidades Principais

#### A) Efeitos de Sombra de Texto

```typescript
interface TextShadowControl {
  // Cada elemento de texto pode ter shadow própria
  offsetX: number;        // -50px a 50px (horizontal)
  offsetY: number;        // -50px a 50px (vertical)
  blur: number;           // 0px - 20px
  color: string;          // hex color
  opacity: number;        // 0 - 1
}

// CSS: text-shadow: 2px 4px 8px rgba(0,0,0,0.5);
```

**UI**: 4 sliders para controlar cada propriedade

#### B) Controles de Espaçamento

```typescript
interface SpacingControl {
  // Padding interno do container de texto
  paddingX: number;       // 0 - 50px (esquerda/direita)
  paddingY: number;       // 0 - 50px (topo/fundo)
  
  // Margem entre elementos
  marginBetweenElements: number;  // 10 - 50px
  
  // Espaço entre linhas (line-height já em TextModule)
  gapHashtags: number;    // 5 - 20px entre hashtags
}
```

#### C) Bordas e Radius

```typescript
interface BorderControl {
  // Border Radius
  borderRadius: number;   // 0 - 30px
  
  // Border
  borderWidth: number;    // 0 - 5px
  borderColor: string;    // hex color
  borderStyle: 'solid' | 'dashed' | 'dotted';
}
```

#### D) Efeitos de Imagem Avançados

```typescript
interface AdvancedImageFilters {
  // Saturação: 0 = escala cinza, 2 = super saturado
  saturation: number;     // 0 - 2 (default: 1.0)
  
  // Contraste: 0.5 = baixo, 2 = alto
  contrast: number;       // 0.5 - 2 (default: 1.0)
  
  // Rotação de matiz: 0-360 graus
  hueRotation: number;    // 0 - 360 (default: 0)
  
  // Efeito Sepia (preto e branco quente)
  sepia: number;          // 0 - 1 (default: 0)
  
  // Escala de cinza
  grayscale: number;      // 0 - 1 (default: 0)
  
  // Brilho adicional
  brightness: number;     // 0.5 - 1.5 (já em ImageModule)
  
  // Invert colors
  invert: number;         // 0 - 1 (default: 0)
}

// Aplicado como:
// filter: saturate(1.2) contrast(1.1) hue-rotate(10deg) sepia(0.1);
```

#### E) Limite de Conteúdo

```typescript
interface ContentLimits {
  // Máximo de linhas antes de truncar
  maxLinesTitle: number;     // 1 - 3 (default: 2)
  maxLinesBody: number;      // 2 - 5 (default: 3)
  
  // Truncate com "..."
  enableTruncate: boolean;   // default: true
  
  // Tamanho máximo de caracteres com aviso
  maxCharsTitle: number;     // 50 - 100
  maxCharsBody: number;      // 150 - 300
}

// CSS:
// overflow: hidden;
// display: -webkit-box;
// -webkit-line-clamp: 3;
// -webkit-box-orient: vertical;
```

### 🎨 Estrutura de Dados Completa
```typescript
interface AdvancedModuleData {
  // Sombra de texto
  textShadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
    opacity: number;
  };
  
  // Espaçamento
  spacing: {
    paddingX: number;
    paddingY: number;
    marginElements: number;
    gapHashtags: number;
  };
  
  // Bordas
  border: {
    radius: number;
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  
  // Filtros de imagem avançados
  imageFilters: {
    saturation: number;
    contrast: number;
    hueRotation: number;
    sepia: number;
    grayscale: number;
    invert: number;
  };
  
  // Limites de conteúdo
  contentLimits: {
    maxLinesTitle: number;
    maxLinesBody: number;
    enableTruncate: boolean;
    maxCharsTitle: number;
    maxCharsBody: number;
  };
}
```

### ⚠️ Problemas Identificados na V1
- Muitos controles espalhados
- Difícil de entender para usuários novatos
- Performance podem sofrer com efeitos demais

### ✅ Reaproveitamento Recomendado
- **Percentual**: 50%
- **Status**: PARCIAL - implementar como feature avançada (colapsível/aba)
- **Apenas adaptar**: UI em colapsível, integração com performance
- **Considerar**: Alguns efeitos talvez sejam overkill para MVP

---

## 📊 Quadro Comparativo Completo

| Módulo | Funcionalidades | % Reap. | Complexidade | Prioridade | Status Recomendado |
|--------|-----------------|--------|--------------|-----------|-------------------|
| **TextModule** | 4 campos texto, 7 tipos controle fonte | 60% | Baixa | P1 | Reusar base, UI nova |
| **ImageModule** | Upload, zoom, brightness, overlay, filtros | **95%** | Média | **P0** | ✅ REUSAR INTEGRALMENTE |
| **DesignModule** | 10 paletas, templates, plataformas | **90%** | Baixa | **P0** | ✅ REUSAR INTEGRALMENTE |
| **LayoutModule** | 9 posições, alinhamento, proporção | 70% | Média | P1 | Reusar com melhorias |
| **CopyModule** | Legenda, hashtags, trending | **85%** | Baixa | P2 | ✅ REUSAR LARGAMENTE |
| **AdvancedModule** | Sombras, spacing, filtros avançados | 50% | Alta | P3 | Implementar depois |

---

## 🎯 Plano de Implementação Recomendado

### **Fase 1: MVP (Semana 1)**
- ✅ **ImageModule** - Upload + ajustes (CRITICIDADE ALTA)
- ✅ **DesignModule** - 10 paletas + plataformas
- ✅ **LayoutModule** - Grid 3x3 + alinhamento

### **Fase 2: Refinamento (Semana 2)**
- ✅ **TextModule** - Edição de fontes
- ✅ **CopyModule** - Legenda + hashtags

### **Fase 3: Polish (Semana 3+)**
- ⚙️ **AdvancedModule** - Efeitos (opcional no MVP)

---

## 📝 Conclusões

### Pontos-Chave
1. **ImageModule é crítico**: 95% reaproveitável, oferece grande valor visual
2. **DesignModule é essencial**: 10 paletas já prontas, testes feitos
3. **Arquitetura de dados já existe**: Basta adaptar para React/Zustand
4. **UI/UX é o principal ajuste**: Lógica está pronta, interface precisa modernizar

### Próximos Passos
1. Criar componentes React para cada módulo
2. Integrar com Zustand store
3. Adaptar CSS/Tailwind para nova paleta V2
4. Testes e validação

---

**Investigação concluída em 03/02/2026**  
**Documentado por**: GitHub Copilot  
**Arquivos consultados**: 15 documentos de análise e migração
