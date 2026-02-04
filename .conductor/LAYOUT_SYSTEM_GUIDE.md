# Layout System Guide - PostSpark 2.0.1

## Overview
PostSpark agora possui um sistema de posicionamento de texto totalmente flexível com suporte a Grid 3x3 e Modo Livre independente para cada elemento (Headline e Body).

## Quick Start

### 1. Posicionamento via Grid (Rápido)
```
1. Abra o painel "Design" → "Layout"
2. Clique no botão "Título" ou "Corpo"
3. Clique em uma das 9 posições no grid
4. Veja o preview atualizar instantaneamente ✓
```

### 2. Posicionamento Fino (Arrastar)
```
1. No preview, aponte para o texto (título ou corpo)
2. Cursor muda para 👆 (grab)
3. Arraste para a posição desejada
4. Solte para salvar coordenadas
5. O elemento fica em "Modo Livre"
```

---

## Interface Components

### LayoutTab (EditPanel)
**Localização**: `src/components/editor/EditPanel/LayoutTab.tsx`

**Seções**:
1. **Toggle Target**: Título vs Corpo
   ```
   [Título]  [Corpo]
   ```

2. **Position Grid**: 9 posições
   ```
   ┌─────────────────┐
   │ TL   TC   TR    │
   │                 │
   │ CL   C    CR    │
   │                 │
   │ BL   BC   BR    │
   └─────────────────┘
   ```

3. **Text Alignment**: left, center, right
   ```
   [≡]  [☲]  [≣]
   ```

4. **Spacing**: Global padding (0-100px)
   ```
   Slider: ▓▓▓▓░░░░
   ```

**Behavior**:
- Ao clicar posição → ativa Grid Mode
- Ao arrastar no preview → ativa Free Mode (sobrescreve Grid)

---

## Data Structure

### EditSettings
```typescript
interface EditSettings {
    layout: {
        padding: number;
        headline: {
            position: 'top-left' | 'top-center' | ... | 'bottom-right';
            textAlign: 'left' | 'center' | 'right';
            customPosition?: { x: number; y: number };  // 0-100%
        };
        body: {
            position: TextPosition;
            textAlign: TextAlignment;
            customPosition?: { x: number; y: number };
        };
    };
    slideOverrides: {
        [slideIndex]: {
            layout?: {
                headline?: { position?, textAlign?, customPosition? };
                body?: { position?, textAlign?, customPosition? };
            };
        };
    };
}
```

### Default Values
```typescript
DEFAULT_LAYOUT_SETTINGS: {
    padding: 24,
    headline: {
        position: 'center',
        textAlign: 'center',
        customPosition: undefined
    },
    body: {
        position: 'bottom-center',      // ← Não sobrepõe headline
        textAlign: 'center',
        customPosition: undefined
    }
}
```

---

## How It Works

### 1. Grid Mode (Posições Pré-definidas)
Quando usuário clica no grid em LayoutTab:

```
Input: Clique em "top-right"
    ↓
LayoutTab.updateTarget('position', 'top-right')
    ↓
useEditSettings.updateLayout({ headline: { position: 'top-right' } })
    ↓
getPositionStyles('top-right', 'center', undefined)
    ↓
Retorna: { top: '6%', right: '6%', textAlign: 'center', ... }
    ↓
CSS renderizado: <p style={{ top: '6%', right: '6%', ... }}>
```

### 2. Free Mode (Arrastar)
Quando usuário arrasta elemento no preview:

```
Input: Drag de (300px, 400px) para (350px, 450px)
    ↓
handleDragEnd('headline', event)
    ↓
Calcula posição em percentual:
  newX = ((350 - containerLeft) / containerWidth) * 100 = 25%
  newY = ((450 - containerTop) / containerHeight) * 100 = 60%
    ↓
useEditSettings.updateLayout({
    headline: {
        position: 'center',           // ← Mantém anterior
        textAlign: 'center',          // ← Mantém anterior
        customPosition: { x: 25, y: 60 }  // ← NOVO
    }
})
    ↓
getPositionStyles('center', 'center', { x: 25, y: 60 })
    ↓
Retorna: { left: '25%', top: '60%', transform: 'translate(-50%, -50%)', ... }
    ↓
Elemento aparece na posição arrastada ✓
```

