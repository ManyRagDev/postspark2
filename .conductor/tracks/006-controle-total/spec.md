# TRACK-006: Controle Total

> **Data**: 3 de Fevereiro de 2026
> **Status**: Implementado
> **Baseado em**: INVESTIGACAO_CONTROLADORES_DESIGN_V1.md

---

## Resumo Executivo

O **Controle Total** e um sistema de edicao pos-geracao que permite aos usuarios ajustar finamente seus posts apos a geracao automatica com IA, mantendo a "magia" do PostSpark mas entregando controle granular.

### Problema Resolvido
Antes: Usuario gerava post -> Download imediato (sem ajustes)
Depois: Usuario gera post -> Ajusta com Controle Total -> Download

---

## Modulos Implementados vs Ignorados

### Implementados (da V1)

| Modulo | % Reaproveitado | Justificativa |
|--------|-----------------|---------------|
| **ImageModule** | 80% | Controles visuais essenciais (zoom, brilho, contraste, etc.) |
| **DesignModule** | 70% | 10 paletas de cores com alto impacto visual |
| **LayoutModule** | 50% | Grid 9 posicoes + alinhamento - controle essencial |
| **TextModule** | 40% | Edicao de texto + escala de fonte |

### Ignorados (da V1)

| Modulo | Motivo |
|--------|--------|
| **CopyModule** (85%) | Ja existe preview de caption no MagicInterface |
| **AdvancedModule** (50%) | Over-engineering para MVP (sombras, borders) |
| **Templates V1** | PostSpark V2 ja tem 6 layouts dinamicos baseados em estado |
| **Platform Presets** | Aspect ratio ja existe, char limits sao secundarios |

---

## Arquitetura Implementada

### Novos Arquivos Criados

```
src/
├── types/
│   └── editor.ts                    # Tipos: EditSettings, ImageSettings, etc.
│
├── hooks/
│   └── useEditSettings.ts           # Hook de estado para edicoes
│
├── lib/
│   └── palettes.ts                  # 10 paletas de cores da V1
│
└── components/editor/
    └── EditPanel/
        ├── index.tsx                # Container principal com 4 tabs
        ├── ImageTab.tsx             # Controles de imagem
        ├── DesignTab.tsx            # Seletor de paletas
        ├── LayoutTab.tsx            # Posicao e alinhamento
        ├── TextTab.tsx              # Edicao de texto
        └── components/
            ├── Slider.tsx           # Slider reutilizavel
            ├── PositionGrid.tsx     # Grid 3x3 clicavel
            └── PaletteSelector.tsx  # Seletor visual de paletas
```

### Arquivos Modificados

| Arquivo | Mudancas |
|---------|----------|
| `MagicInterface.tsx` | + botao "Controle Total", + useEditSettings, + EditPanel |
| `PostPreview.tsx` | + prop editSettings, aplica filtros CSS em tempo real |
| `LayoutHierarchy.tsx` | Fix: null check em priceMatch |
| `Button.tsx` | Fix: tipos Framer Motion |

---

## Tipos Principais

### EditSettings (Principal)

```typescript
interface EditSettings {
  isManualOverride: boolean;  // Flag se usuario editou
  image: ImageSettings;
  design: DesignSettings;
  layout: LayoutSettings;
  text: TextSettings;
}
```

### ImageSettings

```typescript
interface ImageSettings {
  zoom: number;           // 0.5 - 3.0
  brightness: number;     // 0 - 2
  contrast: number;       // 0 - 2
  saturation: number;     // 0 - 2
  blur: number;           // 0 - 20px
  overlayOpacity: number; // 0 - 1
  overlayColor: string;   // hex
  blendMode: BlendMode;   // normal, multiply, screen, etc.
}
```

### DesignSettings

```typescript
interface DesignSettings {
  palette: ColorPalette | 'auto';
  customColors?: {
    bg: string;
    text: string;
    accent: string;
  };
}

type ColorPalette =
  | 'warm_night' | 'ocean' | 'vibrant_green' | 'sunset' | 'night_mode'
  | 'forest' | 'crimson' | 'indigo' | 'peachy' | 'cyber';
```

### LayoutSettings

```typescript
interface LayoutSettings {
  position: TextPosition;  // 9 posicoes (top-left, center, etc.)
  textAlign: 'left' | 'center' | 'right';
  padding: number;         // 0 - 100px
}
```

### TextSettings

```typescript
interface TextSettings {
  headlineContent?: string;
  bodyContent?: string;
  fontScale: number;       // 0.5 - 2.0
}
```

---

## 10 Paletas de Cores

