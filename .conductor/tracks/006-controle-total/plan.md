# TRACK-006C: Granular Layout Control & Text Position Fix

> **Date**: February 3, 2026
> **Prioridade**: Alta
> **Status**: Planning

## 🔍 Problema
1.  **Granularidade**: O usuário quer controlar alinhamento, posição e espaçamento separadamente para Título e Corpo.
2.  **Bug**: O controle de "Posição do Texto" atual não funciona (layouts ignoram a configuração).
3.  **Coesão**: Paletas devem se aplicar a ambos.

## 🛠 Solução Proposta

### 1. Data Model (`types/editor.ts`)
Atualizar `LayoutSettings` para suportar configurações independentes:

```typescript
export interface LayoutSettings {
    // Global defaults (legacy/fallback)
    padding: number;
    
    // Granular controls
    headline: {
        position: TextPosition;
        textAlign: TextAlignment;
    };
    body: {
        position: TextPosition;
        textAlign: TextAlignment;
    };
}
```

### 2. UI Updates (`LayoutTab.tsx`)
- Adicionar um **Toggle Switch**: "Título" | "Corpo".
- Quando "Título" ativo: controles afetam `settings.layout.headline`.
- Quando "Corpo" ativo: controles afetam `settings.layout.body`.
- `Padding` (Espaçamento) permanece global (afeta margem interna do container).

### 3. Layout Implementation (`PostPreview` & Layouts)
- Atualizar layouts (`LayoutCentered`, `LayoutCard`, `LayoutSplit`, etc.) para posicionar elementos independentemente.
- **Estratégia de Posicionamento**:
    - Usar posicionamento **Absoluto** para liberdade total (Top/Center/Bottom x Left/Center/Right).
    - OU manter Flex, mas permitir overrides.
    - *Decisão*: Para "Controle Total" real, posicionamento absoluto dentro do container seguro (padding) é o ideal. Se o usuário escolher "Center" para ambos, eles podem sobrepor na teoria, mas na prática o fluxo normal é melhor.
    - *Melhor Abordagem*: Usar um Grid/Flex container. 
        - Se "Position" for Top-Left: `absolute top-p left-p`.
        - Isso permite liberdade total: Título no topo, Corpo embaixo.

### 4. Layouts Afetados
- `LayoutCentered.tsx`
- `LayoutCard.tsx`
- `LayoutSplit.tsx` (Este tem layout fixo de 2 colunas, "Position" pode afetar o texto dentro da coluna de texto?) -> Sim.
- `LayoutHierarchy.tsx`
- `LayoutHeadline.tsx`

---

## 📅 Plano de Execução

### Fase 1: Types & State
- [x] Atualizar `LayoutSettings` em `types/editor.ts`.
- [x] Atualizar `createDefaultEditSettings` e `MagicInterface` para inicializar a nova estrutura.

### Fase 2: UI (LayoutTab)
- [x] Implementar Switch Button.
- [x] Conectar controles às novas chaves (`headline.*`, `body.*`).

### Fase 3: Layout Engine
- [x] Criar utilitário `getStyleFromPosition(pos: TextPosition)` que retorna classes/estilos de posicionamento.
- [x] Atualizar `PostPreview.tsx` para passar os settings granulares.
- [x] Refatorar `LayoutCentered` para usar posicionamento absoluto/flex baseado nas settings.
- [x] Replicar para outros layouts (Implemented: Centered, Card, Headline).

## 🧪 Verification Plan

### Teste Manual
1.  **Toggle**: Clicar em "Título" e mudar Alinhamento p/ Esquerda.
    - *Wait*: Apenas o título alinha à esquerda. Corpo mantém.
2.  **Posição**: Mover Título para "Top Left".
    - *Wait*: Título vai para canto superior esquerdo.
3.  **Posição Corpo**: Mover Corpo para "Bottom Right".
    - *Wait*: Corpo vai para canto inferior direito.
4.  **Padding**: Aumentar espaçamento.
    - *Wait*: Elementos se afastam das bordas.

### Automated Test
- Não há testes unitários de UI existentes. Seguir verificação visual.
