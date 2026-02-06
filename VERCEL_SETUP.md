# 🚀 Configuração do Vercel - PostSpark 2

## 📋 Passo a Passo

### 1. Importar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com/)
2. Clique em **"Add New Project"**
3. Importe o repositório do GitHub
4. **NÃO deploy ainda** - primeiro configure as variáveis

---

### 2. Configurar Variáveis de Ambiente

Vá em: **Project Settings** → **Environment Variables**

#### ✅ **Variáveis Obrigatórias**

Copie e cole cada variável abaixo:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Google Gemini
GOOGLE_API_KEY

# App URL
NEXT_PUBLIC_APP_URL

# Node Env
NODE_ENV
```

#### 📝 **Como Obter os Valores**

**Supabase**:
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em: **Project Settings** → **API**
3. Copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (⚠️ secreto) → `SUPABASE_SERVICE_ROLE_KEY`

**Stripe**:
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Modo Live** (não test!)
3. Vá em: **Developers** → **API Keys**
4. Copie:
   - `Secret key` → `STRIPE_SECRET_KEY`
5. Vá em: **Developers** → **Webhooks**
6. Adicione endpoint: `https://seu-app.vercel.app/api/webhooks/stripe`
7. Copie o `Signing secret` → `STRIPE_WEBHOOK_SECRET`

**Google Gemini**:
1. Acesse [AI Studio](https://aistudio.google.com/app/apikey)
2. Crie uma API Key
3. Copie → `GOOGLE_API_KEY`

**App URL**:
- Após deploy inicial: `https://seu-app.vercel.app`
- Ou use domínio customizado

**Node Env**:
- Sempre: `production`

---

### 3. Configurar Ambientes no Vercel

Para cada variável, selecione:
- ✅ **Production**
- ⬜ Preview (opcional)
- ⬜ Development (opcional)

---

### 4. Deploy

Após adicionar todas as variáveis:

1. Vá em **Deployments** → **Redeploy**
2. Ou faça um novo commit no GitHub

O build deve passar agora! ✅

---

## 🔍 Verificação Pós-Deploy

### **1. Teste a Aplicação**

Acesse: `https://seu-app.vercel.app`

- [ ] Landing page carrega
- [ ] Signup funciona
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Logout funciona

### **2. Teste Stripe Webhook**

No [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

1. Clique no webhook criado
2. Vá em **"Test webhook"**
3. Envie evento `checkout.session.completed`
4. Verifique se retorna **200 OK**

### **3. Verifique Logs**

No Vercel:
- **Deployments** → Último deploy → **Function Logs**
- Procure por erros 5xx

No Stripe:
- **Webhooks** → Seu endpoint → **Logs**
- Status deve estar verde ✅

---

## 🐛 Troubleshooting

### **Erro: "STRIPE_SECRET_KEY is not set"**

✅ **Solução**:
1. Vá em Vercel → Project Settings → Environment Variables
2. Adicione `STRIPE_SECRET_KEY` com valor `sk_live_xxx`
3. **Importante**: Selecione ambiente "Production"
4. Redeploy

### **Erro: "SUPABASE_SERVICE_ROLE_KEY is not set"**

✅ **Solução**:
1. Vá em Supabase → Project Settings → API
2. Copie `service_role` key (não confunda com `anon`)
3. Adicione no Vercel como `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy

### **Webhook retorna 401 ou 403**

✅ **Solução**:
1. Verifique `STRIPE_WEBHOOK_SECRET` no Vercel
2. Confirme que o endpoint no Stripe está correto
3. Teste com Stripe CLI:
   ```bash
   stripe listen --forward-to https://seu-app.vercel.app/api/webhooks/stripe
   ```

### **Build passa mas app não funciona**

✅ **Checklist**:
- [ ] Todas as 8 variáveis estão configuradas
- [ ] Stripe está em modo **LIVE** (não test)
- [ ] `NEXT_PUBLIC_APP_URL` aponta para Vercel
- [ ] Webhook do Stripe configurado

---

## 📊 Variáveis Finais (Resumo)

| Variável | Obrigatório | Exemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `eyJhbGc...` (secreto) |
| `STRIPE_SECRET_KEY` | ✅ | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_xxx` |
| `GOOGLE_API_KEY` | ✅ | `AIza...` |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://seu-app.vercel.app` |
| `NODE_ENV` | ✅ | `production` |
| `POLLINATIONS_API_KEY` | ⬜ | (opcional) |

---

## 🎯 Checklist Final

Antes de considerar deploy completo:

- [ ] ✅ Todas as 8 variáveis obrigatórias configuradas
- [ ] ✅ Build passa sem erros
- [ ] ✅ App carrega em produção
- [ ] ✅ Signup e login funcionam
- [ ] ✅ Stripe webhook retorna 200
- [ ] ✅ Checkout redireciona para Stripe
- [ ] ✅ Após pagamento, usuário é creditado

---

**Última Atualização**: 2026-02-06
**Versão**: 1.0
