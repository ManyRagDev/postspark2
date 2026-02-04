# Arquitetura - PostSpark 2.0

## Visão Geral

PostSpark é uma aplicação full-stack React/Next.js que combina:
- **Frontend**: Interface reativa com detecção de estado em tempo real
- **Backend**: API routes para processamento de imagem e integração com IA
- **IA**: Google Gemini 2.0 Flash para geração de conteúdo

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                     POSTSPARK 2.0 ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              PRESENTATION LAYER (React/Next.js)               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │              MagicInterface (Main Hub)                  │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │  │  │
│  │  │  │    Editor    │  │   Preview    │  │   Export    │   │  │  │
│  │  │  │   Controls   │  │  6 Layouts   │  │   Options   │   │  │  │
│  │  │  └──────────────┘  └──────────────┘  └─────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              ↑ ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │               LOGIC LAYER (Hooks & Libraries)                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  useAmbientIntelligence              [7 States]         │  │  │
│  │  │    ├→ keywordDetector                [Detection]        │  │  │
│  │  │    └→ ambientStates                  [Config]           │  │  │
│  │  ├─────────────────────────────────────────────────────────┤  │  │
│  │  │  usePostGeneration            [Pipeline Control]        │  │  │
│  │  │    ├→ Content Generation                                │  │  │
│  │  │    └→ Image Composition                                 │  │  │
│  │  ├─────────────────────────────────────────────────────────┤  │  │
│  │  │  Layout Engine             [20 Design Principles]       │  │  │
│  │  │    ├→ Font Sizing                                       │  │  │
│  │  │    ├→ Position Calculation                              │  │  │
│  │  │    └→ Overlay Generation                                │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              ↑ ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                API LAYER (Next.js Routes)                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/generate-content    ←→  Gemini 2.0 Flash          │  │  │
│  │  ├─────────────────────────────────────────────────────────┤  │  │
│  │  │  /api/compose-post        ←→  Sharp                     │  │  │
│  │  │    ├→ Image Analysis (Intention Zones)                  │  │  │
│  │  │    ├→ Layout Calculation                                │  │  │
│  │  │    └→ PNG Composition                                   │  │  │
│  │  ├─────────────────────────────────────────────────────────┤  │  │
│  │  │  /api/backgrounds         ←   Public Gallery            │  │  │
│  │  ├─────────────────────────────────────────────────────────┤  │  │
│  │  │  /api/generate-image      ←→  Gemini Imagen             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              ↑ ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   EXTERNAL SERVICES                           │  │
│  │  • Google Gemini 2.0 Flash (LLM)                             │  │
│  │  • Google Imagen (Image Generation - planned)                │  │
│  │  • Sharp Image Library (local)                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Componentes Principais

### 1. MagicInterface (`components/editor/MagicInterface.tsx`)
**Responsabilidade**: Hub principal que orquestra toda a experiência do editor.

**Gerencia**:
- Input de texto do usuário
- Seleção de formato (static/carousel)
- Seleção de tamanho (1:1, 5:6, 9:16)
- Toggle de IA
- Background selection
- Coordenação entre detecção e preview

### 2. useAmbientIntelligence (`hooks/useAmbientIntelligence.ts`)
**Responsabilidade**: State machine para detecção de estado ambiental.

**Fluxo**:
```
Input Text → Debounce (150ms) → detectAmbientState()
                                      ↓
                              Keyword Matching
                                      ↓
                              Score Calculation
                                      ↓
                              State + Config + Confidence
```

**Retorna**:
- `state`: AmbientState atual (neutral, motivational, etc.)
- `config`: AmbientConfig com cores, layout, prompts
- `confidence`: número 0-100
- `forceState()`: função para override manual

### 3. usePostGeneration (`hooks/usePostGeneration.ts`)
**Responsabilidade**: Orquestra o pipeline de geração de conteúdo e imagem.

**Pipeline em 2 Estágios**:
```
Stage 1: Content Generation (opcional)
├── Input: { text, state, format }
├── API: /api/generate-content
├── LLM: Gemini 2.0 Flash
└── Output: { headline, body, caption, hashtags, slides? }

Stage 2: Image Composition (para static)
├── Input: { headline, body, state, backgroundUrl, overlayOpacity }
├── API: /api/compose-post
├── Engine: Sharp + Layout Engine
└── Output: PNG Blob
```

