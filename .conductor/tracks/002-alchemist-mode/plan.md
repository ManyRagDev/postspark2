# TRACK-002: PostSpark Alchemist Mode

## Descrição
Evolução do PostSpark para uma **Pipeline de Especialistas Orquestrada**:
- **Gemini 2.5 Flash** para geração de texto inteligente
- **Geração de imagens** com IA ou match local
- **Layout Engine** baseado nos 20 princípios do design
- **Sharp** para composição final de alta resolução no servidor

---

## User Review Required

> [!IMPORTANT]
> **Migração para Next.js**: O projeto atual usa Vite + React. Esta track requer **migração completa para Next.js App Router** para:
> - Server Actions (composição de imagem com Sharp)
> - API Routes (integração com Gemini/IA de imagens)
> - Melhor SEO nativo

> [!WARNING]
> **APIs Necessárias**: 
> - `GEMINI_API_KEY` - Google AI Studio
> - `IMAGE_AI_API_KEY` - Para geração de imagens (opcional, fallback para Smart Match local)

> [!CAUTION]
> **Breaking Change**: O código atual de exportação client-side (Canvas) será substituído por composição server-side (Sharp).

---

## Proposed Changes

### Fase 1: Migração Next.js + Preservação de Features

#### [NEW] Projeto Next.js 15
- Criar novo projeto com `npx create-next-app@latest`
- App Router + TypeScript + TailwindCSS + ESLint
- Migrar componentes existentes para `/app` e `/components`

#### [MIGRATE] Hooks e Libs
- `useAmbientIntelligence` → manter lógica
- `keywordDetector` → manter lógica  
- `ambientStates` → expandir com configurações de design

---

### Fase 2: Pipeline de Especialistas

#### A. Cérebro: Gemini 2.5 Flash

##### [NEW] [route.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/app/api/generate-content/route.ts)
API Route para chamar Gemini:
```typescript
// POST /api/generate-content
// Body: { text, state, format: 'static' | 'carousel' }
// Response: { headline, body, caption, hashtags }
```

Prompts especializados por estado:
- Motivacional → Frases de impacto + repetição emocional
- Promocional → Urgência + números + CTA direto
- Educacional → Estrutura de passos + clareza
- Polêmico → Contraste + hook provocativo

---

#### B. Motor Visual: Geração de Imagens

##### [NEW] [route.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/app/api/generate-image/route.ts)
```typescript
// POST /api/generate-image
// Body: { prompt, style: 'realistic' | '3d' | 'ghibli' | 'anime' | 'minimal' }
// Response: { imageUrl, credits }
```

##### [NEW] [smartMatch.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/lib/smartMatch.ts)
Fallback local que busca em `/public/images/backgrounds`:
- Analisa keywords do texto
- Retorna imagem mais compatível do diretório

---

#### C. Layout Engine: Composição com Sharp

##### [NEW] [route.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/app/api/compose-post/route.ts)
Composição final server-side:
```typescript
// POST /api/compose-post
// Body: { text, state, backgroundUrl, layout }
// Response: PNG/WebP buffer em alta resolução
```

Implementa os 20 princípios:
- **Gravidade Visual**: Palavras de impacto → escala maior
- **Smart Contrast**: Análise de luminosidade → overlay adaptativo
- **Hierarquia**: Título > Subtítulo > Body > CTA
- **Grid**: Sistema 12 colunas invisível
- **Profundidade**: Sombras e layers

##### [NEW] [layoutEngine.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/lib/layoutEngine.ts)
Cálculos determinísticos (NÃO usa IA para pixels):
```typescript
function calculateLayout(text: string, state: AmbientState, imageInfo: ImageMetadata): LayoutConfig {
  // Retorna: posições, tamanhos, cores, overlays
}
```

##### [NEW] [intentionZones.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/lib/intentionZones.ts)
**Zonas de Intenção** - Análise inteligente de áreas da imagem:

