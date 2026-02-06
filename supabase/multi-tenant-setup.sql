-- ============================================================
-- MULTI-TENANCY COM APP METADATA
-- Separa usuários por aplicação usando app_metadata
-- ============================================================

-- ============================================================
-- 1. MODIFICAR TRIGGER PARA VERIFICAR APP_METADATA
-- ============================================================

-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar nova função que verifica app_metadata
CREATE OR REPLACE FUNCTION postspark.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_app_id TEXT;
BEGIN
  -- Extrair app_id do app_metadata
  user_app_id := NEW.raw_app_meta_data->>'app_id';
  
  -- Se não tiver app_id ou for diferente de 'postspark', não criar perfil
  IF user_app_id IS NULL OR user_app_id != 'postspark' THEN
    -- Usuário de outro app, ignorar
    RETURN NEW;
  END IF;
  
  -- Criar perfil apenas para usuários do postspark
  INSERT INTO postspark.profiles (id, email, plan, sparks)
  VALUES (
    NEW.id,
    NEW.email,
    'FREE',
    50
  );
  
  RETURN NEW;
END;
$$;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION postspark.handle_new_user();

-- ============================================================
-- 2. FUNÇÃO PARA SETAR APP_METADATA NO SIGNUP
-- ============================================================

-- Esta função deve ser chamada pelo backend antes/depois do signup
-- Ou você pode usar uma edge function

-- ============================================================
-- 3. MIGRAR USUÁRIOS EXISTENTES (opcional)
-- ============================================================

-- Para usuários existentes do postspark, adicionar app_metadata:
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"app_id": "postspark"}'::jsonb
-- WHERE id IN (SELECT id FROM postspark.profiles);

-- ============================================================
-- 4. VERIFICAÇÃO
-- ============================================================

-- Verificar se trigger está funcionando:
-- SELECT * FROM auth.users WHERE raw_app_meta_data->>'app_id' = 'postspark';

-- ============================================================
-- FIM
-- ============================================================
