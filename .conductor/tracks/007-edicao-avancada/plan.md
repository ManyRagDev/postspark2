# TRACK-007: Edição Visual Avançada & Configuração por Slide

> **Date**: February 3, 2026
> **Prioridade**: Alta
> **Status**: Planning

## 🔍 Problema
1.  **Falta de Precisão**: Usuários querem posicionar texto livremente (Drag-and-Drop), não apenas snap-to-grid.
2.  **Configuração Global Rígida**: Alterações no "Controle Total" afetam todos os slides do carrossel. O usuário deseja que ajustem se apliquem apenas ao slide atual.

## 🛠 Solução Proposta

### 1. Drag-and-Drop (Texto)
- Transformar `headline` e `body` em elementos `draggable` via `framer-motion`.
- Armazenar coordenadas `x, y` (porcentagem) quando o arrasto termina.
- Atualizar a UI do Grid para mostrar status "Custom" quando coordenadas existem.

### 2. Configuração por Slide (Deep Merge State)
- Refatorar o hook de configurações para manter um "Override Map": `{ [slideIndex]: Partial<EditSettings> }`.
- Quando um usuário edita algo enquanto visualiza o Slide N, a alteração é salva no Override Map do Slide N.
- **Botão "Aplicar a Todos"**: Adicionar opção para propagar o override para o Global.

## 📅 Plano de Execução

### Fase 1: Fundação de Dados (`types`)
- [x] Atualizar `LayoutSettings` para incluir `customPosition?: { x: number, y: number }`.
- [x] Criar interfaces para `SlideStorage` e `SlideOverrides`.
- [x] Refatorar `useEditSettings` para suportar *scoped updates* (Global vs Slide).

### Fase 2: Drag-and-Drop (Visual)
- [x] Atualizar `PostPreview.tsx` para tornar textos arrastáveis.
- [x] Implementar handlers `onDragEnd` que normalizam coordenadas (px -> %).
- [x] Atualizar `MagicInterface` para persistir novas coordenadas.
- [x] Refatorar `LayoutCarousel` para gerenciar estado e delegar renderização.
- [x] Tuning: Remover restrições de movimento (Total Freedom/No Magnet).

### Fase 3: Configuração Individual (Carousel)
- [ ] Atualizar `MagicInterface` para rastrear `currentSlideIndex`.
- [ ] Implementar lógica de "Merge" (Global + Override) antes de renderizar o preview.
- [ ] UI Update: Adicionar indicador "Editando Slide N" no painel com opção "Resetar para Global" ou "Aplicar a Todos".

## 🧪 Verification Plan

### Teste Manual (Drag)
1.  Arrastar Título para posição aleatória.
    - *Wait*: Texto permanece onde foi solto.
    - *Wait*: Painel de Layout reflete mudança (indicador custom).
2.  Trocar de Slide.
    - *Wait*: Se configuração for global, texto mantém posição relativa? Ou se for por slide, muda? (Isso depende da Fase 3).

### Teste Manual (Slides)
1.  No Slide 1, mudar cor para Vermelho.
2.  Ir para Slide 2.
    - *Wait*: Slide 2 deve estar com cor original (padrão/global) ou Vermelho se for global?
    - *Spec Goal*: "Mudanças servem para o 3". Isso implica que o padrão é *Por Slide* ao editar?
    - *Definição*: Ao editar no Slide N, aplica-se ao N. Os outros mantêm o Global.
3.  Voltar ao Slide 1.
    - *Wait*: Slide 1 continua Vermelho.
    - *Wait*: Slide 2 continua Padrão.
