# Tech Stack - PostSpark 2.0

## Frontend Core
- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.x + PostCSS
- **Animations**: Framer Motion 11.x
- **Icons**: Lucide React

## Backend (API Routes)
- **Runtime**: Next.js API Routes (serverless)
- **Image Processing**: Sharp 0.33
- **AI/LLM**: Google GenAI SDK 0.7 (Gemini 2.0 Flash)
- **Face Detection**: @vladmandic/face-api 1.7 (futuro)

## Dependências Principais
```json
{
  "next": "^16.x",
  "react": "^19.x",
  "react-dom": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "sharp": "^0.33.x",
  "@google/genai": "^0.7.x",
  "html2canvas": "^1.x",
  "jszip": "^3.x",
  "file-saver": "^2.x"
}
```

## Regras Técnicas

### Performance
1. Detecção de keywords via algoritmo de pesos no cliente (debounce 150ms)
2. Memoização de cálculos pesados com `useMemo`
3. Lazy loading para componentes pesados

### Segurança
1. Image processing apenas no servidor (Sharp via API routes)
2. Validação de input antes de enviar para Gemini
3. Sanitização de URLs de background

### Export
1. **Cliente**: html2canvas para captura de preview
2. **Servidor**: Sharp para composição final de alta qualidade
3. **Carrossel**: JSZip para bundling de múltiplas imagens

---

## Estrutura de Pastas (Implementada)

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── generate-content/     # Gemini text generation
│   │   ├── compose-post/         # Sharp image composition
│   │   ├── generate-image/       # AI image generation
│   │   └── backgrounds/          # Gallery API
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Entry point
│   └── globals.css               # Global styles
│
├── components/
│   ├── editor/                   # Content creation UI
│   │   ├── MagicInterface.tsx    # Main 2-column editor
│   │   ├── AmbientBadge.tsx      # State indicator
│   │   ├── BackgroundManager.tsx # Image upload/gallery/AI
│   │   ├── ChameleonButton.tsx   # Dynamic CTA
│   │   └── MagicPencil.tsx       # Content quality indicator
│   │
│   ├── preview/                  # Visual preview & layouts
│   │   ├── PostPreview.tsx       # Layout router
│   │   └── layouts/              # 6 layout implementations
│   │       ├── LayoutCentered.tsx
│   │       ├── LayoutHierarchy.tsx
│   │       ├── LayoutSplit.tsx
│   │       ├── LayoutCard.tsx
│   │       ├── LayoutHeadline.tsx
│   │       └── LayoutCarousel.tsx
│   │
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       ├── TextArea.tsx
│       ├── Badge.tsx
│       └── Modal.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAmbientIntelligence.ts # State detection & theming
│   └── usePostGeneration.ts      # Content/image pipeline
│
├── lib/                          # Core business logic
│   ├── ambientStates.ts          # State definitions
│   ├── keywordDetector.ts        # Detection algorithm
│   ├── layoutEngine.ts           # Text positioning
│   ├── intentionZones.ts         # Image analysis
│   ├── gemini.ts                 # Gemini API wrapper
│   └── exportUtils.ts            # Download utilities
│
├── types/                        # TypeScript definitions
│   ├── ambient.ts                # Core types
│   └── api.ts                    # API types
│
└── utils/                        # Utility functions
    └── downloadCarousel.tsx      # ZIP generation
```

---

## Fluxo de Dados

```
User Input → useAmbientIntelligence → State Detection
                    ↓
            UI Theme Update (real-time)
                    ↓
         User clicks "Generate"
                    ↓
      usePostGeneration Pipeline
         ├── Stage 1: /api/generate-content (Gemini)
         │      └── Returns: headline, body, caption, hashtags
         └── Stage 2: /api/compose-post (Sharp)
                └── Returns: PNG blob
                    ↓
            Download / Share
```

---

## Variáveis de Ambiente

```env
GOOGLE_API_KEY=         # Gemini API key
NEXT_PUBLIC_APP_URL=    # URL base da aplicação
```
