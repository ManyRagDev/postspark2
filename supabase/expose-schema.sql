-- Verificar se o schema postspark está exposto na API
SELECT 
    n.nspname as schema_name,
    c.rolname as owner
FROM pg_namespace n
JOIN pg_roles c ON n.nspowner = c.oid
WHERE n.nspname = 'postspark';

-- Verificar se o schema está na lista de schemas expostos do Supabase
-- (Isso é configurado no dashboard do Supabase, não via SQL)

-- Alternativa: Criar funções RPC para acessar os dados
-- Isso contorna o problema de exposição do schema

-- Função para buscar perfil do usuário
CREATE OR REPLACE FUNCTION postspark.get_user_profile(user_uuid uuid)
RETURNS TABLE (
    id uuid,
    email text,
    plan text,
    sparks integer,
    sparks_refill_date timestamptz,
    created_at timestamptz,
    updated_at timestamptz
) 
SECURITY DEFINER
SET search_path = postspark
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.plan,
        p.sparks,
        p.sparks_refill_date,
        p.created_at,
        p.updated_at
    FROM postspark.profiles p
    WHERE p.id = user_uuid;
END;
$$;

-- Função para buscar transações do usuário
CREATE OR REPLACE FUNCTION postspark.get_user_transactions(
    user_uuid uuid,
    limit_count integer DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    amount integer,
    type text,
    description text,
    created_at timestamptz
)
SECURITY DEFINER
SET search_path = postspark
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.amount,
        t.type,
        t.description,
        t.created_at
    FROM postspark.spark_transactions t
    WHERE t.user_id = user_uuid
    ORDER BY t.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION postspark.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION postspark.get_user_transactions(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION postspark.get_user_profile(uuid) TO anon;
GRANT EXECUTE ON FUNCTION postspark.get_user_transactions(uuid, integer) TO anon;

-- Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'postspark'
  AND routine_name IN ('get_user_profile', 'get_user_transactions');
