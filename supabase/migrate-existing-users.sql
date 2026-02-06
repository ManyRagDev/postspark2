-- ============================================================
-- MIGRAÇÃO: Adicionar app_id aos usuários existentes
-- Execute após atualizar o trigger
-- ============================================================

-- 1. Adicionar app_id aos usuários que já têm perfil no postspark
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}') || '{"app_id": "postspark"}'::jsonb
WHERE id IN (SELECT id FROM postspark.profiles)
  AND (raw_app_meta_data->>'app_id' IS NULL OR raw_app_meta_data->>'app_id' != 'postspark');

-- 2. Verificar usuários migrados
SELECT 
  id,
  email,
  raw_app_meta_data->>'app_id' as app_id
FROM auth.users
WHERE raw_app_meta_data->>'app_id' = 'postspark';

-- 3. Contar usuários por app
SELECT 
  raw_app_meta_data->>'app_id' as app_id,
  COUNT(*) as user_count
FROM auth.users
GROUP BY raw_app_meta_data->>'app_id';
