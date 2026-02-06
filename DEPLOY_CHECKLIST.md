# 🚀 Checklist de Deploy - PostSpark 2

## ✅ Pré-requisitos

### 1. Contas e Serviços Configurados
- [ ] **Supabase** - Projeto criado e database schema configurado
- [ ] **Stripe** - Conta criada e configurada (Test ou Live)
- [ ] **Hostinger** (ou provedor de hospedagem) - Conta ativa
- [ ] **Domínio** - DNS configurado (opcional)

---

## 🔐 Variáveis de Ambiente

### **Obrigatórias**

Copie `.env.local.example` para `.env.local` no servidor e configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ NUNCA exponha publicamente

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx  # Use sk_test_xxx para testes
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Google Gemini
GOOGLE_API_KEY=AIza...

# App URL (ajuste para produção)
NEXT_PUBLIC_APP_URL=https://postspark.com.br
```

### **Variáveis Opcionais**

```env
# Pollinations (geração de imagens alternativa)
POLLINATIONS_API_KEY=opcional
```

---

## 🎨 Configuração do Stripe

### **1. Criar Produtos e Preços**

No [Stripe Dashboard](https://dashboard.stripe.com/products):

1. **Produto: PostSpark LITE**
   - Preço Mensal: R$ 19,00 (interval: `month`)
   - Preço Anual: R$ 15,00/mês (interval: `year`)
   - Copie os `price_id` gerados

2. **Produto: PostSpark PRO**
   - Preço Mensal: R$ 79,00 (interval: `month`)
   - Preço Anual: R$ 63,00/mês (interval: `year`)
   - Copie os `price_id` gerados

### **2. Atualizar Price IDs no Código**

Edite [`src/lib/stripe/config.ts`](src/lib/stripe/config.ts):

```ts
export const STRIPE_PRICES: StripePriceConfig[] = [
  // LITE Plan
  { priceId: 'price_SEU_ID_LITE_MENSAL', plan: 'LITE', interval: 'month', amount: 1900 },
  { priceId: 'price_SEU_ID_LITE_ANUAL', plan: 'LITE', interval: 'year', amount: 19000 },
  // PRO Plan
  { priceId: 'price_SEU_ID_PRO_MENSAL', plan: 'PRO', interval: 'month', amount: 7900 },
  { priceId: 'price_SEU_ID_PRO_ANUAL', plan: 'PRO', interval: 'year', amount: 79000 },
];
```

### **3. Configurar Webhook**

No [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

1. **Adicionar endpoint**:
   ```
   https://seu-dominio.com/api/webhooks/stripe
   ```

2. **Selecionar eventos**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

3. **Copiar signing secret** (`whsec_xxx`) para `.env.local`

---

## 🗄️ Configuração do Supabase

### **1. Schema do Banco de Dados**

Execute no SQL Editor do Supabase:

```sql
-- Criar schema postspark
CREATE SCHEMA IF NOT EXISTS postspark;

-- Tabela de usuários (profiles)
CREATE TABLE IF NOT EXISTS postspark.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'LITE', 'PRO', 'AGENCY', 'DEV')),
  sparks INTEGER DEFAULT 50,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  next_refill_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_stripe_customer ON postspark.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_email ON postspark.profiles(email);

-- RLS (Row Level Security)
ALTER TABLE postspark.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ler seus próprios dados
CREATE POLICY "Users can read own profile"
  ON postspark.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own profile"
  ON postspark.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### **2. Trigger para Criar Profile Automaticamente**

```sql
-- Function para criar profile ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO postspark.profiles (id, email, plan, sparks)
  VALUES (
    NEW.id,
    NEW.email,
    'FREE',
    50  -- 50 sparks iniciais
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 📦 Build e Deploy

### **1. Teste Local**

```bash
# Instalar dependências
npm install

# Build de produção local
npm run build

# Testar build
npm start

# Verificar:
# - Páginas carregam sem erros
# - Checkout funciona
# - Logout funciona
# - Stripe redirect funciona
```

### **2. Deploy para Hostinger (Standalone)**

O projeto está configurado para `output: 'standalone'` no `next.config.ts`.

```bash
# Build standalone
npm run build

# Arquivos gerados em:
# - .next/standalone/
# - .next/static/
# - public/

