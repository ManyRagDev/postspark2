# Spec: Correção Completa do Carrossel

## Problema
O carrossel não está funcionando. Ao selecionar "Carrossel" e gerar:
- Os slides aparecem como texto na legenda
- A visualização mostra um post estático, não slides navegáveis
- O layout `carousel` não é aplicado

## Causa Raiz (Diagnóstico)

### Problema 1: imageBlob sobrescreve tudo
```tsx
{imageBlob ? (
    <img src={URL.createObjectURL(imageBlob)} ... /> // ❌ Sempre estático
) : (
    <PostPreview slides={content?.slides} ... /> // ✅ Só aparece antes de gerar
)}
```
Quando a imagem é gerada, o `PostPreview` (que tem a navegação de slides) é **completamente substituído** por uma imagem estática.

### Problema 2: Layout não é forçado
O layout vem do `config.layout` que é baseado no estado ambiental, não no formato selecionado. Então mesmo selecionando "Carrossel", o layout pode ser `centered`, `hierarchy`, etc.

### Problema 3: API gera imagem única
A API `compose-post` gera apenas 1 imagem. Para carrossel, precisamos:
- Opção A: Gerar N imagens (uma por slide)
- Opção B: Não gerar imagem, manter preview interativo

## Requisitos da Correção

1. Quando formato = `carousel`, o resultado pós-geração deve mostrar slides navegáveis
2. Cada slide deve ter o texto correspondente do array `slides`
3. Background e overlay devem ser aplicados em todos os slides
4. Deve haver opção de baixar cada slide individualmente ou todos de uma vez
