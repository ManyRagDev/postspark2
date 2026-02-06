-- ============================================================
-- POSTSPARK - PARTE 4: FUNÇÕES RPC
-- Execute após a Parte 3
-- ============================================================

-- Função para debitar sparks
CREATE OR REPLACE FUNCTION postspark.debit_sparks(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_generation_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_sparks INTEGER;
BEGIN
  SELECT sparks INTO current_sparks
  FROM postspark.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF current_sparks < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE postspark.profiles
  SET sparks = sparks - p_amount
  WHERE id = p_user_id;

  INSERT INTO postspark.spark_transactions (user_id, type, amount, description, generation_id, metadata)
  VALUES (p_user_id, 'DEBIT', p_amount, p_description, p_generation_id, p_metadata);

  RETURN TRUE;
END;
$$;

-- Função para creditar sparks
CREATE OR REPLACE FUNCTION postspark.credit_sparks(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_generation_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE postspark.profiles
  SET sparks = sparks + p_amount
  WHERE id = p_user_id;

  INSERT INTO postspark.spark_transactions (user_id, type, amount, description, generation_id, metadata)
  VALUES (p_user_id, 'CREDIT', p_amount, p_description, p_generation_id, p_metadata);
END;
$$;

-- Função para usar regeneração
CREATE OR REPLACE FUNCTION postspark.use_regeneration(
  p_generation_id UUID,
  p_user_id UUID,
  p_regen_type TEXT,
  OUT success BOOLEAN,
  OUT already_used BOOLEAN,
  OUT cost INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  sparks_cost INTEGER := 0;
BEGIN
  success := FALSE;
  already_used := FALSE;
  cost := 0;

  SELECT * INTO session_record
  FROM postspark.generation_sessions
  WHERE id = p_generation_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF session_record.status != 'ACTIVE' OR session_record.expires_at < NOW() THEN
    RETURN;
  END IF;

  IF p_regen_type = 'basic' THEN
    sparks_cost := 2;
  ELSIF p_regen_type = 'pollinations' THEN
    sparks_cost := 0;
  ELSE
    RETURN;
  END IF;

  IF (session_record.has_used_regen_basic AND p_regen_type = 'basic') OR
     (session_record.has_used_regen_pollinations AND p_regen_type = 'pollinations') THEN
    already_used := TRUE;
    RETURN;
  END IF;

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
$$;

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION postspark.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE postspark.generation_sessions
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE' AND expires_at < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Função para recarga mensal
CREATE OR REPLACE FUNCTION postspark.refill_monthly_sparks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    CASE user_record.plan
      WHEN 'LITE' THEN refill_amount := 300;
      WHEN 'PRO' THEN refill_amount := 1500;
      WHEN 'AGENCY' THEN refill_amount := 5000;
    END CASE;

    PERFORM postspark.credit_sparks(
      user_record.id,
      refill_amount,
      'Recarga mensal do plano ' || user_record.plan
    );

    UPDATE postspark.profiles
    SET sparks_refill_date = NOW() + INTERVAL '1 month'
    WHERE id = user_record.id;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$;