```typescript
interface IntentionZone {
  type: 'face' | 'subject' | 'empty' | 'complex';
  boundingBox: { x: number; y: number; width: number; height: number };
  weight: number; // 0-1, importância da área
}

interface ZoneAnalysis {
  zones: IntentionZone[];
  safeAreas: BoundingBox[];      // Onde o texto PODE ficar
  avoidAreas: BoundingBox[];     // Onde o texto deve FUGIR
  centerOfAttention: Point;       // Ponto focal da imagem
  suggestedTextPosition: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'overlay';
}

async function analyzeImageZones(imageBuffer: Buffer): Promise<ZoneAnalysis> {
  // 1. Detecta rostos usando Sharp + ML (ou API externa leve)
  // 2. Analisa contraste por regiões (quadrantes)
  // 3. Identifica áreas "vazias" (baixa variância de cor)
  // 4. Retorna mapa de zonas
}
```

**Regras de Posicionamento por Estado:**

| Estado | Zona de Texto | Comportamento |
|--------|---------------|---------------|
| Motivacional | Centro ÉPICO | Ocupa 80% da largura, overlay escuro atrás, texto GRANDE |
| Promocional | Hierarquia | Preço no centro, foge de rostos, CTA embaixo |
| Pessoal | Ao lado do rosto | Split screen, texto foge do rosto detectado |
| Informativo | Área mais limpa | Posiciona em área de menor complexidade |
| Polêmico | Centro agressivo | Como motivacional, mas com borda de alerta |
| Educacional | Terços | Segue regra dos terços, evita centro |

**Implementação Técnica:**
1. **Detecção de Rostos**: Usar `@vladmandic/face-api` (leve, roda no servidor)
2. **Análise de Complexidade**: Calcular variância de pixels por região com Sharp
3. **Heatmap de Segurança**: Gerar mapa de onde o texto fica legível

---

### Fase 3: UI/UX "Anti-SaaS Aesthetic"

##### [NEW] Texturas Premium
- `/public/textures/concrete.webp`
- `/public/textures/linen.webp`  
- `/public/textures/marble.webp`

##### [MODIFY] MagicInterface
- Background com textura flutuante
- Glassmorphism nos cards
- Transições ainda mais fluidas

##### [NEW] Seletor de Estilo Visual
```tsx
<StyleSelector 
  options={['realistic', '3d', 'ghibli', 'anime', 'minimal']}
  onChange={setSelectedStyle}
/>
```

##### [NEW] Seletor de Formato
```tsx
<FormatSelector 
  options={['static', 'carousel']}
  onChange={setPostFormat}
/>
```

---

## Estrutura Final de Pastas

```
PostSpark 2/
├── app/
│   ├── page.tsx                    # Editor principal
│   ├── api/
│   │   ├── generate-content/route.ts
│   │   ├── generate-image/route.ts
│   │   └── compose-post/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # (migrado do Vite)
│   ├── editor/                     # (migrado + expandido)
│   └── preview/                    # (migrado + expandido)
├── lib/
│   ├── ambientStates.ts            # Expandido com design tokens
│   ├── keywordDetector.ts          # (mantido)
│   ├── layoutEngine.ts             # NOVO - 20 princípios
│   ├── smartMatch.ts               # NOVO - match local de imagens
│   └── gemini.ts                   # NOVO - client Gemini
├── hooks/
│   ├── useAmbientIntelligence.ts   # (mantido)
│   └── usePostGeneration.ts        # NOVO - orquestra pipeline
├── public/
│   ├── images/backgrounds/         # Biblioteca de imagens
│   └── textures/                   # Texturas premium
├── types/
│   ├── ambient.ts                  # (expandido)
│   └── api.ts                      # NOVO - tipos das APIs
└── next.config.js
```

---

## Verification Plan

### Testes Automatizados
```bash
npm run test -- layoutEngine
npm run test -- smartMatch
```

### Testes de API
```bash
# Testar geração de conteúdo
curl -X POST localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"text":"Promoção 50% off","state":"promotional","format":"static"}'

# Testar composição
curl -X POST localhost:3000/api/compose-post \
  -H "Content-Type: application/json" \
  -d '{"text":"Headline","state":"motivational"}' \
  --output test.png
```

### Browser Testing
```bash
npm run dev

# Testar fluxo completo:
# 1. Digitar texto → detectar estado
# 2. Selecionar estilo visual
# 3. Clicar "Criar Post" → receber PNG real
```

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| API Key Gemini não configurada | Fallback para texto sem IA (input do usuário) |
| API de imagem fora | Smart Match local como fallback |
| Composição lenta no servidor | Cache de imagens compostas + loading state |
| Sharp não funciona em serverless | Usar alternativa como `@napi-rs/canvas` se necessário |
