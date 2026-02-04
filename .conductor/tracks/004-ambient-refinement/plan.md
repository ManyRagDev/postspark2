# Plano: Track 004 - Ambient Intelligence Refinement

Refinar a detecção de estados ambientais para maior precisão, eliminando falsos positivos.

---

## Diagnóstico: Problemas Identificados

### 🔴 Conflitos de Keywords

| Keyword | Estado Atual | Conflito com | Solução |
|---------|--------------|--------------|---------|
| `sucesso` | motivational | promotional | Mover para primária em motivational |
| `verdade` | informative + controversial | Ambos | Remover de informative, manter em controversial |
| `agora` | promotional | Muito genérico | Remover (aparece em qualquer contexto) |
| `limitado` | promotional | educational ("tempo limitado de aula") | Exigir contexto de venda |
| `foco` | motivational | educational/informative | Manter, aumentar threshold |

### 🟡 Keywords Fracas (Falsos Positivos)

**promotional** tem keywords genéricas demais:
- `agora` → remove (qualquer texto pode ter)
- `corra` → remove (pode ser corrida esportiva)
- `exclusivo` → mantém mas como secundária

**educational** precisa de keywords mais fortes:
- Adicionar: `como`, `o que é`, `por que`, `quando usar`
- `produtivo`, `produtividade` → adicionar aqui

**controversial** conflita com informative:
- `verdade` aparece nos dois → manter só em controversial
- `insight` → manter só em informative

---

## Proposta de Mudanças Detalhada

### [MODIFY] [ambientStates.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/lib/ambientStates.ts)

#### Mudar estrutura de keywords para:
```typescript
keywords: {
    primary: string[];    // Peso 3x - palavras-chave fortes
    secondary: string[];  // Peso 1x - palavras de apoio
    exclude: string[];    // Peso -5 - invalidam o estado
}
```

#### Mudanças por Estado:

**motivational:**
- Primary: `nunca desista`, `você consegue`, `acredite`, `superação`, `transformação`
- Secondary: `sonho`, `objetivo`, `meta`, `foco`, `coragem`
- Exclude: `promoção`, `desconto`, `compre`, `r$`

**educational:**
- Primary: `como fazer`, `passo a passo`, `tutorial`, `aprenda`, `guia`
- Secondary: `dicas para`, `técnica`, `método`, `produtivo`, `produtividade`
- Exclude: `desconto`, `oferta`, `promoção`

**promotional:**
- Primary: `desconto`, `promoção`, `oferta`, `% off`, `de r$`, `por apenas`
- Secondary: `aproveite`, `exclusivo`, `grátis`, `bônus`
- Exclude: ❌ (sem exclusões - promoção é contexto forte)
- **Remove**: `agora`, `corra`, `limitado` (genéricas demais)

**informative:**
- Primary: `você sabia`, `curiosidade`, `fato`, `estudo mostra`, `pesquisa`
- Secondary: `dados`, `estatística`, `tendência`, `novidade`
- Exclude: `revelado`, `escândalo` (direciona para controversial)
- **Remove**: `verdade` (conflita com controversial)

**controversial:**
- Primary: `pare de`, `não faça`, `mentira`, `revelado`, `escândalo`
- Secondary: `verdade`, `cuidado`, `alerta`, `perigo`
- Exclude: `tutorial`, `aprenda` (direciona para educational)

**personal:**
- Primary: `minha história`, `minha jornada`, `eu aprendi`, `desabafo`
- Secondary: `experiência`, `reflexão`, `sentimento`
- Exclude: `promoção`, `oferta`

---

### [MODIFY] [keywordDetector.ts](file:///c:/Users/emanu/Documents/Projetos/PostSpark%202/src/lib/keywordDetector.ts)

#### Atualizar `calculateStateScore`:
```typescript
function calculateStateScore(text: string, state: AmbientState): KeywordMatch {
    const config = AMBIENT_STATES[state];
    let score = 0;

    // Verificar exclusões primeiro (invalida o estado)
    for (const exclude of config.keywords.exclude) {
        if (text.includes(exclude)) {
            return { state, score: -100, matches: [] }; // Invalida
        }
    }

    // Keywords primárias (peso 3x)
    for (const primary of config.keywords.primary) {
        if (text.includes(primary)) {
            score += 6; // 3x peso base
            matches.push(primary);
        }
    }

    // Keywords secundárias (peso 1x)
    for (const secondary of config.keywords.secondary) {
        if (text.includes(secondary)) {
            score += 2;
            matches.push(secondary);
        }
    }

    return { state, score, matches };
}
```

#### Aumentar threshold mínimo:
- Atual: score > 0
- Novo: score >= 6 (precisa de pelo menos 1 keyword primária)

---

## Passos Atômicos

### Restruturação de Types
- [x] Atualizar `AmbientConfig` em `types/ambient.ts` para nova estrutura de keywords

### Migração de Keywords
- [x] Migrar `motivational` para nova estrutura
- [x] Migrar `educational` para nova estrutura
- [x] Migrar `promotional` para nova estrutura (remover genéricas)
- [x] Migrar `informative` para nova estrutura
- [x] Migrar `controversial` para nova estrutura
- [x] Migrar `personal` para nova estrutura

### Atualização do Detector
- [x] Implementar lógica de exclusão em `keywordDetector.ts`
- [x] Implementar pesos diferenciados (primary 3x, secondary 1x)
- [x] Aumentar threshold mínimo para score >= 6

### Verificação
- [ ] "como ser produtivo no home office" → `educational` ✓
- [ ] "oferta 50% desconto" → `promotional` ✓
- [ ] "nunca desista dos seus sonhos" → `motivational` ✓
- [ ] "5 dicas para empreendedores" → `informative` ✓
- [ ] "pare de fazer isso agora" → `controversial` ✓

---

## Resultado Esperado

| Texto de Teste | Antes | Depois |
|----------------|-------|--------|
| "como ser produtivo no home office" | promotional | **educational** |
| "5 dicas para seu negócio" | promotional | **informative** |
| "nunca desista dos seus sonhos" | neutral | **motivational** |
| "pare de cometer esse erro" | neutral | **controversial** |
| "minha jornada até aqui" | neutral | **personal** |