### 4. Layout Engine (`lib/layoutEngine.ts`)
**Responsabilidade**: Cálculos de design e posicionamento de texto.

**20 Princípios Implementados**:
1. Gravidade Visual (impact words maiores)
2. Escala por comprimento
3. Contraste automático
4. Rule of Thirds
5. Safe Area positioning
6. Overlay adaptive opacity
7. Font scale por estado
8. Shadow intensity por estado
9. Vinheta para estados dramáticos
10. ... (mais no código)

### 5. Intention Zones (`lib/intentionZones.ts`)
**Responsabilidade**: Análise de imagem para posicionamento inteligente.

**Algoritmo**:
```
1. Divide imagem em grid 3x3
2. Calcula variância (complexidade) de cada célula
3. Detecta luminância média (claro/escuro)
4. Identifica "safe areas" (baixa complexidade)
5. Retorna posição ideal baseada no estado
```

---

## Layout System (NOVO - v2.0.1)

### Grid 3x3 + Modo Livre Híbrido
A partir de 2025-02-04, PostSpark suporta dois modos de posicionamento simultâneos e independentes para Headline e Body:

#### 1. Modo GRID (Posições Pré-definidas)
```
9 posições disponíveis:
┌───────────────────┐
│  TL    TC    TR   │  TL = top-left (6%, 6%)
│                   │  TC = top-center (50%, 6%)
│  CL    C     CR   │  TR = top-right (94%, 6%)
│                   │  ... etc
│  BL    BC    BR   │
└───────────────────┘
```

**Ativado quando**:
- Usuario clica no grid LayoutTab
- Automático ao selecionar posição (limpa customPosition)

**Vantagens**:
- Rápido
- Previsível
- Alinhamento automático

#### 2. Modo LIVRE (Arrastar no Preview)
```typescript
customPosition: {
  x: 25,  // Percentual horizontal (0-100)
  y: 75   // Percentual vertical (0-100)
}
```

**Ativado quando**:
- Usuario arrasta elemento no preview
- Sistema calcula posição final com offset de clique

**Vantagens**:
- Controle preciso
- Fine-tuned positioning
- Visual feedback em tempo real

### Independência Headline/Body
Cada elemento (título e corpo) tem configurações completamente independentes:

```typescript
// Exemplo: Título em Grid, Corpo em Modo Livre
{
  headline: {
    position: 'top-center',  // Grid
    textAlign: 'center',
    customPosition: undefined
  },
  body: {
    position: 'bottom-center',
    textAlign: 'left',
    customPosition: { x: 15, y: 80 }  // Modo Livre
  }
}
```

### Por Slide (Carrossel)
Em posts carrossel, cada slide pode ter layout diferente:

```typescript
// Global defaults
editSettings.layout = { headline: { position: 'center' }, ... }

// Slide 0: position customizada
editSettings.slideOverrides[0].layout = { headline: { position: 'top-left' }, ... }

// Slide 1: completamente diferente
editSettings.slideOverrides[1].layout = { headline: { position: 'bottom-right' }, ... }

// Sistema merges automaticamente no PostPreview
```

### Implementação Técnica
**Fluxo de Merge** (`src/components/preview/PostPreview.tsx`):
```typescript
const effectiveLayout = slideLayoutOverride
    ? {
        ...globalLayout,
        headline: { ...globalLayout.headline, ...slideLayoutOverride.headline },
        body: { ...globalLayout.body, ...slideLayoutOverride.body }
    }
    : globalLayout;

// Passa effectiveLayout para LayoutCentered/Carousel/etc
<LayoutCentered 
  headlineSettings={effectiveLayout.headline}
  bodySettings={effectiveLayout.body}
/>
```

**Cálculo de Posição** (`src/lib/layoutUtils.ts`):
```typescript
export function getPositionStyles(position, textAlign, customPosition) {
    if (customPosition) {
        // Modo Livre: usa coordenadas absolutas
        return {
            position: 'absolute',
            left: `${customPosition.x}%`,
            top: `${customPosition.y}%`,
            transform: 'translate(-50%, -50%)'  // Centra pelo ponto
        };
    }
    
    // Modo Grid: switch cases para 9 posições
    switch (position) {
        case 'top-left': return { top: '6%', left: '6%', ... };
        // ...
    }
}
```

