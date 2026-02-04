# Regras do Projeto - PostSpark 2.0

## Design Rules
1. **Sem Canvas Absoluto**: Usar Flexbox/Grid inteligente, nunca position: absolute para layout
   - **Exceção v2.0.1**: Position absolute permitido APENAS para texto em Layout System (dentro de container relativo)
2. **Mágica Invisível**: Usuário não deve ver métricas técnicas (px, layers, zoom)
3. **Transições Suaves**: Todas as mudanças de estado com animação mínima de 200ms
4. **Glass-morphism**: UI com backdrop-blur e semi-transparência para efeito premium
5. **Cores por Estado**: Cada ambient state tem paleta própria definida em `ambientStates.ts`
6. **Contraste Automático**: Texto sempre legível independente do fundo (cálculo de luminância)

## Code Rules
1. **TypeScript Obrigatório**: Todas as interfaces e tipos devem ser explícitos
2. **Hooks Custom**: Lógica complexa sempre em hooks reutilizáveis
3. **Sem Side Effects no Render**: Usar useEffect para operações assíncronas
4. **Tipos Centralizados**: Todos os tipos em `src/types/` (ambient.ts, api.ts)
5. **Barrel Exports**: Cada pasta de componentes tem `index.ts` exportando tudo
6. **API Routes Isoladas**: Lógica de servidor apenas em `src/app/api/`

## Architecture Rules
1. **Separação Clara**:
   - `components/` → Apresentação (React components)
   - `hooks/` → Estado e side effects (useAmbientIntelligence, usePostGeneration)
   - `lib/` → Lógica de negócio pura (keywordDetector, layoutEngine)
   - `utils/` → Funções utilitárias genéricas
2. **Pipeline de Geração**:
   - Stage 1: Content (Gemini) → headline, body, caption, hashtags
   - Stage 2: Composition (Sharp) → PNG final
3. **Fallback Gracioso**: Sempre ter fallback quando API externa falha
4. **Layout System** (v2.0.1):
   - Grid 3x3 para posições pré-definidas (clique no LayoutTab)
   - Modo Livre com arrastar (drag no preview)
   - Headline e Body completamente independentes
   - Por-slide overrides em carrossel via `slideOverrides[index].layout`
   - Sistema de merge automático em PostPreview

## UX Rules
1. **Feedback Imediato**: Máximo 100ms para resposta visual a input
2. **Estado Visível**: Sempre mostrar o modo detectado via AmbientBadge
3. **Escape Hatch**: Sempre permitir reset para modo "Neutro"
4. **Loading States**: Skeleton ou spinner durante operações assíncronas
5. **Error Boundaries**: Erros não devem quebrar a UI inteira
6. **Confirmação Visual**: Animação de sucesso após download/copy

## Performance Rules
1. **Debounce no Input**: 150ms para processamento de texto no cliente
2. **Memoização**: `useMemo` para cálculos pesados de keywords e layouts
3. **Lazy Loading**: Componentes pesados devem usar `React.lazy()`
4. **Image Optimization**: Backgrounds servidos via Next.js Image quando possível
5. **API Caching**: Cache de respostas do Gemini para inputs idênticos
6. **Layout Calculation**: Memoizar `effectiveLayout` em PostPreview para evitar re-cálculos

## Ambient State Rules
1. **Detecção Hierárquica**: Primary keywords (6pts) > Secondary (2pts)
2. **Exclusões**: Palavras que invalidam um estado têm prioridade
3. **Bonus de Confiança**: +30% se 3+ matches do mesmo estado
4. **Fallback Neutro**: Se nenhum estado claro, usar "neutral"
5. **Override Manual**: Usuário sempre pode forçar um estado específico

## Layout System Rules (v2.0.1)
1. **Grid por Clique**: Clicar posição no LayoutTab ativa Modo Grid (limpa customPosition)
2. **Arrastar por Preview**: Arrastar elemento ativa Modo Livre (salva customPosition)
3. **Prioridade**: customPosition sempre sobrescreve position (se definido)
4. **Independência**: headline e body têm configurações separadas
5. **Per-Slide**: Carrossel pode ter layout diferente em cada slide via slideOverrides
6. **Default Positioning**: 
   - Headline: center (por padrão)
   - Body: bottom-center (para não sobrepor)
7. **Drag Offset**: Manter posição relativa ao cursor durante arrastar

## Layout Engine Rules
1. **20 Princípios de Design**: Implementados em `layoutEngine.ts`
2. **Impact Words**: NUNCA, AGORA, GRÁTIS → escala de fonte aumentada
3. **Safe Areas**: Texto posicionado em zonas de baixa complexidade da imagem
4. **Overlay Adaptativo**: Opacidade calculada baseada em luminância do fundo
5. **Escala Responsiva**: Fonte reduz proporcionalmente ao comprimento do texto

## API Rules
1. **Validação de Input**: Sempre validar antes de processar
2. **Error Handling**: Retornar mensagens úteis, nunca stack traces
3. **Rate Limiting**: Considerar limites da API Gemini
4. **Timeout**: Máximo 30s para operações de geração
5. **Cleanup**: Liberar recursos (buffers Sharp) após uso
