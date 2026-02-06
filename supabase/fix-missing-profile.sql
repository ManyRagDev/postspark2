-- Query para corrigir perfil ausente
-- User ID: 25c1b164-6829-4b88-9f34-052ea8f7b13a

-- 1. Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'users';

-- 2. Verificar funções do trigger
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%';

-- 3. Criar perfil manualmente para o usuário (COM EMAIL)
INSERT INTO postspark.profiles (
    id,
    email,
    plan,
    sparks,
    created_at,
    updated_at
) VALUES (
    '25c1b164-6829-4b88-9f34-052ea8f7b13a',
    'emanuel.adm10@gmail.com',
    'FREE',
    50,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    plan = EXCLUDED.plan,
    sparks = EXCLUDED.sparks,
    updated_at = NOW();

-- 4. Verificar se o perfil foi criado
SELECT * FROM postspark.profiles WHERE id = '25c1b164-6829-4b88-9f34-052ea8f7b13a';

-- 5. Verificar todos os perfis existentes
SELECT id, email, plan, sparks, created_at 
FROM postspark.profiles 
ORDER BY created_at DESC;
