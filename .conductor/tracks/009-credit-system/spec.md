# TRACK-009: Sistema de Créditos (Sparks)

## Objetivo
Implementar o sistema de monetização do PostSpark baseado em **Sparks** (créditos), com proteção contra abuso (print-screen) através do modelo "Fidelity Guard".

---

## Planos e Limites

| Plano | Preço | Sparks | Motores Disponíveis | Formatos | Extras |
|-------|-------|--------|---------------------|----------|--------|
| **FREE** | $0 | 50 (única vez) | Smart Match | 1:1 | Marca d'água obstrutiva |
| **LITE** | $19/mês | 300/mês | Smart Match + Pollinations | Todos | Preview limpo, download HD |
| **PRO** | $79/mês | 1.500/mês | Smart Match + Pollinations + Nano Banana Pro | Todos | Carrosséis IA, SEO 2026 |
| **AGENCY** | $249/mês | 5.000/mês | Tudo do PRO | Todos | Brand Kits ilimitados |

---

## Modelo "Fidelity Guard"

> **Princípio**: Cobrar na **criação** (quando as APIs trabalham), não no download.

### 1. Taxa de Geração (Faísca Inicial)
O débito acontece quando o usuário clica em **"Criar Post"**:

| Ação | Motor | 1ª Geração | Regenerar |
|------|-------|------------|-----------|
| Post Estático | Gemini + Smart Match | 10 Sparks | 2 Sparks |
| Imagem Express | Pollinations | 25 Sparks | 0 (1ª vez grátis) |
| Design de Luxo | Nano Banana Pro | 80 Sparks | 10 Sparks |
| Carrossel IA | Pipeline Completo | 100 Sparks | 20 Sparks |

### 2. Limite de Regeneração
> ⚠️ **REGRA OBRIGATÓRIA**: Cada tipo de regeneração só pode acontecer **1 vez por post**.  
> Se insatisfeito após a regen, o usuário deve **reiniciar o processo** (nova geração = preço cheio).

**Implementação Anti-Burla:**
- Cada post gerado recebe um `generation_id` único
- Banco rastreia: `{ generation_id, has_used_regen_basic, has_used_regen_pollinations }`
- Servidor valida antes de permitir regeneração
- Mudança drástica de texto (>50% palavras diferentes) = nova geração

### 3. Proteção contra Print-Screen

#### Preview de Baixa Fidelidade
- **Resolução de Amostra**: Preview em 72dpi (vs 300dpi do download)
- **Tamanho Reduzido**: ~400px de largura (vs 1080px real)

#### Marca d'Água por Plano
| Plano | Tipo de Marca d'Água |
|-------|---------------------|
| FREE | **Obstrutiva** - Cobre parte do texto principal |
| LITE/PRO/AGENCY | **Sutil** - Canto inferior, semitransparente |

#### Download = Joia da Coroa
- Resolução final: 1080px a 300dpi (4K-ready)
- Sem marca d'água (exceto FREE que mantém pequena)
- Qualidade de compressão máxima

---

## Regras de Negócio

### 1. Login Obrigatório
- O acesso ao gerador de posts requer autenticação
- Impede abuso de APIs por bots

### 2. Verificação de Saldo
- Antes de qualquer geração, verificar se `user.sparks >= custo`
- Se saldo insuficiente: exibir modal de upgrade

### 3. Conversão de Custo Alto
- Usuário LITE tenta usar Nano Banana Pro → Modal "Venda Flash"
- Opção 1: Comprar pack avulso de 200 Sparks por $9
- Opção 2: Upgrade para PRO

### 4. Renovação de Sparks (Modelo de Acúmulo)
- FREE: 50 sparks únicos, nunca renova
- LITE/PRO/AGENCY: recebe novos Sparks no início de cada ciclo
- **Sparks ACUMULAM**: Não utilizados nunca expiram

---

## Integrações Necessárias

### Supabase
- Auth para login/cadastro
- Database para profiles, sparks, transactions, generation_state
- Row Level Security (RLS) para segurança

### Stripe (Futuro)
- Webhooks para subscription events
- Criação automática de customer no signup

---

## Entregáveis

1. **Database Schema** - Tabelas: profiles, spark_transactions, generation_sessions
2. **Auth Integration** - Supabase Auth com Next.js App Router
3. **Spark Service** - Lógica de débito/crédito/verificação + regeneration tracker
4. **Fidelity Guard** - Preview baixa resolução + marca d'água dinâmica
5. **UI Components** - SparkBalance, UpgradeModal, LockedFeature, RegenerationCounter
6. **API Guards** - Middleware de proteção + validação de regeneração
