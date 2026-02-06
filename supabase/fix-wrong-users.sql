-- ============================================================
-- CORREÇÃO: Usuários do brincareducando foram parar no postspark
-- ============================================================

-- 1. PRIMEIRO: Ver quem são esses usuários
SELECT 
  u.id,
  u.email,
  u.raw_app_meta_data->>'app_id' as current_app_id,
  'Deve ser brincareducando' as correct_app
FROM auth.users u
JOIN postspark.profiles p ON u.id = p.id
WHERE u.raw_app_meta_data->>'app_id' = 'postspark'
  OR u.raw_app_meta_data->>'app_id' IS NULL;

-- 2. OPÇÃO A: Remover perfis do postspark desses usuários
-- (Eles continuarão no auth, mas sem acesso ao postspark)
-- DESCOMENTE PARA EXECUTAR:
-- DELETE FROM postspark.profiles 
-- WHERE id IN (
--   SELECT u.id 
--   FROM auth.users u 
--   WHERE u.raw_app_meta_data->>'app_id' = 'postspark'
--     OR u.raw_app_meta_data->>'app_id' IS NULL
-- );

-- 3. OPÇÃO B: Marcar usuários específicos com app_id correto
-- Se você souber quais emails são do brincareducando:
-- UPDATE auth.users 
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}') || '{"app_id": "brincareducando"}'::jsonb
-- WHERE email IN ('email1@exemplo.com', 'email2@exemplo.com');

-- 4. DEPOIS: Limpar app_metadata dos usuários que não são do postspark
-- DESCOMENTE PARA EXECUTAR:
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data - 'app_id'
-- WHERE id NOT IN (SELECT id FROM postspark.profiles);

-- 5. VERIFICAÇÃO FINAL
SELECT 
  raw_app_meta_data->>'app_id' as app_id,
  COUNT(*) as user_count
FROM auth.users
GROUP BY raw_app_meta_data->>'app_id';
