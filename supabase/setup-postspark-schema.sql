-- ============================================================
-- POSTSPARK - SETUP DO SISTEMA DE CRÉDITOS (SCHEMA: postspark)
-- Execute todas estas queries no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- 1. CRIAR SCHEMA
-- ============================================================

CREATE SCHEMA IF NOT EXISTS postspark;

-- ============================================================
-- 2. EXTENSÕES NECESSÁRIAS (no schema public ou específico)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 3. TABELAS PRINCIPAIS (schema postspark)
-- ============================================================

-- Tabela de perfis dos usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS postspark.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'LITE', 'PRO', 'AGENCY', 'DEV')),
  sparks INTEGER DEFAULT 50 CHECK (sparks >= 0),
  sparks_refill_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de transações de sparks
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

-- Tabela de sessões de geração (rastreia regenerações)
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

-- ============================================================
-- 4. ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON postspark.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_spark_transactions_user_id ON postspark.spark_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_transactions_created_at ON postspark.spark_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_user_id ON postspark.generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON postspark.generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_expires_at ON postspark.generation_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_idempotency ON postspark.generation_sessions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON postspark.rate_limits(user_id, action, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON postspark.rate_limits(ip_address, action, window_start);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE postspark.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE postspark.spark_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE postspark.generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE postspark.rate_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
  ON postspark.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON postspark.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON postspark.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para spark_transactions
CREATE POLICY "Users can view own transactions"
  ON postspark.spark_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create transactions"
  ON postspark.spark_transactions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para generation_sessions
CREATE POLICY "Users can view own generation sessions"
  ON postspark.generation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage generation sessions"
  ON postspark.generation_sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para rate_limits (apenas service role)
CREATE POLICY "Service role can manage rate limits"
  ON postspark.rate_limits FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 6. FUNÇÕES E TRIGGERS (schema postspark)
-- ============================================================

-- Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION postspark.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO postspark.profiles (id, email, plan, sparks)
  VALUES (
    NEW.id,
    NEW.email,
    'FREE',
    50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil após inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION postspark.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION postspark.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at em profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON postspark.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON postspark.profiles
  FOR EACH ROW
  EXECUTE FUNCTION postspark.update_updated_at_column();

-- Função para debitar sparks atomicamente
CREATE OR REPLACE FUNCTION postspark.debit_sparks(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_generation_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_sparks INTEGER;
BEGIN
  -- Obter sparks atuais com row lock
  SELECT sparks INTO current_sparks
  FROM postspark.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Verificar se usuário tem sparks suficientes
  IF current_sparks < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Debitar sparks
  UPDATE postspark.profiles
  SET sparks = sparks - p_amount
  WHERE id = p_user_id;

  -- Registrar transação
  INSERT INTO postspark.spark_transactions (user_id, type, amount, description, generation_id, metadata)
  VALUES (p_user_id, 'DEBIT', p_amount, p_description, p_generation_id, p_metadata);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para creditar sparks
CREATE OR REPLACE FUNCTION postspark.credit_sparks(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_generation_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  -- Creditar sparks
  UPDATE postspark.profiles
  SET sparks = sparks + p_amount
  WHERE id = p_user_id;

  -- Registrar transação
  INSERT INTO postspark.spark_transactions (user_id, type, amount, description, generation_id, metadata)
  VALUES (p_user_id, 'CREDIT', p_amount, p_description, p_generation_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para usar regeneração
CREATE OR REPLACE FUNCTION postspark.use_regeneration(
  p_generation_id UUID,
  p_user_id UUID,
  p_regen_type TEXT,
  OUT success BOOLEAN,
  OUT already_used BOOLEAN,
  OUT cost INTEGER
)
RETURNS RECORD AS $$
DECLARE
  session_record postspark.generation_sessions%ROWTYPE;
  sparks_cost INTEGER := 0;
BEGIN
  success := FALSE;
  already_used := FALSE;
  cost := 0;

  -- Obter sessão com lock
  SELECT * INTO session_record
  FROM postspark.generation_sessions
  WHERE id = p_generation_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Verificar se sessão está ativa
  IF session_record.status != 'ACTIVE' OR session_record.expires_at < NOW() THEN
    RETURN;
  END IF;

  -- Definir custo baseado no tipo
  IF p_regen_type = 'basic' THEN
    sparks_cost := 2;
  ELSIF p_regen_type = 'pollinations' THEN
    sparks_cost := 0; -- Primeira é grátis
  ELSE
    RETURN;
  END IF;

  -- Verificar se já foi usada
  IF (session_record.has_used_regen_basic AND p_regen_type = 'basic') OR
     (session_record.has_used_regen_pollinations AND p_regen_type = 'pollinations') THEN
    already_used := TRUE;
    RETURN;
  END IF;

  -- Marcar regeneração como usada
  IF p_regen_type = 'basic' THEN
    UPDATE postspark.generation_sessions
    SET has_used_regen_basic = TRUE
    WHERE id = p_generation_id;
  ELSE
    UPDATE postspark.generation_sessions
    SET has_used_regen_pollinations = TRUE
    WHERE id = p_generation_id;
  END IF;

  success := TRUE;
  cost := sparks_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION postspark.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE postspark.generation_sessions
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE' AND expires_at < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para recarga mensal de sparks
CREATE OR REPLACE FUNCTION postspark.refill_monthly_sparks()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  user_record RECORD;
  refill_amount INTEGER;
BEGIN
  FOR user_record IN
    SELECT id, plan, sparks_refill_date
    FROM postspark.profiles
    WHERE plan IN ('LITE', 'PRO', 'AGENCY')
      AND (sparks_refill_date IS NULL OR sparks_refill_date < NOW())
  LOOP
    -- Definir quantidade baseada no plano
    CASE user_record.plan
      WHEN 'LITE' THEN refill_amount := 300;
      WHEN 'PRO' THEN refill_amount := 1500;
      WHEN 'AGENCY' THEN refill_amount := 5000;
    END CASE;

    -- Creditar sparks
    PERFORM postspark.credit_sparks(
      user_record.id,
      refill_amount,
      'Recarga mensal do plano ' || user_record.plan
    );

    -- Atualizar data de recarga
    UPDATE postspark.profiles
    SET sparks_refill_date = NOW() + INTERVAL '1 month'
    WHERE id = user_record.id;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. COMENTÁRIOS DOCUMENTAIS
-- ============================================================

COMMENT ON TABLE postspark.profiles IS 'Perfis de usuários estendendo auth.users com plano e saldo de sparks';
COMMENT ON TABLE postspark.spark_transactions IS 'Histórico de todas as transações de débito/crédito de sparks';
COMMENT ON TABLE postspark.generation_sessions IS 'Rastreia tentativas de geração e uso de regenerações por post';
COMMENT ON TABLE postspark.rate_limits IS 'Dados de rate limiting para proteção da API';
COMMENT ON FUNCTION postspark.debit_sparks IS 'Debita sparks do saldo do usuário atomicamente se houver saldo suficiente';
COMMENT ON FUNCTION postspark.use_regeneration IS 'Verifica e marca regeneração como usada para uma sessão de geração';
COMMENT ON FUNCTION postspark.refill_monthly_sparks IS 'Recarrega sparks mensais para usuários de planos pagos';

-- ============================================================
-- 8. VERIFICAÇÃO DE INSTALAÇÃO
-- ============================================================

-- Execute estas queries para verificar:

-- Verificar schema e tabelas:
-- SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'postspark';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'postspark';

-- Verificar funções:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'postspark' AND routine_type = 'FUNCTION';

-- Verificar políticas RLS:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'postspark';

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
