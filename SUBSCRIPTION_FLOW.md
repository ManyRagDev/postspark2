# Fluxo de Assinatura - PostSpark 2

## 📋 Visão Geral

Sistema completo de assinatura integrado com Stripe, desde a landing page até a confirmação de pagamento.

---

## 🔄 Jornadas do Usuário

### 1️⃣ Novo Usuário - Assinatura Direta

**Caminho**: Landing → Signup → Checkout → Stripe → Dashboard

1. **Landing Page** (`/`)
   - Usuário navega até seção de Pricing
   - Clica em "Começar Trial" (LITE) ou "Virar PRO"
   - Redireciona para `/signup?plan=LITE` ou `/signup?plan=PRO`

2. **Signup Page** (`/signup?plan=LITE`)
   - Badge visual mostra o plano selecionado
   - Usuário cria conta (email + senha)
   - Recebe email de confirmação
   - Após verificar email, é redirecionado para `/checkout?plan=LITE`

3. **Checkout Page** (`/checkout?plan=LITE`)
   - Verifica autenticação (redireciona para signup se não estiver logado)
   - Mostra detalhes do plano escolhido
   - Toggle mensal/anual com preços
   - Botão "Continuar para Pagamento" chama API `/api/stripe/checkout`
   - Redireciona para Stripe Checkout

4. **Stripe Checkout**
   - Usuário insere dados do cartão
   - Após pagamento bem-sucedido: redireciona para `/dashboard?upgrade=success&plan=LITE`
   - Após cancelamento: redireciona para `/dashboard?upgrade=canceled`

---

### 2️⃣ Usuário Existente - Upgrade no Dashboard

**Caminho**: Dashboard → SparkDropdown → Modal → Checkout → Stripe

1. **Dashboard** (`/dashboard`)
   - Usuário clica no saldo de Sparks (SparkDropdown)
   - Dropdown mostra saldo, plano atual e custos
   - Botão "Fazer Upgrade" abre o UpgradeModal

2. **Upgrade Modal**
   - Comparação de planos (LITE, PRO, AGENCY)
   - Usuário seleciona plano desejado
   - Clica em "Continuar" → redireciona para `/checkout?plan=PRO`

3. **Checkout → Stripe** (mesmo fluxo da jornada 1)

---

### 3️⃣ Usuário Free - Sparks Insuficientes

**Caminho**: Dashboard → Ação Bloqueada → Modal → Checkout

1. **Dashboard - Tentativa de Geração**
   - Usuário tenta gerar conteúdo sem sparks suficientes
   - Componente de bloqueio chama `openUpgrade({ reason: 'insufficient_sparks', requiredSparks: 25 })`

2. **Upgrade Modal**
   - Mostra quanto falta de sparks
   - Opção de compra rápida (Flash Sale) ou upgrade de plano
   - Redireciona para checkout após seleção

---

## 📂 Arquivos Criados/Modificados

### ✨ **Novos Arquivos**

| Arquivo | Descrição |
|---------|-----------|
| [`src/app/checkout/page.tsx`](src/app/checkout/page.tsx) | Página de checkout intermediária antes do Stripe |
| [`src/hooks/useUpgrade.tsx`](src/hooks/useUpgrade.tsx) | Hook para gerenciar modal de upgrade |
| [`src/hooks/index.ts`](src/hooks/index.ts) | Barrel export para hooks |
| `SUBSCRIPTION_FLOW.md` | Esta documentação |

### 🔧 **Arquivos Modificados**

| Arquivo | Mudanças |
|---------|----------|
| [`src/components/landing/sections/PricingSection.tsx`](src/components/landing/sections/PricingSection.tsx) | • Adicionado `ctaLink` para cada plano<br>• CTAs agora preservam plano na URL<br>• Botão AGENCY desabilitado ("Disponível em breve") |
| [`src/app/(auth)/signup/page.tsx`](src/app/(auth)/signup/page.tsx) | • Captura `?plan=LITE` da URL<br>• Badge visual do plano escolhido<br>• Redireciona para checkout após verificação de email<br>• Mensagem personalizada para signup com plano |
| [`src/components/dashboard/DashboardHeader.tsx`](src/components/dashboard/DashboardHeader.tsx) | • Integrado hook `useUpgrade`<br>• Callback `onUpgrade` passado para SparkDropdown<br>• UpgradeModal renderizado |

---

## 🔑 Componentes-Chave

### **SparkDropdown** ([src/components/sparks/SparkDropdown.tsx](src/components/sparks/SparkDropdown.tsx))
- Mostra saldo de sparks
- Indica plano atual
- Botão "Fazer Upgrade" (se não for plano DEV)
- Recebe prop `onUpgrade?: () => void`

### **UpgradeModal** ([src/components/sparks/UpgradeModal.tsx](src/components/sparks/UpgradeModal.tsx))
- Modal reutilizável para upgrade
- Três modos:
  - `insufficient_sparks`: Mostra falta de sparks
  - `feature_locked`: Recurso bloqueado por plano
  - `plan_upgrade_needed`: Upgrade genérico
- Comparação de planos (LITE, PRO, AGENCY)
- Redireciona para `/checkout?plan=XXX`