# Upload via FTP/SSH:
# - .next/standalone/ → /
# - .next/static/ → .next/static/
# - public/ → public/
```

### **3. Configurar Servidor**

**Node.js Version**: 18.x ou superior

**Start Command**:
```bash
node server.js
```

**Variáveis de Ambiente**: Adicionar todas as vars do checklist acima

---

## 🔒 Segurança - Revisão Final

### **Antes de Deploy**

- [ ] ✅ `STRIPE_SECRET_KEY` está em variável de ambiente (NUNCA no código)
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` está em variável de ambiente
- [ ] ✅ Webhook signature está sendo validada ([route.ts:37](src/app/api/webhooks/stripe/route.ts#L37))
- [ ] ✅ Middleware protege rotas privadas ([middleware.ts:76](middleware.ts#L76))
- [ ] ✅ RLS (Row Level Security) habilitado no Supabase
- [ ] ✅ CORS configurado corretamente
- [ ] ✅ HTTPS habilitado (obrigatório para Stripe)

### **Arquivos que NÃO devem ir para produção**

```
.env.local          # ⚠️ Nunca commitar
.env.local.example  # OK - é exemplo
node_modules/       # Ignorado pelo .gitignore
```

---

## 🧪 Testes em Produção

### **1. Fluxo de Signup + Checkout**

- [ ] Criar conta FREE em `/signup`
- [ ] Receber email de confirmação
- [ ] Verificar 50 sparks iniciais no dashboard
- [ ] Clicar em "Fazer Upgrade"
- [ ] Selecionar plano LITE
- [ ] Redirecionar para `/checkout?plan=LITE`
- [ ] Completar pagamento no Stripe (use cartão de teste: `4242 4242 4242 4242`)
- [ ] Verificar redirect para `/dashboard?upgrade=success&plan=LITE`
- [ ] Confirmar upgrade de plano e crédito de sparks

### **2. Webhook do Stripe**

No [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

- [ ] Verificar se webhook está recebendo eventos
- [ ] Status: ✅ (verde)
- [ ] Nenhum erro 4xx ou 5xx
- [ ] Logs mostram processamento correto

Teste manual:
```bash
# Usar Stripe CLI para teste local
stripe listen --forward-to https://seu-dominio.com/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### **3. Logout**

- [ ] Clicar em "Sair" no dashboard
- [ ] Spinner aparece ("Saindo...")
- [ ] Redireciona para `/` (landing page)
- [ ] Usuário deslogado (não consegue acessar `/dashboard`)

---

## 📊 Monitoramento Pós-Deploy

### **Logs a Observar**

**Supabase Logs** (Authentication):
- Novos signups
- Login attempts
- Token refresh

**Stripe Dashboard** (Payments):
- Successful charges
- Failed payments
- Subscription changes

**Server Logs** (Application):
```bash
# Buscar por erros
grep "ERROR" /var/log/app.log

# Webhook processing
grep "[Webhook]" /var/log/app.log
```

---

## 🆘 Troubleshooting

### **Erro: "Invalid signature" no webhook**

✅ **Solução**:
- Verificar `STRIPE_WEBHOOK_SECRET` está correto
- Conferir URL do webhook no Stripe Dashboard

### **Erro: "Unauthorized" no checkout**

✅ **Solução**:
- Usuário deve estar logado
- Verificar session do Supabase
- Confirmar middleware está ativo

### **Erro: "Webhook handler failed"**

✅ **Solução**:
- Verificar logs do servidor
- Confirmar `SUPABASE_SERVICE_ROLE_KEY` está configurado
- Testar manualmente funções do Supabase

### **Logout não funciona**

✅ **Solução**:
- Verificar console do navegador (F12)
- Logs devem mostrar: 🔓 → 📤 → ✅ → 🏠
- Se timeout (⏰), aumentar de 3s para 5s

---

## ✅ Checklist Final

Antes de marcar como "Produção pronta":

- [ ] ✅ Todas as variáveis de ambiente configuradas
- [ ] ✅ Stripe em modo **LIVE** (não test)
- [ ] ✅ Webhook do Stripe funcionando
- [ ] ✅ Supabase database schema criado
- [ ] ✅ RLS policies ativas
- [ ] ✅ Build standalone gerado sem erros
- [ ] ✅ Teste de signup → checkout → pagamento completo
- [ ] ✅ Teste de logout
- [ ] ✅ HTTPS ativo
- [ ] ✅ DNS configurado (se usar domínio próprio)
- [ ] ✅ Monitoramento configurado (opcional: Sentry, LogRocket)

---

## 📞 Suporte

**Documentação**:
- [SUBSCRIPTION_FLOW.md](SUBSCRIPTION_FLOW.md) - Fluxo detalhado de assinatura
- [README-INTEGRATION.md](README-INTEGRATION.md) - Integrações e APIs

**Links Úteis**:
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

---

**Última Atualização**: 2026-02-06
**Versão**: 1.0
**Status**: ✅ Pronto para Deploy