**Detecção de Modo** (`src/components/editor/EditPanel/LayoutTab.tsx`):
```typescript
const updateTarget = (key, value) => {
    const update = { [activeTarget]: { ...settings[activeTarget], [key]: value } };
    
    // Se clicou posição, volta para Grid (limpa Modo Livre)
    if (key === 'position') {
        update[activeTarget].customPosition = undefined;
    }
    
    onChange(update);
};
```

---

## API Routes (Atualizado)

### `/api/generate-content`
**Método**: POST
**Input**:
```typescript
{
  text: string;
  state: AmbientState;
  format: 'static' | 'carousel';
}
```
**Output**:
```typescript
{
  headline: string;
  body: string;
  caption: string;
  hashtags: string[];
  slides?: Slide[]; // se formato carousel
}
```

### `/api/compose-post`
**Método**: POST
**Input**:
```typescript
{
  headline: string;
  body: string;
  state: AmbientState;
  backgroundUrl: string;
  overlayOpacity: number;
  size: '1:1' | '5:6' | '9:16';
}
```
**Output**: PNG blob (image/png)

### `/api/backgrounds`
**Método**: GET
**Output**: Lista de backgrounds da galeria por categoria

### `/api/generate-image`
**Método**: POST
**Status**: Planejado (integração com Gemini Imagen)

---

## Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────┘

1. ENTRADA
   User digita texto → "Você consegue! Nunca desista dos seus sonhos!"
                              ↓
2. DETECÇÃO (real-time, cliente)
   useAmbientIntelligence processa:
   - Normaliza: "voce consegue nunca desista dos seus sonhos"
   - Matches: "consegue" (motivational), "nunca desista" (motivational)
   - Score: 12pts × 1.3 bonus = 15.6
   - Estado: MOTIVATIONAL (confidence: 85%)
                              ↓
3. UI REAGE (real-time)
   - Background muda para gradiente dourado/escuro
   - AmbientBadge mostra "✨ Motivacional"
   - Preview renderiza LayoutHeadline
   - ChameleonButton muda texto para "Criar Inspiração"
                              ↓
4. USER CLICA "GERAR"
                              ↓
5. STAGE 1: CONTENT (servidor)
   POST /api/generate-content
   - Gemini recebe prompt especializado para MOTIVATIONAL
   - Retorna:
     headline: "VOCÊ CONSEGUE!"
     body: "Nunca desista dos seus sonhos. Cada passo conta."
     caption: "A jornada de mil milhas começa com um passo..."
     hashtags: ["#motivação", "#foco", "#sucesso"]
                              ↓
6. STAGE 2: COMPOSITION (servidor)
   POST /api/compose-post
   - Sharp carrega background
   - intentionZones analisa imagem
   - layoutEngine calcula posição/fonte
   - Composição: background + overlay + texto SVG
   - Retorna: PNG blob
                              ↓
7. DOWNLOAD
   - PNG salvo como "postspark-motivacional-1706xxx.png"
   - Caption copiada para clipboard
   - Animação de sucesso
```

---

## Estados da Aplicação

### Estado Global (via hooks)
```typescript
// useAmbientIntelligence
{
  state: AmbientState;           // 'neutral' | 'motivational' | ...
  config: AmbientConfig;         // cores, layout, prompts
  confidence: number;            // 0-100
  isOverridden: boolean;         // se usuário forçou estado
}

// usePostGeneration
{
  isGenerating: boolean;
  content: GeneratedContent | null;
  imageBlob: Blob | null;
  error: string | null;
}
```

### Estado Local (MagicInterface)
```typescript
{
  text: string;                  // input do usuário
  format: 'static' | 'carousel';
  size: '1:1' | '5:6' | '9:16';
  useAI: boolean;
  backgroundUrl: string;
  backgroundPosition: { x: number, y: number };
  overlayOpacity: number;
}
```

---

## Considerações de Escalabilidade

### Atual (MVP)
- Processamento de imagem por request
- Sem cache de resultados Gemini
- Backgrounds servidos de `/public`

### Futuro
- Redis cache para respostas Gemini idênticas
- CDN para backgrounds
- Queue para processamento pesado
- WebSocket para preview em tempo real do servidor
