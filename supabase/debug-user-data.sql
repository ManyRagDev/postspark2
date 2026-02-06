-- Query para debugar dados do usuário
-- User ID: 25c1b164-6829-4b88-9f34-052ea8f7b13a

-- 1. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'postspark' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar perfil do usuário (id = user_id na tabela profiles)
SELECT 
    'PROFILE' as tipo,
    id,
    plan,
    sparks,
    created_at,
    updated_at
FROM postspark.profiles
WHERE id = '25c1b164-6829-4b88-9f34-052ea8f7b13a';

-- 3. Verificar transações (user_id é a FK para auth.users)
SELECT 
    'TRANSACTION' as tipo,
    id,
    user_id,
    amount,
    type,
    description,
    created_at
FROM postspark.spark_transactions
WHERE user_id = '25c1b164-6829-4b88-9f34-052ea8f7b13a'
ORDER BY created_at DESC;

-- 4. Verificar todas as tabelas do schema
SELECT schemaname, tablename
FROM pg_tables 
WHERE schemaname = 'postspark';
