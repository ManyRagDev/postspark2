-- ============================================================
-- PostSpark Credit System (Sparks) - Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'LITE', 'PRO', 'AGENCY', 'DEV')),
  sparks INTEGER DEFAULT 50 CHECK (sparks >= 0),
  sparks_refill_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spark transactions history
CREATE TABLE IF NOT EXISTS spark_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('DEBIT', 'CREDIT', 'REFUND', 'REFILL')) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  generation_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generation sessions for tracking regenerations
CREATE TABLE IF NOT EXISTS generation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action, window_start),
  UNIQUE(ip_address, action, window_start)
);

-- ============================================================
-- Indexes for Performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_spark_transactions_user_id ON spark_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_transactions_created_at ON spark_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_user_id ON generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_expires_at ON generation_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_idempotency ON generation_sessions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON rate_limits(ip_address, action, window_start);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can manage all profiles
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Spark transactions policies
CREATE POLICY "Users can view own transactions"
  ON spark_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create transactions"
  ON spark_transactions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Generation sessions policies
CREATE POLICY "Users can view own generation sessions"
  ON generation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage generation sessions"
  ON generation_sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Rate limits policies (service only)
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, plan, sparks)
  VALUES (
    NEW.id,
    NEW.email,
    'FREE',
    50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to debit sparks atomically
CREATE OR REPLACE FUNCTION debit_sparks(
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
  -- Get current sparks with row lock
  SELECT sparks INTO current_sparks
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user has enough sparks
  IF current_sparks < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Debit sparks
  UPDATE profiles
  SET sparks = sparks - p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO spark_transactions (user_id, type, amount, description, generation_id, metadata)
  VALUES (p_user_id, 'DEBIT', p_amount, p_description, p_generation_id, p_metadata);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to credit sparks
CREATE OR REPLACE FUNCTION credit_sparks(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_generation_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  -- Credit sparks
  UPDATE profiles
  SET sparks = sparks + p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO spark_transactions (user_id, type, amount, description, generation_id, metadata)
  VALUES (p_user_id, 'CREDIT', p_amount, p_description, p_generation_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and use regeneration
CREATE OR REPLACE FUNCTION use_regeneration(
  p_generation_id UUID,
  p_user_id UUID,
  p_regen_type TEXT, -- 'basic' or 'pollinations'
  OUT success BOOLEAN,
  OUT already_used BOOLEAN,
  OUT cost INTEGER
)
RETURNS RECORD AS $$
DECLARE
  session_record generation_sessions%ROWTYPE;
  sparks_cost INTEGER := 0;
  regen_field TEXT;
BEGIN
  success := FALSE;
  already_used := FALSE;
  cost := 0;

  -- Get session with lock
  SELECT * INTO session_record
  FROM generation_sessions
  WHERE id = p_generation_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check if session is still active
  IF session_record.status != 'ACTIVE' OR session_record.expires_at < NOW() THEN
    RETURN;
  END IF;

  -- Determine regeneration field and cost
  IF p_regen_type = 'basic' THEN
    regen_field := 'has_used_regen_basic';
    sparks_cost := 2;
  ELSIF p_regen_type = 'pollinations' THEN
    regen_field := 'has_used_regen_pollinations';
    sparks_cost := 0; -- First one is free
  ELSE
    RETURN;
  END IF;

  -- Check if already used
  IF (session_record.has_used_regen_basic AND p_regen_type = 'basic') OR
     (session_record.has_used_regen_pollinations AND p_regen_type = 'pollinations') THEN
    already_used := TRUE;
    RETURN;
  END IF;

  -- Mark regeneration as used
  IF p_regen_type = 'basic' THEN
    UPDATE generation_sessions
    SET has_used_regen_basic = TRUE
    WHERE id = p_generation_id;
  ELSE
    UPDATE generation_sessions
    SET has_used_regen_pollinations = TRUE
    WHERE id = p_generation_id;
  END IF;

  success := TRUE;
  cost := sparks_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE generation_sessions
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE' AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refill monthly sparks for paid plans
CREATE OR REPLACE FUNCTION refill_monthly_sparks()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT id, plan, sparks_refill_date
    FROM profiles
    WHERE plan IN ('LITE', 'PRO', 'AGENCY')
      AND (sparks_refill_date IS NULL OR sparks_refill_date < NOW())
  LOOP
    -- Determine refill amount based on plan
    DECLARE
      refill_amount INTEGER;
    BEGIN
      CASE user_record.plan
        WHEN 'LITE' THEN refill_amount := 300;
        WHEN 'PRO' THEN refill_amount := 1500;
        WHEN 'AGENCY' THEN refill_amount := 5000;
      END CASE;

      -- Credit sparks
      PERFORM credit_sparks(
        user_record.id,
        refill_amount,
        'Monthly refill for ' || user_record.plan || ' plan'
      );

      -- Update refill date
      UPDATE profiles
      SET sparks_refill_date = NOW() + INTERVAL '1 month'
      WHERE id = user_record.id;

      updated_count := updated_count + 1;
    END;
  END LOOP;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE profiles IS 'User profiles extending auth.users with plan and sparks balance';
COMMENT ON TABLE spark_transactions IS 'History of all spark debit/credit transactions';
COMMENT ON TABLE generation_sessions IS 'Tracks generation attempts and regeneration usage per post';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for API protection';
COMMENT ON FUNCTION debit_sparks IS 'Atomically debits sparks from user balance if sufficient funds exist';
COMMENT ON FUNCTION use_regeneration IS 'Checks and marks regeneration as used for a generation session';
