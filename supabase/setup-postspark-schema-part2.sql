-- ============================================================
-- POSTSPARK - PARTE 2: RLS POLICIES
-- Execute após a Parte 1
-- ============================================================

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

-- Políticas para rate_limits
CREATE POLICY "Service role can manage rate limits"
  ON postspark.rate_limits FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
