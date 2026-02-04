# Plano: Track 003 - Carousel Visualization

Implementar a visualização dinâmica de slides, melhorar prompts e adicionar polimentos de UX.

---

## Proposta de Mudanças

### Gemini (Engenharia de Prompt)

#### [MODIFY] [gemini.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/lib/gemini.ts)
- Atualizar `formatInstructions` para carrossel:
    - Limitar cada slide a **20-40 palavras**.
    - Instruir para ser conciso: "Detalhes vão na legenda".
    - Estrutura: Capa + 4 slides de conteúdo + CTA.

---

### Preview Components

#### [MODIFY] [LayoutCarousel.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/preview/layouts/LayoutCarousel.tsx)
- Receber `slides?: string[]` como prop.
- Implementar navegação entre slides (setas ou indicadores clicáveis).
- Renderizar fundo replicado em cada slide.
- Usar classe dinâmica de `aspectRatio`.

#### [MODIFY] [PostPreview.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/preview/PostPreview.tsx)
- Passar `slides` do conteúdo gerado para `LayoutCarousel`.
- Passar `imageUrl` e configurações de fundo para o layout.

---

### Editor Components

#### [MODIFY] [MagicInterface.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/editor/MagicInterface.tsx)
- Adicionar `useEffect` para auto-dismiss do toast de sucesso após **10 segundos**.

---

## Passos Atômicos

### Prompt Engineering
- [x] Atualizar `gemini.ts` limitando slides a 20-40 palavras
- [x] Instruir IA que detalhes vão na legenda

### Visualização de Slides
- [x] Modificar `LayoutCarousel.tsx` para receber `slides` da IA
- [x] Implementar navegação entre slides (setas/indicadores)
- [x] Aplicar background replicado em cada slide
- [x] Usar `aspectRatio` dinâmico

### Integração
- [x] Passar `slides` de `PostPreview` para `LayoutCarousel`
- [x] Passar `imageUrl` e configurações de fundo

### UX Polish
- [x] Auto-dismiss do toast após 10 segundos em `usePostGeneration.ts`

---

## Plano de Verificação

### Verificação Manual
1. Selecionar "Carrossel" e gerar um post. Verificar se os slides aparecem com conteúdo conciso.
2. Navegar entre os slides no preview. Verificar se o background se repete.
3. Verificar se o toast "Post criado com sucesso!" desaparece após 10s.
