-- ============================================================
-- POSTSPARK - PARTE 3: TRIGGERS
-- Execute após a Parte 2
-- ============================================================

-- Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION postspark.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO postspark.profiles (id, email, plan, sparks)
  VALUES (NEW.id, NEW.email, 'FREE', 50);
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION postspark.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION postspark.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON postspark.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON postspark.profiles
  FOR EACH ROW
  EXECUTE FUNCTION postspark.update_updated_at_column();