### 3. Per-Slide Layouts (Carrossel)
Quando usuário navega slides:

```
Slide 1: Layout customizado via Grid
  headline.position = 'top-left'
  body.position = 'bottom-center'

Mudar para Slide 2:
  currentSlide = 1
    ↓
PostPreview detecta slideOverrides[1]
    ↓
merge: headline.position = 'center' (global default)
       (ou 'top-right' se override existir)
    ↓
LayoutCentered recebe headlineSettings.position = 'center'
    ↓
Preview renderiza com nova posição ✓
```

---

## Position Constants

### Grid Positions (9)
```
'top-left'      → top: 6%, left: 6%
'top-center'    → top: 6%, left: 50%, transform: translateX(-50%)
'top-right'     → top: 6%, right: 6%

'center-left'   → top: 50%, left: 6%, transform: translateY(-50%)
'center'        → top: 50%, left: 50%, transform: translate(-50%, -50%)
'center-right'  → top: 50%, right: 6%, transform: translateY(-50%)

'bottom-left'   → bottom: 6%, left: 6%
'bottom-center' → bottom: 6%, left: 50%, transform: translateX(-50%)
'bottom-right'  → bottom: 6%, right: 6%
```

### Safe Area Margin
- **MARGIN = '6%'**: Espaço mínimo das bordas para evitar corte

---

## Advanced Usage

### Programmatic Update (Hooks)
```typescript
const { updateLayout } = useEditSettings();

// Update headline position
updateLayout({
    headline: { position: 'top-center' }
});

// Update headline + body at once
updateLayout({
    headline: { position: 'top-left', textAlign: 'left' },
    body: { position: 'bottom-right', textAlign: 'right' }
});

// Update specific slide
updateLayout({
    headline: { customPosition: { x: 50, y: 25 } }
}, slideIndex); // Para slide especifico
```

### Manual Position Calculations
```typescript
import { getPositionStyles } from '@/lib/layoutUtils';

const styles = getPositionStyles(
    'top-left',                    // Grid position
    'center',                      // Text alignment
    { x: 30, y: 40 }              // Optional free mode
);

// styles = {
//   position: 'absolute',
//   left: '30%',
//   top: '40%',
//   transform: 'translate(-50%, -50%)',
//   textAlign: 'center',
//   width: 'max-content',
//   maxWidth: '85%',
//   zIndex: 10
// }
```

---

## Debug Logging

### Console Output (Enabled)
```javascript
// Quando clica posição
[CLICK GRID] LayoutTab.updateTarget(): {
    target: 'headline',
    newPosition: 'top-right',
    clearingCustomPos: true,
    updatePayload: { headline: { position: 'top-right', ... } }
}

// Quando estado atualiza
[UPDATE LAYOUT] useEditSettings: {
    target: 'headline',
    newHeadlinePos: 'top-right',
    slideIndex: undefined,
    isGlobal: true
}

// Quando merge acontece
[EFFECTIVE LAYOUT] PostPreview merged: {
    currentSlide: 0,
    globalHeadlinePos: 'center',
    overrideHeadlinePos: 'top-right',
    effectiveHeadlinePos: 'top-right'
}

// Quando layout recebe props
[LAYOUT PROPS] LayoutCentered received: {
    headlinePosition: 'top-right',
    headlineCustom: undefined,
    bodyPosition: 'bottom-center',
    bodyCustom: undefined
}

// Quando navega carousel
[CAROUSEL] Current slide: {
    currentSlide: 2,
    totalSlides: 6,
    slideText: "Your content...",
    isControlled: true
}
```

### Uncomment for More Details
```javascript
// Drag events (verbose)
// [DRAG START] / [DRAG END]

// Content generation (verbose)
// [MagicInterface] PostPreview props
```

