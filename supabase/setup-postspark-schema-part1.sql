-- ============================================================
-- POSTSPARK - PARTE 1: SCHEMA E TABELAS
-- Execute primeiro no SQL Editor do Supabase
-- ============================================================

-- Criar schema
CREATE SCHEMA IF NOT EXISTS postspark;

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis dos usuários
CREATE TABLE IF NOT EXISTS postspark.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'LITE', 'PRO', 'AGENCY', 'DEV')),
  sparks INTEGER DEFAULT 50 CHECK (sparks >= 0),
  sparks_refill_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de transações
CREATE TABLE IF NOT EXISTS postspark.spark_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES postspark.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('DEBIT', 'CREDIT', 'REFUND', 'REFILL')) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  generation_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sessões de geração
CREATE TABLE IF NOT EXISTS postspark.generation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES postspark.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_hash TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  original_sparks_used INTEGER NOT NULL,
  generation_type TEXT CHECK (generation_type IN ('STATIC_POST', 'POLLINATIONS', 'NANO_BANANA', 'CAROUSEL')) NOT NULL,
  has_used_regen_basic BOOLEAN DEFAULT FALSE,
  has_used_regen_pollinations BOOLEAN DEFAULT FALSE,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMPTZ
);

-- Tabela de rate limiting
CREATE TABLE IF NOT EXISTS postspark.rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES postspark.profiles(id) ON DELETE CASCADE,
  ip_address INET,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action, window_start),
  UNIQUE(ip_address, action, window_start)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON postspark.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_spark_transactions_user_id ON postspark.spark_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_transactions_created_at ON postspark.spark_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_user_id ON postspark.generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON postspark.generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_expires_at ON postspark.generation_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_idempotency ON postspark.generation_sessions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON postspark.rate_limits(user_id, action, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON postspark.rate_limits(ip_address, action, window_start);

-- Habilitar RLS
ALTER TABLE postspark.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE postspark.spark_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE postspark.generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE postspark.rate_limits ENABLE ROW LEVEL SECURITY;
