# Spec: Refinamento do Ambient Intelligence

## Objetivo
Melhorar a precisão da detecção de estado ambiental para evitar classificações incorretas (ex: "produtividade" sendo detectado como "promotional").

## Problema Atual
- A detecção baseada em keywords pode gerar falsos positivos
- Palavras genéricas podem triggar estados errados
- Falta hierarquia de prioridade entre estados

## Requisitos

### Funcionais
1. Adicionar pesos diferentes para keywords (primárias vs secundárias)
2. Implementar "exclusão mútua" - certas combinações invalidam estados
3. Melhorar keywords de cada estado para maior precisão
4. Considerar contexto além de keywords isoladas

### Não-Funcionais
- Manter detecção rápida (< 50ms)
- Não aumentar complexidade excessiva

## Escopo
- **IN**: Keywords, pesos, lógica de detecção
- **OUT**: NLP avançado, chamadas externas a APIs
