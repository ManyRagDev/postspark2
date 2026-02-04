# Spec: Visualização de Carrossel

## Objetivo
Implementar visualização dinâmica de slides para o formato carrossel, com prompt engineering para conteúdo conciso e polimentos de UX.

## Requisitos

### Funcionais
1. Quando "Carrossel" for selecionado, exibir slides individuais navegáveis no preview.
2. Cada slide deve ter no máximo 20-40 palavras (engenharia de prompt).
3. O background selecionado deve ser replicado em todos os slides.
4. O toast "Post criado com sucesso!" deve desaparecer após 10 segundos.

### Não-Funcionais
- Transições suaves entre slides (Framer Motion).
- Manter responsividade em diferentes aspect ratios.

## Escopo
- **IN**: Visualização, prompt, background replicado, toast temporário.
- **OUT**: Exportação individual de slides, animações complexas.
