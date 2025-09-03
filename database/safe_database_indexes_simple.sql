-- Simplified Database Indexing Strategy for Supabase Optimization
-- This script only creates indexes for columns that actually exist

-- ============================================================================
-- STEP 1: MATH_PAST_PAPER TABLE INDEXES
-- ============================================================================

-- Check if Math_Past_Paper table exists before creating indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Math_Past_Paper' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating indexes for Math_Past_Paper table...';

        -- Basic indexes (these columns should exist)
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_year ON "Math_Past_Paper"(year);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_question_no ON "Math_Past_Paper"(question_no);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_user_id ON "Math_Past_Paper"(user_id);

        -- Conditional indexes for newer columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'paper') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_paper ON "Math_Past_Paper"(paper);
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_created_at ON "Math_Past_Paper"(created_at);
        END IF;

        -- Composite indexes (only if required columns exist)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'Math_Past_Paper'
            AND column_name IN ('year', 'paper')
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_year_paper ON "Math_Past_Paper"(year, paper);
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'Math_Past_Paper'
            AND column_name IN ('year', 'question_no')
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_year_question_no ON "Math_Past_Paper"(year, question_no);
        END IF;

        -- GIN index for tags array (if tags column exists)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'tags') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_tags_gin ON "Math_Past_Paper" USING GIN(tags);
        END IF;

        RAISE NOTICE 'Math_Past_Paper indexes created successfully';
    ELSE
        RAISE NOTICE 'Math_Past_Paper table does not exist - skipping indexes';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: PROFILES TABLE INDEXES
-- ============================================================================

-- Check if profiles table exists before creating indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating indexes for profiles table...';

        -- Only create indexes for columns that actually exist
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
            RAISE NOTICE 'Created username index';
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
            RAISE NOTICE 'Created role index';
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
            RAISE NOTICE 'Created created_at index';
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
            RAISE NOTICE 'Created updated_at index';
        END IF;

        RAISE NOTICE 'Profiles indexes created successfully';
    ELSE
        RAISE NOTICE 'Profiles table does not exist - skipping indexes';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: DISCUSSIONS TABLE INDEXES
-- ============================================================================

-- Check if discussions table exists before creating indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussions' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating indexes for discussions table...';

        -- Basic indexes
        CREATE INDEX IF NOT EXISTS idx_discussions_question_id ON discussions(question_id);
        CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
        CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);

        -- Conditional indexes
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'parent') THEN
            CREATE INDEX IF NOT EXISTS idx_discussions_parent ON discussions(parent);
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'votes_count') THEN
            CREATE INDEX IF NOT EXISTS idx_discussions_votes_count ON discussions(votes_count DESC);
        END IF;

        RAISE NOTICE 'Discussions indexes created successfully';
    ELSE
        RAISE NOTICE 'Discussions table does not exist - skipping indexes';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFICATION
-- ============================================================================

-- Check created indexes
SELECT
    'Verification: Math_Past_Paper Indexes' as step,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'Math_Past_Paper'
AND schemaname = 'public'
ORDER BY indexname;

SELECT
    'Verification: Profiles Indexes' as step,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
AND schemaname = 'public'
ORDER BY indexname;

SELECT
    'Verification: Discussions Indexes' as step,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'discussions'
AND schemaname = 'public'
ORDER BY indexname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Safe database indexing completed successfully!';
    RAISE NOTICE 'Only indexes for existing columns were created.';
    RAISE NOTICE 'Your queries should now be significantly faster.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test your application performance';
    RAISE NOTICE '2. Run optimized_search_functions.sql for better search';
    RAISE NOTICE '3. Monitor performance with: SELECT * FROM supabase_performance_stats;';
END $$;