### **useUpgrade Hook** ([src/hooks/useUpgrade.tsx](src/hooks/useUpgrade.tsx))
```tsx
const { openUpgrade, closeUpgrade, isUpgradeOpen, UpgradeModal } = useUpgrade();

// Exemplo de uso
openUpgrade({
  reason: 'insufficient_sparks',
  requiredSparks: 25
});
```

---

## 🎯 URLs e Query Params

| URL | Query Params | Descrição |
|-----|--------------|-----------|
| `/signup` | `?plan=LITE&redirect=checkout` | Signup com plano pré-selecionado |
| `/checkout` | `?plan=PRO` | Checkout para plano específico |
| `/dashboard` | `?upgrade=success&plan=LITE` | Retorno após pagamento bem-sucedido |
| `/dashboard` | `?upgrade=canceled` | Retorno após cancelamento |

---

## 💳 Integração Stripe

### **Fluxo Técnico**

1. **Frontend** (`/checkout`)
   - Chama `POST /api/stripe/checkout`
   - Body: `{ priceId: "price_xxx" }`

2. **API Route** ([src/app/api/stripe/checkout/route.ts](src/app/api/stripe/checkout/route.ts))
   - Valida autenticação (Supabase)
   - Valida `priceId` (config)
   - Cria sessão de checkout do Stripe
   - Retorna `{ url: "https://checkout.stripe.com/..." }`

3. **Stripe Checkout**
   - Usuário preenche dados de pagamento
   - Success: `${origin}/dashboard?upgrade=success&plan=LITE`
   - Cancel: `${origin}/dashboard?upgrade=canceled`

### **Price IDs** ([src/lib/stripe/config.ts](src/lib/stripe/config.ts))

```ts
export const STRIPE_PRICES = [
  { priceId: 'price_1SxdbxE9QJm1ioJLyfG0x9zw', plan: 'LITE', interval: 'month', amount: 1900 },
  { priceId: 'price_1SxddDE9QJm1ioJLcbzwIwoO', plan: 'LITE', interval: 'year', amount: 19000 },
  { priceId: 'price_1SxdeAE9QJm1ioJL37UEAnRz', plan: 'PRO', interval: 'month', amount: 7900 },
  { priceId: 'price_1SxdeRE9QJm1ioJLgPJ5Pcz6', plan: 'PRO', interval: 'year', amount: 79000 },
];
```

---

## ✅ Status de Implementação

| Feature | Status | Notas |
|---------|--------|-------|
| Landing → Signup com plano | ✅ Completo | Preserva plano na URL |
| Signup → Checkout | ✅ Completo | Redireciona após verificação |
| Checkout Page | ✅ Completo | Toggle anual/mensal, resumo do pedido |
| Stripe Integration | ✅ Completo | API route funcional |
| SparkDropdown → Upgrade | ✅ Completo | Modal integrado |
| UpgradeModal | ✅ Completo | 3 modos de uso |
| useUpgrade Hook | ✅ Completo | Gerencia estado do modal |
| Plan AGENCY | ⏳ Coming Soon | Botão desabilitado |
| Webhooks Stripe | ⚠️ Existente | Em `src/app/api/webhooks/stripe/` |

---

## 🧪 Como Testar

### **Teste 1: Novo Usuário com Plano**
1. Acesse `http://localhost:3000/`
2. Role até seção "Pricing"
3. Clique em "Começar Trial" (LITE)
4. Crie conta no signup
5. Verifique que o badge do plano LITE aparece
6. (Após verificar email) Deve redirecionar para checkout

### **Teste 2: Upgrade no Dashboard**
1. Faça login como usuário FREE
2. Clique no saldo de Sparks no header
3. Clique em "Fazer Upgrade"
4. Selecione plano PRO
5. Verifique redirecionamento para `/checkout?plan=PRO`

### **Teste 3: Checkout Flow**
1. Acesse `/checkout?plan=LITE`
2. Toggle entre mensal/anual
3. Verifique cálculo de preços
4. Clique em "Continuar para Pagamento"
5. Deve redirecionar para Stripe Checkout

---

## 🔐 Segurança

- ✅ Autenticação obrigatória para checkout (Supabase)
- ✅ Validação de `priceId` no backend
- ✅ HTTPS obrigatório para Stripe
- ✅ Metadata do usuário preservada (`userId`, `userEmail`)

---

## 🎨 Design Considerations

- **Consistência visual**: Mesmos gradientes e cores da landing
- **Responsividade**: Mobile-first design
- **Feedback visual**: Loading states, badges de plano
- **Acessibilidade**: Foco visível, ARIA labels

---

## 🚀 Próximos Passos

- [ ] Implementar webhook handler completo (já existe estrutura)
- [ ] Adicionar analytics (track conversions)
- [ ] A/B test: mostrar sparks necessários vs. features desbloqueadas
- [ ] Página de sucesso pós-pagamento personalizada
- [ ] Plano AGENCY (contato comercial)
- [ ] Cupons de desconto (Stripe Checkout já suporta)

---

## 📝 Notas de Desenvolvimento

### **Variáveis de Ambiente Necessárias**

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### **TypeScript Types**

```ts
type UserPlan = 'FREE' | 'LITE' | 'PRO' | 'AGENCY' | 'DEV';
type BillingInterval = 'month' | 'year';

interface StripePriceConfig {
  priceId: string;
  plan: UserPlan;
  interval: BillingInterval;
  amount: number; // in cents (BRL)
}
```

---

**Última Atualização**: 2026-02-06
**Versão**: 1.0
