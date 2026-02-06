-- Part 5: Verify and fix spark_transactions table setup
-- Run this if the spark_transactions table doesn't exist or has issues

-- Check if spark_transactions table exists
DO $$
BEGIN
    -- Create spark_transactions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS postspark.spark_transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        amount integer NOT NULL,
        type text NOT NULL CHECK (type IN ('credit', 'debit')),
        description text,
        generation_session_id uuid,
        created_at timestamptz DEFAULT now()
    );

    -- Enable RLS on spark_transactions if not already enabled
    ALTER TABLE postspark.spark_transactions ENABLE ROW LEVEL SECURITY;

    -- Create policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spark_transactions' 
        AND schemaname = 'postspark' 
        AND policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions"
            ON postspark.spark_transactions
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spark_transactions' 
        AND schemaname = 'postspark' 
        AND policyname = 'Service role can insert transactions'
    ) THEN
        CREATE POLICY "Service role can insert transactions"
            ON postspark.spark_transactions
            FOR INSERT
            TO service_role
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spark_transactions' 
        AND schemaname = 'postspark' 
        AND policyname = 'Service role can update transactions'
    ) THEN
        CREATE POLICY "Service role can update transactions"
            ON postspark.spark_transactions
            FOR UPDATE
            TO service_role
            USING (true);
    END IF;

    -- Grant permissions
    GRANT SELECT ON postspark.spark_transactions TO authenticated;
    GRANT ALL ON postspark.spark_transactions TO service_role;

    -- Create index if not exists
    CREATE INDEX IF NOT EXISTS idx_spark_transactions_user_id 
        ON postspark.spark_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_spark_transactions_created_at 
        ON postspark.spark_transactions(created_at DESC);

    RAISE NOTICE 'spark_transactions table setup complete';
END $$;
