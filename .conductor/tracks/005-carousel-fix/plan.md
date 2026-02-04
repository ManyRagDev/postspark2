# Plano: Track 005 - Correção Completa do Carrossel

Corrigir a renderização e exportação de carrosseis.

---

## Diagnóstico Detalhado

```mermaid
flowchart TD
    A[Usuário digita texto] --> B[Seleciona Carrossel]
    B --> C[Clica Gerar]
    C --> D[API /generate-content]
    D --> E{Retorna slides[]}
    E -->|❌ Problema| F[slides vão para caption]
    E -->|✅ Correto| G[slides populam array]
    G --> H[API /compose-post]
    H --> I[Gera 1 imagem estática]
    I --> J[imageBlob substitui PostPreview]
    J --> K[❌ Preview vira imagem única]
```

### Pontos de Falha Identificados

| # | Local | Problema | Impacto |
|---|-------|----------|---------|
| 1 | `gemini.ts` | Prompt não enforça array `slides` | Slides vão para caption |
| 2 | `MagicInterface.tsx` L403 | `imageBlob` substitui `PostPreview` | Perde navegação |
| 3 | `PostPreview.tsx` L20 | Layout vem de `config.layout` | Ignora formato selecionado |
| 4 | `usePostGeneration.ts` L89 | `compose-post` gera 1 imagem | Não suporta múltiplos slides |

---

## Proposta de Correção (Opção B: Preview Interativo)

### Estratégia
Para carrossel, **não gerar imageBlob**. Manter o `PostPreview` interativo e permitir exportar slides individualmente via canvas/html2canvas.

---

### [MODIFY] [MagicInterface.tsx](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/components/editor/MagicInterface.tsx)

**Linha ~403**: Condicionar exibição do preview:
```tsx
// Antes
{imageBlob ? (
    <img src={URL.createObjectURL(imageBlob)} ... />
) : (
    <PostPreview ... />
)}

// Depois
{imageBlob && format !== 'carousel' ? (
    <img src={URL.createObjectURL(imageBlob)} ... />
) : (
    <PostPreview 
        text={content?.headline || text}
        config={{
            ...config,
            layout: format === 'carousel' ? 'carousel' : config.layout, // Força layout
            aspectRatio,
            ...
        }}
        slides={content?.slides}
        ...
    />
)}
```

---

### [MODIFY] [usePostGeneration.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/hooks/usePostGeneration.ts)

**Linha ~89**: Pular composição de imagem para carrossel:
```typescript
// Antes
const composeResponse = await fetch('/api/compose-post', ...);

// Depois
let imageBlob: Blob | null = null;

if (options.format !== 'carousel') {
    const composeResponse = await fetch('/api/compose-post', ...);
    imageBlob = await composeResponse.blob();
}
```

---

### [NEW] Função de Export Individual

Adicionar em `MagicInterface.tsx`:
```typescript
const downloadSlide = async (slideIndex: number) => {
    // Usar html2canvas ou dom-to-image para capturar slide atual
    // Salvar como PNG
};
```

---

## Passos Atômicos

### Fase 1: Fluxo Básico
- [x] Modificar `usePostGeneration.ts` para pular `compose-post` quando `format === 'carousel'`
- [x] Modificar `MagicInterface.tsx` para mostrar `PostPreview` mesmo quando há `content`
- [x] Forçar `layout: 'carousel'` no config quando formato é carrossel

### Fase 2: Texto nos Slides
- [x] Verificar se `content?.slides` está sendo passado para `PostPreview`
- [x] Verificar se `PostPreview` passa `slides` para `LayoutCarousel`
- [x] Ajustar `LayoutCarousel` para usar texto de cada slide

### Fase 3: Export
- [ ] Instalar `html2canvas` ou equivalente
- [ ] Implementar `downloadSlide(index)` para exportar slide individual
- [ ] Implementar `downloadAllSlides()` para exportar todos como ZIP ou sequência

### Verificação
- [ ] Selecionar Carrossel → Gerar → Ver slides navegáveis
- [ ] Cada slide mostra texto diferente do array
- [ ] Background aparece em todos os slides
- [ ] Botão de download funciona para slides individuais

---

## Arquivos Afetados

| Arquivo | Mudança Principal |
|---------|-------------------|
| `usePostGeneration.ts` | Pular compose-post para carousel |
| `MagicInterface.tsx` | Forçar layout, condicionar preview |
| `PostPreview.tsx` | Garantir passagem de slides |
| `LayoutCarousel.tsx` | Já implementado anteriormente ✅ |