| ID | Nome | Background | Accent | Melhor Para |
|----|------|------------|--------|-------------|
| `warm_night` | Noite Quente | #0f0f14 | #ff8c42 | Criativo, Eventos |
| `ocean` | Oceano | #0a1428 | #00d4ff | Tech, SaaS |
| `vibrant_green` | Verde Vibrante | #0a2e1f | #22c55e | Sustentabilidade |
| `sunset` | Por do Sol | #1f1515 | #ff6b35 | Lifestyle, Food |
| `night_mode` | Modo Noite | #0a0a0f | #a855f7 | Dark mode, Gaming |
| `forest` | Floresta | #1a2e1a | #34d399 | Natureza, Wellness |
| `crimson` | Carmesim | #2a0a0a | #dc2626 | Urgencia, Promocao |
| `indigo` | Indigo | #1e1b4b | #6366f1 | Negocios, Corporativo |
| `peachy` | Pessego | #2a1810 | #fb923c | Beleza, Alimentos |
| `cyber` | Cibernetico | #0a0a14 | #ec4899 | Tech, Gaming |

---

## Interface do Usuario

### Botao de Acesso

Apos gerar um post, aparece o botao **"Controle Total"**:
- Cor: Violeta com borda
- Icone: Sliders
- Indica "(editado)" quando ha alteracoes manuais

### Painel Lateral

```
┌─────────────────────────────────────────────────┐
│  Controle Total                            [X]  │
├─────────────────────────────────────────────────┤
│  [Imagem] [Design] [Layout] [Texto]             │
├─────────────────────────────────────────────────┤
│                                                 │
│  (Conteudo da tab ativa)                        │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Resetar para Automatico]                      │
└─────────────────────────────────────────────────┘
```

### Tab Imagem

- **Transformacoes**: Zoom (0.5x - 3x)
- **Ajustes de Cor**: Brilho, Contraste, Saturacao (0-200%)
- **Efeitos**: Desfoque (0-20px)
- **Overlay**: Opacidade, Cor, Modo de Mistura

### Tab Design

- **Seletor de Paletas**: 10 paletas + opcao "Automatico"
- **Cores Customizadas**: Fundo, Texto, Destaque
- **Preview**: Mostra resultado em tempo real

### Tab Layout

- **Grid 3x3**: 9 posicoes para o texto
- **Alinhamento**: Esquerda, Centro, Direita
- **Espacamento**: Padding interno (0-100px)

### Tab Texto

- **Titulo Principal**: Textarea editavel
- **Corpo do Texto**: Textarea editavel
- **Escala da Fonte**: Slider 50%-200%
- **Preview**: Mostra texto com escala aplicada

---

## Fluxo de Dados

```
Usuario clica "Controle Total"
         ↓
EditPanel abre (estado: isEditPanelOpen)
         ↓
Usuario ajusta sliders/seleciona paleta
         ↓
useEditSettings atualiza estado
         ↓
PostPreview recebe editSettings
         ↓
CSS filters aplicados em tempo real
         ↓
Usuario ve mudancas instantaneamente
         ↓
Download inclui ajustes (via preview atual)
```

---

## Aplicacao de Filtros CSS

No `PostPreview.tsx`, os filtros sao aplicados assim:

```typescript
// Compute image filters from editSettings
const imageFilters = editSettings?.image ? {
    filter: `
        brightness(${editSettings.image.brightness})
        contrast(${editSettings.image.contrast})
        saturate(${editSettings.image.saturation})
        blur(${editSettings.image.blur}px)
    `.trim(),
    transform: `scale(${editSettings.image.zoom})`,
} : {};

// Aplicado na imagem
<img
    src={imageUrl}
    style={{
        ...imageFilters,
        transformOrigin: 'center center',
    }}
/>
```

---

## Decisoes de Design

| Pergunta | Decisao | Justificativa |
|----------|---------|---------------|
| Modal ou painel? | **Painel lateral** | Mantem preview visivel |
| Servidor ou cliente? | **Cliente (CSS)** | Preview instantaneo |
| Por estado ou global? | **Global** | Usuario controla tudo |
| Persistir edicoes? | **Nao (sessao)** | Simplicidade no MVP |

---

## Como Testar

1. Execute `npm run dev`
2. Digite texto e gere um post (clique no botao colorido)
3. Apos geracao, clique em **"Controle Total"** (botao violeta)
4. Teste cada tab:
   - **Imagem**: Mova sliders de zoom, brilho, etc.
   - **Design**: Selecione diferentes paletas
   - **Layout**: Clique nas posicoes do grid
   - **Texto**: Edite o titulo e ajuste escala
5. Observe mudancas em tempo real no preview
6. Clique "Resetar para Automatico" para voltar aos valores detectados

---

## Proximos Passos (Futuro)

- [ ] Persistir edicoes no localStorage
- [ ] Aplicar edicoes no download via servidor (Sharp)
- [ ] Adicionar undo/redo
- [ ] Adicionar presets de edicao salvos
- [ ] Integrar AdvancedModule (sombras, borders)
