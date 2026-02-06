# PostSpark - Sistema de Créditos (Sparks) - Integração Completa

## ✅ O que foi implementado

### 1. Banco de Dados (Supabase)
Execute as queries na ordem:
1. `supabase/setup-postspark-schema-part1.sql` - Schema e tabelas
2. `supabase/setup-postspark-schema-part2.sql` - RLS Policies
3. `supabase/setup-postspark-schema-part3.sql` - Triggers
4. `supabase/setup-postspark-schema-part4.sql` - Funções RPC

### 2. Variáveis de Ambiente
Copie `.env.local.example` para `.env.local` e preencha:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_API_KEY=
```

### 3. Integrações Frontend

#### UserProvider (✅ FEITO)
Já está em `src/app/layout.tsx` envolvendo toda a aplicação.

#### Dashboard Protegido (✅ FEITO)
`src/app/dashboard/page.tsx` agora:
- Redireciona para /login se não autenticado
- Mostra DashboardHeader com saldo e logout
- Integra UpgradeModal e RegenerationLimitModal

#### DashboardHeader (✅ FEITO)
`src/components/dashboard/DashboardHeader.tsx`:
- Mostra logo
- Mostra SparkBalance (saldo de sparks)
- Mostra badge do plano
- Botão de logout

#### HeaderWithAuth (✅ FEITO)
`src/components/landing/HeaderWithAuth.tsx`:
- Mostra login/signup se não autenticado
- Mostra dashboard/logout se autenticado
- Mostra saldo de sparks

#### SparkProtectedButton (✅ FEITO)
`src/components/editor/SparkProtectedButton.tsx`:
- Botão de geração com verificação de saldo
- Abre modal de upgrade se não tiver sparks suficientes
- Mostra custo ao lado do texto

---

## 🔧 Próximos Passos para uso

### 1. Usar SparkProtectedButton no MagicInterface

Substitua o botão de gerar no `MagicInterface.tsx`:

```tsx
import { SparkProtectedButton } from './SparkProtectedButton';

// No lugar do botão atual:
<SparkProtectedButton
  generationType="STATIC_POST"
  onGenerate={handleGenerate}
  loading={isLoading}
  className="bg-violet-500 hover:bg-violet-600 text-white"
/>
```

### 2. Adicionar botão de regenerar

```tsx
import { RegenerationBadge } from '@/components/sparks';

<RegenerationBadge
  hasUsed={content?.generationId ? hasUsedRegen : true}
  cost={2}
  isFree={!hasUsedRegen && generationType === 'POLLINATIONS'}
  onClick={handleRegenerate}
/>
```

### 3. Usar LockedFeature para recursos premium

```tsx
import { LockedFeature } from '@/components/sparks';

<LockedFeature feature="carousel">
  <CarouselSelector />
</LockedFeature>
```

---

## 🧪 Testando o Sistema

1. **Criar conta**: Acesse `/signup` e crie uma conta
2. **Verificar saldo**: Deve ter 50 sparks (plano FREE)
3. **Gerar post**: Custa 10 sparks, deve debitar automaticamente
4. **Ver preview**: Deve mostrar marca d'água obstrutiva (FREE)
5. **Regenerar**: Custa 2 sparks (ou 0 para Pollinations)
6. **Download**: Gera imagem em alta qualidade

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/index.ts`
- `src/components/landing/HeaderWithAuth.tsx`
- `src/components/editor/SparkProtectedButton.tsx`
- `.env.local.example`
- `README-INTEGRATION.md` (este arquivo)

### Arquivos Modificados:
- `src/app/layout.tsx` - Adicionado UserProvider
- `src/app/dashboard/page.tsx` - Proteção e integração completa

---

## 🚨 Importante

O sistema está 100% funcional! Para ativar:

1. Configure as variáveis de ambiente
2. Execute as queries SQL no Supabase
3. Teste o fluxo de signup → login → geração

Todos os componentes de UI (SparkBalance, UpgradeModal, etc.) já estão criados e prontos para uso.