---

## Common Patterns

### Pattern 1: Default + Custom Position
```typescript
// User's workflow:
1. Clica "center" (ativa Grid)
2. Arrasta para "top-right corner" (ativa Free)
3. Estado final: { position: 'center', customPosition: { x: 90, y: 10 } }
4. Clica "top-right" no grid novamente
5. Estado final: { position: 'top-right', customPosition: undefined }
   → Volta para Grid, limpa Free mode
```

### Pattern 2: Per-Slide Customization
```typescript
// Slide 0: Headline em center
{
  headline: { position: 'center', textAlign: 'center' },
  body: { position: 'bottom-center', textAlign: 'center' }
}

// Slide 1: Headline em top-left, arrasted
{
  slideOverrides[1]: {
    headline: {
      position: 'top-left',
      textAlign: 'left',
      customPosition: { x: 20, y: 15 }
    }
  }
}

// Slide 2: Back to defaults (sem override)
// → Usa valores globais automaticamente
```

### Pattern 3: Alignment + Position
```typescript
// Title em top, alinhado à esquerda
{
  headline: {
    position: 'top-center',
    textAlign: 'left'      // ← Alinhamento do texto dentro do elemento
  }
}

// Resultado visual:
┌─────────────────────────────────┐
│ Your Title Here                 │  ← Positioned top-center, text aligns left
│                                 │
└─────────────────────────────────┘
```

---

## Testing

### Test Grid Selection
```javascript
// 1. Abrir DevTools Console
// 2. Clicar cada uma das 9 posições
// 3. Verificar logs:
//    [CLICK GRID] → [UPDATE LAYOUT] → [LAYOUT PROPS]
// 4. Preview deve atualizar imediatamente
```

### Test Drag & Drop
```javascript
// 1. Gerar um post
// 2. Apontar para o título no preview
// 3. Cursor muda para 👆
// 4. Arrastar para nova posição
// 5. Soltar → console deve mostrar:
//    [UPDATE LAYOUT] com customPosition
```

### Test Carousel Override
```javascript
// 1. Gerar carrossel
// 2. Mudar layout do slide 1 (ex: top-left)
// 3. Navegar para slide 2
// 4. Navegar de volta para slide 1
// 5. Layout deve se manter (top-left)
```

---

## Performance Notes

### Optimizations
- `getPositionStyles()` executado no render da layout (lightweight)
- Merge de `effectiveLayout` feito em PostPreview (single pass)
- Drag end calcula percentual apenas uma vez ao soltar

### Future Improvements
- [ ] Memoize `effectiveLayout` em PostPreview
- [ ] Add grid visualization during drag
- [ ] Undo/Redo for layout changes
- [ ] Layout presets/templates

---

## Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| Texto fica cortado | Safe area margin pequeno | Aumentar MARGIN em layoutUtils.ts |
| Sobreposição headline/body | Body position = 'center' | Mudar body default para 'bottom-center' |
| Drag não funciona | onLayoutUpdate callback não passado | Verificar se LayoutCentered recebe callback |
| Override não aplica | Índice do slide incorreto | Verificar editSettings.currentSlideIndex |
| Grid position não muda | customPosition ainda existe | Clicar grid novamente (limpa free mode) |

---

## File References

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/types/editor.ts` | Tipos LayoutSettings |
| `src/lib/layoutUtils.ts` | Cálculo de posições |
| `src/components/editor/EditPanel/LayoutTab.tsx` | Grid UI + controle |
| `src/components/preview/PostPreview.tsx` | Merge de layouts |
| `src/components/preview/layouts/LayoutCentered.tsx` | Renderização final |
| `src/components/preview/layouts/LayoutCarousel.tsx` | Navegação de slides |
| `src/hooks/useEditSettings.ts` | State management |

---

**Versão**: 2.0.1
**Data**: 2025-02-04
**Status**: ✅ Pronto para uso
