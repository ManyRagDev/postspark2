# Plano: Correção de Erro 429 (GenAI) e Otimização de Requisições

**Objetivo:** Resolver o erro "429 Too Many Requests" ao gerar imagens, garantindo que a aplicação não esteja enviando requisições duplicadas ou malformadas, e melhorando a visibilidade de erros.

## Contexto
- O usuário validou que a API Key e o modelo `gemini-3-pro-image-preview` funcionam via cURL.
- O App recebe 429.
- Suspeita-se de chamadas duplicadas (React Strict Mode) ou payload incorreto.

## Passos

### Fase 1: Frontend (BackgroundManager)
- [ ] **Prevenção de Duplicatas**: 
    - Adicionar verificação estrita de `isGeneratingImage` antes de chamar o fetch.
    - Implementar `useRef` para flag de "em andamento" se necessário para evitar race conditions do React.
- [ ] **Limpeza de Payload**: Garantir que enviamos apenas `{ prompt: string }` no body.

### Fase 2: Backend (API Route)
- [ ] **Payload Estrito**:
    - Implementar estrutura `contents: [{ role: 'user', parts: [{ text: ... }] }]`.
    - Adicionar `generationConfig` (temperature, topP, topK) conforme solicitado.
- [ ] **Logs Detalhados**:
    - Adicionar `console.error(JSON.stringify(error, null, 2))` no catch.
    - Logar o corpo da requisição recebida.
- [ ] **Configuração do Cliente**:
    - Validar instância do `GoogleGenAI`.
- [ ] **Headers**:
    - Garantir `Content-Type: application/json`.

### Fase 3: Validação
- [ ] Testar geração de imagem.
- [ ] Verificar logs.
