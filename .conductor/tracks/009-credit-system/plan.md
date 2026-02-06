# Plan: Sistema de Créditos (Sparks)

## Objetivo
Implementar o sistema de monetização com Sparks + Fidelity Guard (proteção anti-print).

---

## Fase 1: Infraestrutura Base

### 1.1 Setup Supabase
- [ ] Instalar dependências: `@supabase/supabase-js`, `@supabase/ssr`
- [ ] Criar arquivos de configuração: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- [ ] Configurar variáveis de ambiente

### 1.2 Schema do Banco
- [ ] Criar tabela `profiles`:
  ```sql
  CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'LITE', 'PRO', 'AGENCY', 'DEV')),
    sparks INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Criar tabela `spark_transactions`
- [ ] Criar tabela `generation_sessions` (para rastrear regenerações):
  ```sql
  CREATE TABLE generation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    prompt_hash TEXT NOT NULL,
    original_sparks_used INTEGER NOT NULL,
    has_used_regen_basic BOOLEAN DEFAULT FALSE,
    has_used_regen_pollinations BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
  );
  ```
- [ ] Configurar RLS policies
- [ ] Criar trigger para inserir profile no signup

---

## Fase 2: Autenticação

### 2.1 Páginas de Auth
- [ ] Criar `/app/(auth)/login/page.tsx`
- [ ] Criar `/app/(auth)/signup/page.tsx`
- [ ] Implementar layout compartilhado

### 2.2 Middleware de Proteção
- [ ] Criar `middleware.ts` na raiz
- [ ] Redirecionar não-logados para `/login`
- [ ] Permitir acesso livre a `/login`, `/signup`, `/` (landing)

### 2.3 Context de Usuário
- [ ] Criar `contexts/UserContext.tsx`
- [ ] Hook `useUser()` para acessar sparks, plan

---

## Fase 3: Serviço de Sparks

### 3.1 Custos e Configuração
- [ ] Criar `lib/sparks/config.ts`:
  ```ts
  export const SPARK_COSTS = {
    STATIC_POST: { first: 10, regen: 2 },
    POLLINATIONS: { first: 25, regen: 0 },  // 1x grátis
    NANO_BANANA: { first: 80, regen: 10 },
    CAROUSEL: { first: 100, regen: 20 },
  } as const;
  ```

### 3.2 Lógica de Débito + Regeneração
- [ ] Criar `lib/sparks/service.ts`:
  - `createGeneration(userId, promptHash, sparkCost)` → generation_id
  - `canRegenerate(generationId, regenType)` → boolean
  - `useRegeneration(generationId, regenType)` → success/error
  - `isPromptDrasticallyDifferent(oldHash, newHash)` → boolean (>50% palavras diferentes)

### 3.3 Validação de Plano
- [ ] Criar `lib/sparks/plans.ts` com limites por plano
- [ ] Função `canUseFeature(plan, feature)` → boolean

---

## Fase 4: Fidelity Guard (Anti-Print)

### 4.1 Preview de Baixa Fidelidade
- [ ] Modificar `PostPreview.tsx`:
  - Renderizar em 72dpi / ~400px de largura
  - Adicionar CSS `image-rendering: pixelated` para blur sutil
- [ ] Componente de marca d'água sobreposta

### 4.2 Marca d'Água Dinâmica
- [ ] Criar `components/Watermark.tsx`:
  - **FREE**: Marca obstrutiva (cobre parte do texto)
  - **LITE+**: Marca sutil no canto inferior
- [ ] Renderizar marca d'água no canvas (não como overlay HTML)

### 4.3 Download de Alta Fidelidade
- [ ] Modificar `/api/compose-post/route.ts`:
  - Gerar em 1080px / 300dpi
  - Remover marca d'água (ou reduzir para FREE)
  - Validar que usuário tem generation_session válida

---

## Fase 5: Guards nas APIs

### 5.1 Middleware de API
- [ ] Criar `lib/api/withAuth.ts` - HOF para proteger API routes
- [ ] Criar `lib/api/withSparks.ts` - HOF para debitar sparks

### 5.2 Atualizar APIs Existentes
- [ ] Modificar `/api/generate-content/route.ts`:
  - Verificar autenticação
  - Debitar sparks (ou regen cost se aplicável)
  - Criar generation_session
  - Retornar `generation_id` no response
- [ ] Modificar `/api/generate-image/route.ts`:
  - Verificar autenticação
  - Debitar sparks conforme motor
  - Validar regeneração se for retry

### 5.3 Validação de Regeneração
- [ ] Criar endpoint `/api/regenerate/route.ts`:
  - Recebe `generation_id` + tipo de regen
  - Valida se regen ainda disponível
  - Debita custo de regen (ou 0 se grátis)
  - Atualiza flag no banco

---

## Fase 6: Componentes de UI

### 6.1 Indicadores
- [ ] Criar `SparkBalance.tsx` - saldo com ícone de raio
- [ ] Criar `RegenerationBadge.tsx` - mostra tentativas restantes

### 6.2 Modais
- [ ] Criar `UpgradeModal.tsx` - quando saldo insuficiente
- [ ] Criar `LockedFeature.tsx` - overlay com cadeado dourado
- [ ] Criar `RegenerationLimitModal.tsx` - quando acabam as regens

### 6.3 Botão de Regenerar
- [ ] Modificar CTA para mostrar:
  - "Regenerar (2 ⚡)" quando disponível
  - "Regenerar (esgotado)" quando não

---

## Fase 7: Testes e Verificação

### 7.1 Testes de Segurança (Anti-Burla)
- [ ] Tentar regenerar 2x o mesmo tipo → deve bloquear
- [ ] Tentar mudar prompt levemente → deve permitir regen
- [ ] Tentar mudar prompt drasticamente → deve cobrar full price
- [ ] Tentar fazer print do preview → deve ser inutilizável profissionalmente

### 7.2 Verificação Manual
- [ ] Criar usuário FREE: marca d'água obstrutiva presente
- [ ] Criar usuário PRO: preview limpo, download HD
- [ ] Verificar que regeneração é debitada corretamente
- [ ] Verificar que limit de 1 regen por tipo funciona

---

## Arquivos a Criar/Modificar

### Novos Arquivos
```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── sparks/
│   │   ├── config.ts
│   │   ├── service.ts
│   │   └── plans.ts
│   └── api/
│       ├── withAuth.ts
│       └── withSparks.ts
├── contexts/
│   └── UserContext.tsx
├── components/
│   ├── sparks/
│   │   ├── SparkBalance.tsx
│   │   ├── UpgradeModal.tsx
│   │   ├── LockedFeature.tsx
│   │   └── RegenerationBadge.tsx
│   └── Watermark.tsx
└── app/
    ├── (auth)/
    │   ├── layout.tsx
    │   ├── login/page.tsx
    │   └── signup/page.tsx
    ├── api/regenerate/route.ts
    └── middleware.ts
```

### Arquivos Modificados
- `/api/generate-content/route.ts` - auth + sparks + generation_session
- `/api/generate-image/route.ts` - auth + sparks + regen validation
- `/api/compose-post/route.ts` - download HD sem marca d'água
- `components/preview/PostPreview.tsx` - baixa resolução + watermark
- `package.json` - dependências Supabase

---

## Dependências

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Ordem de Execução

1. **Sprint 1**: Fase 1 + Fase 2 (Infraestrutura + Auth) - ~4h
2. **Sprint 2**: Fase 3 (Sparks Service + Regeneration) - ~3h
3. **Sprint 3**: Fase 4 (Fidelity Guard) - ~3h
4. **Sprint 4**: Fase 5 + 6 (API Guards + UI) - ~4h
5. **Sprint 5**: Fase 7 (Testes) - ~2h

**Estimativa Total**: ~16h de desenvolvimento
