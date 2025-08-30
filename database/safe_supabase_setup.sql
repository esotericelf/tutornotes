-- Safe Supabase Setup Script for Database Optimization
-- This script checks existing objects before making changes

-- ============================================================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================================================

-- Check if extensions are already enabled
SELECT
    'Checking Extensions' as step,
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('pg_stat_statements', 'pg_trgm');

-- Check current RLS status
SELECT
    'Checking RLS Status' as step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Math_Past_Paper', 'discussions', 'tutor_notes', 'user_favorites');

-- Check existing policies
SELECT
    'Checking Existing Policies' as step,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- STEP 2: ENABLE REQUIRED EXTENSIONS (SAFE)
-- ============================================================================

-- Enable pg_stat_statements for performance monitoring (safe - won't affect data)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable pg_trgm for trigram matching (safe - won't affect data)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- STEP 3: CONFIGURE ROW LEVEL SECURITY (SAFE)
-- ============================================================================

-- Enable RLS on main tables (safe - only adds security layer)
ALTER TABLE "Math_Past_Paper" ENABLE ROW LEVEL SECURITY;

-- Only enable RLS on discussions if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussions') THEN
        ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on discussions table';
    ELSE
        RAISE NOTICE 'discussions table does not exist yet - skipping RLS setup';
    END IF;
END $$;

-- Only enable RLS on tutor_notes if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tutor_notes') THEN
        ALTER TABLE tutor_notes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on tutor_notes table';
    ELSE
        RAISE NOTICE 'tutor_notes table does not exist yet - skipping RLS setup';
    END IF;
END $$;

-- Only enable RLS on user_favorites if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_favorites') THEN
        ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on user_favorites table';
    ELSE
        RAISE NOTICE 'user_favorites table does not exist yet - skipping RLS setup';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE RLS POLICIES (SAFE - REPLACES OLD ONES)
-- ============================================================================

-- Policy for Math_Past_Paper (read access for all authenticated users)
-- This will replace any existing policy with the same name
DROP POLICY IF EXISTS "Allow authenticated users to read math papers" ON "Math_Past_Paper";
CREATE POLICY "Allow authenticated users to read math papers" ON "Math_Past_Paper"
FOR SELECT TO authenticated USING (true);

-- Policy for discussions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussions') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to read discussions" ON discussions;
        CREATE POLICY "Allow authenticated users to read discussions" ON discussions
        FOR SELECT TO authenticated USING (true);
        RAISE NOTICE 'Created RLS policy for discussions table';
    END IF;
END $$;

-- Policy for tutor_notes (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tutor_notes') THEN
        DROP POLICY IF EXISTS "Allow authenticated users to read public tutor notes" ON tutor_notes;
        CREATE POLICY "Allow authenticated users to read public tutor notes" ON tutor_notes
        FOR SELECT TO authenticated USING (is_public = true);
        RAISE NOTICE 'Created RLS policy for tutor_notes table';
    END IF;
END $$;

-- Policy for user_favorites (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_favorites') THEN
        DROP POLICY IF EXISTS "Allow users to read their own favorites" ON user_favorites;
        CREATE POLICY "Allow users to read their own favorites" ON user_favorites
        FOR SELECT TO authenticated USING (auth.uid() = user_id);
        RAISE NOTICE 'Created RLS policy for user_favorites table';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: GRANT NECESSARY PERMISSIONS (SAFE)
-- ============================================================================

-- Grant permissions for authenticated users (safe - only adds permissions)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for service role (safe - only adds permissions)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 6: CREATE AUTO-STATISTICS TRIGGER (SAFE)
-- ============================================================================

-- Function to update statistics when data changes (safe - only adds functionality)
CREATE OR REPLACE FUNCTION update_math_paper_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update statistics after insert/update/delete
    ANALYZE "Math_Past_Paper";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for Math_Past_Paper (safe - only adds trigger)
DROP TRIGGER IF EXISTS trigger_update_math_paper_stats ON "Math_Past_Paper";
CREATE TRIGGER trigger_update_math_paper_stats
    AFTER INSERT OR UPDATE OR DELETE ON "Math_Past_Paper"
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_math_paper_stats();

-- ============================================================================
-- STEP 7: CREATE PERFORMANCE MONITORING VIEWS (SAFE)
-- ============================================================================

-- View to monitor Supabase-specific performance (safe - only creates view)
CREATE OR REPLACE VIEW supabase_performance_stats AS
SELECT
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT
    'Active Connections',
    count(*)::text
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT
    'Index Usage',
    count(*)::text
FROM pg_stat_user_indexes
WHERE idx_scan > 0;

-- ============================================================================
-- STEP 8: VERIFICATION QUERIES
-- ============================================================================

-- Check if extensions are enabled
SELECT
    'Verification: Extensions' as check_type,
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('pg_stat_statements', 'pg_trgm');

-- Check RLS status
SELECT
    'Verification: RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Math_Past_Paper', 'discussions', 'tutor_notes', 'user_favorites');

-- Check policies
SELECT
    'Verification: Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- This will show a completion message
DO $$
BEGIN
    RAISE NOTICE 'Safe Supabase setup completed successfully!';
    RAISE NOTICE 'Your data is safe - no data was modified or deleted.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run database_indexes_optimization.sql (if you want performance improvements)';
    RAISE NOTICE '2. Run create_discussions_table.sql (if you want the discussions feature)';
    RAISE NOTICE '3. Test your application';
    RAISE NOTICE '4. Monitor performance with: SELECT * FROM supabase_performance_stats;';
END $$;
