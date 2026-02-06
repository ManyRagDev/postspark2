-- ============================================================
-- LIMPEZA MULTI-TENANT: Remover acesso indevido ao postspark
-- ============================================================

-- Passo 1: Identificar usuários que têm perfil no postspark 
-- mas deveriam estar apenas no brincareducando
WITH wrong_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN postspark.profiles p ON u.id = p.id
  WHERE u.email LIKE '%brincareducando%'  -- Ajuste este critério!
     OR u.created_at < '2024-01-01'        -- Ou use data de criação
     -- OR u.email IN ('email1@gmail.com', 'email2@gmail.com')  -- Ou liste emails específicos
)

-- Passo 2: Remover perfis do postspark
-- DELETE FROM postspark.profiles 
-- WHERE id IN (SELECT id FROM wrong_users);

-- Passo 3: Verificar resultado
SELECT COUNT(*) as remaining_profiles FROM postspark.profiles;

-- Passo 4: Listar usuários que permanecem no postspark
SELECT p.id, p.email, p.plan, p.sparks
FROM postspark.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.raw_app_meta_data->>'app_id' = 'postspark';
