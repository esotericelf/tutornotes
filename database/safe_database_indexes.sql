-- Safe Database Indexing Strategy for Supabase Optimization
-- This script only creates indexes for tables that actually exist

-- ============================================================================
-- STEP 1: CHECK EXISTING TABLES
-- ============================================================================

-- Check what tables exist in your database
SELECT
    'Existing Tables' as step,
    table_name,
    'Will create indexes for this table' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('Math_Past_Paper', 'discussions')
ORDER BY table_name;

-- ============================================================================
-- STEP 2: MATH_PAST_PAPER TABLE INDEXES
-- ============================================================================

-- Check if Math_Past_Paper table exists before creating indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Math_Past_Paper' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating indexes for Math_Past_Paper table...';

        -- Single column indexes for common filters
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_year ON "Math_Past_Paper"(year);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_question_no ON "Math_Past_Paper"(question_no);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_paper ON "Math_Past_Paper"(paper);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_user_id ON "Math_Past_Paper"(user_id);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_created_at ON "Math_Past_Paper"(created_at);

        -- Composite indexes for common query combinations
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_year_paper ON "Math_Past_Paper"(year, paper);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_year_question_no ON "Math_Past_Paper"(year, question_no);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_paper_question_no ON "Math_Past_Paper"(paper, question_no);
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_year_paper_question_no ON "Math_Past_Paper"(year, paper, question_no);

        -- Index for ordering (most common sort pattern)
        CREATE INDEX IF NOT EXISTS idx_math_past_paper_year_desc_question_no_asc ON "Math_Past_Paper"(year DESC, question_no ASC);

        -- GIN index for tags array (if tags column exists)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'tags') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_tags_gin ON "Math_Past_Paper" USING GIN(tags);
            RAISE NOTICE 'Created tags GIN index';
        END IF;

        -- Full-text search indexes for content search (only if columns exist)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'correct_answer') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_correct_answer_gin ON "Math_Past_Paper" USING GIN(to_tsvector('english', correct_answer));
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'option_a') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_option_a_gin ON "Math_Past_Paper" USING GIN(to_tsvector('english', option_a));
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'option_b') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_option_b_gin ON "Math_Past_Paper" USING GIN(to_tsvector('english', option_b));
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'option_c') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_option_c_gin ON "Math_Past_Paper" USING GIN(to_tsvector('english', option_c));
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'option_d') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_option_d_gin ON "Math_Past_Paper" USING GIN(to_tsvector('english', option_d));
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Math_Past_Paper' AND column_name = 'solution') THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_solution_gin ON "Math_Past_Paper" USING GIN(to_tsvector('english', solution));
        END IF;

        -- Combined full-text search index (only if all required columns exist)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'Math_Past_Paper'
            AND column_name IN ('correct_answer', 'option_a', 'option_b', 'option_c', 'option_d', 'solution')
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_math_past_paper_content_search ON "Math_Past_Paper"
            USING GIN(to_tsvector('english',
                COALESCE(correct_answer, '') || ' ' ||
                COALESCE(option_a, '') || ' ' ||
                COALESCE(option_b, '') || ' ' ||
                COALESCE(option_c, '') || ' ' ||
                COALESCE(option_d, '') || ' ' ||
                COALESCE(solution, '')
            ));
            RAISE NOTICE 'Created combined content search index';
        END IF;

        RAISE NOTICE 'Math_Past_Paper indexes created successfully';
    ELSE
        RAISE NOTICE 'Math_Past_Paper table does not exist - skipping indexes';
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

        -- Primary key index
        CREATE INDEX IF NOT EXISTS idx_discussions_id ON discussions(id);

        -- Single column indexes
        CREATE INDEX IF NOT EXISTS idx_discussions_question_id ON discussions(question_id);
        CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
        CREATE INDEX IF NOT EXISTS idx_discussions_parent ON discussions(parent);
        CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_discussions_votes_count ON discussions(votes_count DESC);

        -- Composite indexes for common query patterns
        CREATE INDEX IF NOT EXISTS idx_discussions_question_created ON discussions(question_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_discussions_question_votes ON discussions(question_id, votes_count DESC);
        CREATE INDEX IF NOT EXISTS idx_discussions_parent_created ON discussions(parent, created_at ASC);

        -- Full-text search for comments (if comment column exists)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'comment') THEN
            CREATE INDEX IF NOT EXISTS idx_discussions_comment_search ON discussions
            USING GIN(to_tsvector('english', comment));
            RAISE NOTICE 'Created comment search index';
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
    'Verification: Discussions Indexes' as step,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'discussions'
AND schemaname = 'public'
ORDER BY indexname;

-- ============================================================================
-- STEP 5: PERFORMANCE STATISTICS
-- ============================================================================

-- Update table statistics for better query planning
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Math_Past_Paper' AND table_schema = 'public') THEN
        ANALYZE "Math_Past_Paper";
        RAISE NOTICE 'Updated Math_Past_Paper statistics';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussions' AND table_schema = 'public') THEN
        ANALYZE discussions;
        RAISE NOTICE 'Updated discussions statistics';
    END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Safe database indexing completed successfully!';
    RAISE NOTICE 'Only indexes for existing tables were created.';
    RAISE NOTICE 'Your queries should now be significantly faster.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test your application performance';
    RAISE NOTICE '2. Run optimized_search_functions.sql for better search';
    RAISE NOTICE '3. Monitor performance with: SELECT * FROM supabase_performance_stats;';
END $$;
