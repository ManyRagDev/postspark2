-- ============================================================
-- TORNAR USUÁRIO DEV (Sparks ilimitados)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Substitua 'emanuel.adm10@gmail.com' pelo seu email
-- Ou use seu UUID diretamente

-- Opção 1: Usando email
UPDATE postspark.profiles 
SET 
  plan = 'DEV',
  sparks = 999999
WHERE email = 'emanuel.adm10@gmail.com';

-- Opção 2: Usando ID diretamente (se souber o UUID)
-- UPDATE postspark.profiles 
-- SET 
--   plan = 'DEV',
--   sparks = 999999
-- WHERE id = 'seu-uuid-aqui';

-- Verificar se funcionou
SELECT email, plan, sparks 
FROM postspark.profiles 
WHERE email = 'emanuel.adm10@gmail.com';
