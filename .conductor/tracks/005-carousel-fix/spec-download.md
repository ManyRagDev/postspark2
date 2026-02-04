# Spec: Download de Carrossel e UX Polish

## Objetivo
Permitir que o usuário baixe todos os slides do carrossel gerado e melhorar a experiência inicial selecionando automaticamente o aspecto 5:6.

## Requisitos
### Funcionais
1. **Download de Slides**:
   - Botão "Baixar Slides (ZIP)" quando formato for carrossel
   - Gerar imagens PNG de cada slide usando o conteúdo visual renderizado
   - Empacotar todas as imagens em um arquivo ZIP com nomes sequenciais (`slide_1.png`, `slide_2.png`, etc.)
   - Usar `html2canvas` para captura e `jszip` para empacotamento

2. **Aspect Ratio Automático**:
   - Quando usuário selecionar formato "Carrossel", mudar automaticamente o aspecto para `5:6`
   - Permitir que usuário mude manualmente depois se desejar

### Não-Funcionais
- Feedback visual durante o processo de geração do ZIP (loading state)
- Captura de alta qualidade (considerar pixel ratio)

## Implementação Técnica
- Biblioteca `html2canvas` para renderizar DOM em Canvas
- Biblioteca `jszip` para criar o arquivo .zip
- Biblioteca `file-saver` para iniciar o download

### Fluxo de Download
1. Iterar sobre array de slides
2. Renderizar cada slide (pode precisar de um container invisível ou iterar visualmente)
***DESAFIO***: Os slides não estão todos visíveis ao mesmo tempo.
**SOLUÇÃO**:
- Criar um container temporário fora da tela (`position: absolute; left: -9999px`)
- Renderizar todos os slides nesse container simulando o layout final
- Capturar cada um com `html2canvas`
- Limpar container
