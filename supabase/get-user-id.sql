-- Query para obter o User ID de um usuário específico
-- Substitua 'email@exemplo.com' pelo email do usuário

-- Opção 1: Buscar por email
SELECT id, email, raw_user_meta_data->>'full_name' as nome
FROM auth.users 
WHERE email = 'emanuel.adm10@gmail.com';  -- Substitua pelo seu email

-- Opção 2: Listar todos os usuários do PostSpark
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name' as nome,
    raw_app_meta_data->>'app_id' as app,
    created_at
FROM auth.users 
WHERE raw_app_meta_data->>'app_id' = 'postspark'
ORDER BY created_at DESC;

-- Opção 3: Buscar usuário específico pelo ID parcial
-- Se você souber parte do email ou nome
SELECT id, email, raw_user_meta_data
FROM auth.users 
WHERE email ILIKE '%emanuel%'
   OR raw_user_meta_data->>'full_name' ILIKE '%emanuel%';
