# Track 007: Edição Visual Avançada

> **Objetivo**: Implementar manipulação direta de texto (Drag-and-Drop) e controle granular de configurações por slide no carrossel.

## 1. Drag-and-Drop para Texto

### Problema
O controle de posição via Grid (Top/Center/Bottom) é limitado. O usuário deseja mover o Título e Corpo livremente.

### Solução
- Atualizar `TextSettings` (ou `LayoutSettings`) para suportar coordenadas personalizadas (`x: number, y: number`) em porcentagem.
- Utilizar `framer-motion` (`drag`, `dragMomentum={false}`) nos elementos de texto do preview.
- **Interação**:
  - Quando o usuário arrasta o texto no Preview, o modo muda automaticamente para "Manual".
  - O Grid de posição no painel lateral atualiza para refletir "Custom" (ou desmarca as opções).
  - Clicar no Grid reseta as coordenadas.

### Dados
```typescript
interface TextPositionConfig {
    preset: TextPosition;    // 'top-left' etc (legacy/snap)
    custom?: { x: number; y: number }; // Percentage (0-100)
}
```

## 2. Configuração Individual por Slide

### Problema
Atualmente, as configurações de layout, cor e imagem aplicam-se a *todos* os slides do carrossel. Se o usuário quiser que o Slide 2 tenha texto em cima e o Slide 3 texto embaixo, não é possível.

### Solução
- Refatorar o modelo de dados dos Slides para suportar overrides de configuração.
- Logica de "Cascata": `FinalSettings = GlobalSettings + SlideOverride`.

### Estrutura de Dados
```typescript
interface SlideData {
    id: string;
    content: string; // Texto do slide
    // Configurações específicas deste slide (opcional)
    overrides?: DeepPartial<EditSettings>; 
}
```

### UX Flow
1.  Usuário navega até o Slide 2 no Preview.
2.  MagicInterface detecta `currentSlideIndex`.
3.  EditPanel mostra as configurações atuais do Slide 2 (Global + Override).
4.  Quando o usuário altera algo (ex: cor, posição):
    - O sistema salva essa alteração no `overrides` do Slide 2.
    - **Desafio**: Como saber se o usuário quer mudar *todos* ou *só este*?
    - **Decisão do Usuário**: "Se estou no slide 2, mudanças se aplicam ao 2".
    - *Opcional*: Botão "Aplicar a todos" no painel.

## 3. Arquitetura

### Componentes Afetados
- `types/editor.ts`: Atualizar `CardContent` (slides) e `LayoutSettings`.
- `MagicInterface.tsx`: Gerenciar estado de slides complexos e lógica de merge.
- `PostPreview.tsx`: Aceitar configurações mergiadas por slide.
- `useEditSettings.ts`: Lógica de atualização (updateCurrentSlide vs updateGlobal).

### Riscos
- **Complexidade de Estado**: Gerenciar overrides parciais pode ser complexo (ex: mudar fonte no global vs slide).
- **Drag Interaction**: Drag dentro de um container com `transform` (zoom/scale) requer normalização de coordenadas.

## 4. Plano de Implementação
1.  **Refatorar Dados**: Migrar `string[]` para `SlideData[]`.
2.  **Engine de Configuração**: Implementar hook `useSlideSettings` que faz o merge (Global + Override).
3.  **Preview Interativo**: Adicionar wrappers de Drag (`motion.div` drag) no `PostPreview`.
4.  **Integração**: Conectar eventos de drag ao update de settings.
