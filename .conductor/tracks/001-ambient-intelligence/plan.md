# PostSpark 2.0 - Ambient Intelligence Core

## Descrição
Implementação do sistema de Inteligência Ambiental que detecta a intenção do usuário através do texto digitado e transforma dinamicamente a interface (cores, layouts, sugestões) para guiar a criação de posts.

---

## User Review Required

> [!IMPORTANT]
> **Decisão de Arquitetura**: O sistema de detecção usará Regex + Dicionário de Pesos no cliente (sem IA/API) para garantir resposta instantânea (<100ms). Isso significa que a detecção é baseada em keywords pré-definidas.

> [!WARNING]  
> **Limitação Inicial**: O "Lápis Mágico" (Copy Assistant) será implementado apenas como UI placeholder nesta fase. A integração com IA generativa virá em track futura.

---

## Proposed Changes

### 1. Setup do Projeto

#### [NEW] [vite.config.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/vite.config.ts)
Configuração do Vite com React e TypeScript

#### [NEW] [package.json](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/package.json)
Dependências: React, TailwindCSS, Framer Motion, Lucide React

#### [NEW] [tailwind.config.js](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/tailwind.config.js)
Configuração custom com temas para cada estado ambiental

#### [NEW] [tsconfig.json](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/tsconfig.json)
Configuração TypeScript strict

---

### 2. Sistema de Tipos

#### [NEW] [ambient.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/types/ambient.ts)
```typescript
type AmbientState = 
  | 'neutral'
  | 'motivational'
  | 'informative'
  | 'promotional'
  | 'personal'
  | 'educational'
  | 'controversial'

interface AmbientConfig {
  state: AmbientState
  keywords: string[]
  theme: { bg: string; text: string; accent: string }
  layout: 'centered' | 'card' | 'hierarchy' | 'split' | 'carousel' | 'headline'
  ctaText: string
}
```

---

### 3. Core Logic (Hooks & Utils)

#### [NEW] [ambientStates.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/lib/ambientStates.ts)
Configuração completa dos 6 estados + neutro:
- Tabela de keywords com pesos
- Temas visuais (cores TailwindCSS)
- Layouts sugeridos
- Textos de CTA dinâmicos

#### [NEW] [keywordDetector.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/lib/keywordDetector.ts)
Lógica de detecção via Regex:
- Normalização de texto (lowercase, remove acentos)
- Matching com pesos
- Retorno do estado dominante

#### [NEW] [useAmbientIntelligence.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/hooks/useAmbientIntelligence.ts)
Hook principal:
```typescript
function useAmbientIntelligence(text: string) {
  // Debounce de 150ms
  // Memoização do resultado
  // Retorna: { state, theme, layout, ctaText, reset() }
}
```

---

### 4. Componentes UI Base

#### [NEW] [Button.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/ui/Button.tsx)
Botão base com variants e tamanhos

#### [NEW] [Badge.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/ui/Badge.tsx)
Badge de estado com botão "X" para reset

#### [NEW] [TextArea.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/ui/TextArea.tsx)
Input de texto com autosize

---

### 5. Componentes do Editor

#### [NEW] [MagicInterface.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/editor/MagicInterface.tsx)
Container principal que:
- Envolve input + preview
- Aplica transições de tema via Framer Motion
- Muda background/cores baseado no estado

#### [NEW] [AmbientBadge.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/editor/AmbientBadge.tsx)
Badge visual que mostra o estado detectado:
- "Modo: Promoção 🔥"
- "Modo: Motivação ✨"
- Animação de entrada/saída

#### [NEW] [ChameleonButton.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/editor/ChameleonButton.tsx)
CTA dinâmico que muda texto conforme estado:
- "Criar Oferta 🔥" (promocional)
- "Inspirar Agora ✨" (motivacional)
- Animação de morphing

#### [NEW] [MagicPencil.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/editor/MagicPencil.tsx)
Ícone de lápis que brilha quando input é "pobre":
- Popover com opções: "Mais Punch", "Storytelling", "Venda Direta"
- Placeholder para futura integração IA

---

### 6. Componentes de Preview

#### [NEW] [PostPreview.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/preview/PostPreview.tsx)
Preview do post com layout responsivo:
- Container flex/grid elástico
- Aplica layout sugerido pelo estado

#### [NEW] [LayoutCentered.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/preview/layouts/LayoutCentered.tsx)
Layout para estado Motivacional

#### [NEW] [LayoutHierarchy.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/preview/layouts/LayoutHierarchy.tsx)
Layout para estado Promocional (preço destacado)

#### [NEW] [LayoutSplit.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/preview/layouts/LayoutSplit.tsx)
Layout para estado Pessoal/Story

---

### 7. Estilos e Temas

#### [NEW] [ambient-themes.css](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/styles/ambient-themes.css)
CSS customizado para efeitos especiais:
- Glow no texto (motivacional)
- Textura de papel/ruído (pessoal)
- Animação de vibração no botão (promocional)

---

### 8. Entry Point

#### [NEW] [App.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/App.tsx)
Componente raiz com o MagicInterface

#### [NEW] [main.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/main.tsx)
Entry point React

#### [NEW] [index.html](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/index.html)
HTML base

---

## Verification Plan

### Automated Tests

> [!NOTE]
> O projeto será criado do zero, então precisaremos configurar o ambiente de testes.

1. **Configurar Vitest** para testes unitários
2. **Testes do keywordDetector**:
   ```bash
   npm run test -- keywordDetector
   ```
   - Testar cada estado com suas keywords
   - Testar texto misto (deve retornar o dominante)
   - Testar texto vazio (deve retornar 'neutral')

3. **Testes do useAmbientIntelligence**:
   ```bash
   npm run test -- useAmbientIntelligence
   ```
   - Testar debounce funciona corretamente
   - Testar função reset()

### Browser Testing

1. **Iniciar dev server**:
   ```bash
   npm run dev
   ```

2. **Testar transições visuais**:
   - Digitar "PROMOÇÃO IMPERDÍVEL 50% OFF" → UI deve ficar vermelha/laranja
   - Digitar "Minha jornada de superação" → UI deve ficar com tons pastéis
   - Digitar "5 dicas para seu negócio" → UI deve ficar clean/tech

3. **Testar Badge de Estado**:
   - Verificar que badge aparece após detectar estado
   - Clicar "X" no badge → deve voltar para neutro

4. **Testar Botão Camaleão**:
   - Verificar que texto do CTA muda conforme estado

### Manual Verification (User)

> [!TIP]
> Após implementação, o usuário deve testar o fluxo completo digitando textos de diferentes "vibes" e observando as transições visuais.

---

## Estrutura Final de Pastas

```
PostSpark 2/
├── .conductor/
│   ├── product.md
│   ├── tech-stack.md
│   ├── rules.md
│   └── tracks.md
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── TextArea.tsx
│   │   ├── editor/
│   │   │   ├── MagicInterface.tsx
│   │   │   ├── AmbientBadge.tsx
│   │   │   ├── ChameleonButton.tsx
│   │   │   └── MagicPencil.tsx
│   │   └── preview/
│   │       ├── PostPreview.tsx
│   │       └── layouts/
│   │           ├── LayoutCentered.tsx
│   │           ├── LayoutHierarchy.tsx
│   │           └── LayoutSplit.tsx
│   ├── hooks/
│   │   └── useAmbientIntelligence.ts
│   ├── lib/
│   │   ├── ambientStates.ts
│   │   └── keywordDetector.ts
│   ├── styles/
│   │   └── ambient-themes.css
│   ├── types/
│   │   └── ambient.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```
