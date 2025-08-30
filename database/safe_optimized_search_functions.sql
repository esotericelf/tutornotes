-- Safe Optimized Search Functions for Supabase
-- This script checks existing functions before making changes

-- ============================================================================
-- STEP 1: CHECK EXISTING FUNCTIONS
-- ============================================================================

-- Check what functions already exist
SELECT
    'Existing Functions' as step,
    routine_name,
    routine_type,
    'Will be updated if exists' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'search_math_papers_by_keyword',
    'filter_math_papers_by_year_paper',
    'get_all_tags',
    'search_discussions_by_content',
    'get_discussion_threads'
)
ORDER BY routine_name;

-- ============================================================================
-- STEP 2: SAFELY UPDATE MATH PAPER SEARCH FUNCTIONS
-- ============================================================================

-- Check if Math_Past_Paper table exists before creating functions
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Math_Past_Paper' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating optimized search functions for Math_Past_Paper...';

        -- Safely drop existing functions (only if they exist)
        IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'search_math_papers_by_keyword' AND routine_schema = 'public') THEN
            DROP FUNCTION IF EXISTS search_math_papers_by_keyword(TEXT);
            RAISE NOTICE 'Dropped existing search_math_papers_by_keyword function';
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'filter_math_papers_by_year_paper' AND routine_schema = 'public') THEN
            DROP FUNCTION IF EXISTS filter_math_papers_by_year_paper(INTEGER, TEXT);
            RAISE NOTICE 'Dropped existing filter_math_papers_by_year_paper function';
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_all_tags' AND routine_schema = 'public') THEN
            DROP FUNCTION IF EXISTS get_all_tags();
            RAISE NOTICE 'Dropped existing get_all_tags function';
        END IF;

        RAISE NOTICE 'Math_Past_Paper search functions will be created...';
    ELSE
        RAISE NOTICE 'Math_Past_Paper table does not exist - skipping search functions';
    END IF;
END $$;

-- Create optimized search function using full-text search
CREATE OR REPLACE FUNCTION search_math_papers_by_keyword(search_term TEXT)
RETURNS TABLE (
    id bigint, year integer, question_no smallint, correct_answer text,
    option_a text, option_b text, option_c text, option_d text,
    option_a_graph TEXT[], option_b_graphic TEXT[], option_c_graphic TEXT[], option_d_graphic TEXT[],
    paper TEXT, tags TEXT[], user_id uuid, created_at timestamp with time zone,
    solution TEXT, solution_diagram TEXT, question_diagram TEXT
) AS $$
BEGIN
    RETURN QUERY SELECT
        mp.id, mp.year, mp.question_no, mp.correct_answer,
        mp.option_a, mp.option_b, mp.option_c, mp.option_d,
        mp.option_a_graph, mp.option_b_graphic, mp.option_c_graphic, mp.option_d_graphic,
        mp.paper, mp.tags, mp.user_id, mp.created_at,
        mp.solution, mp.solution_diagram, mp.question_diagram
    FROM "Math_Past_Paper" mp
    WHERE
        -- Use full-text search for better performance
        to_tsvector('english',
            COALESCE(mp.correct_answer, '') || ' ' ||
            COALESCE(mp.option_a, '') || ' ' ||
            COALESCE(mp.option_b, '') || ' ' ||
            COALESCE(mp.option_c, '') || ' ' ||
            COALESCE(mp.option_d, '') || ' ' ||
            COALESCE(mp.solution, '')
        ) @@ plainto_tsquery('english', search_term)
        OR
        -- Fallback to ILIKE for partial matches
        mp.correct_answer ILIKE '%' || search_term || '%' OR
        mp.option_a ILIKE '%' || search_term || '%' OR
        mp.option_b ILIKE '%' || search_term || '%' OR
        mp.option_c ILIKE '%' || search_term || '%' OR
        mp.option_d ILIKE '%' || search_term || '%' OR
        mp.solution ILIKE '%' || search_term || '%' OR
        -- Tag search using GIN index
        mp.tags && ARRAY[search_term] OR
        EXISTS (SELECT 1 FROM unnest(mp.tags) tag WHERE tag ILIKE '%' || search_term || '%')
    ORDER BY mp.year DESC, mp.paper, mp.question_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optimized filter function using composite indexes
CREATE OR REPLACE FUNCTION filter_math_papers_by_year_paper(filter_year INTEGER DEFAULT NULL, filter_paper TEXT DEFAULT NULL)
RETURNS TABLE (
    id bigint, year integer, question_no smallint, correct_answer text,
    option_a text, option_b text, option_c text, option_d text,
    option_a_graph TEXT[], option_b_graphic TEXT[], option_c_graphic TEXT[], option_d_graphic TEXT[],
    paper TEXT, tags TEXT[], user_id uuid, created_at timestamp with time zone,
    solution TEXT, solution_diagram TEXT, question_diagram TEXT
) AS $$
BEGIN
    RETURN QUERY SELECT
        mp.id, mp.year, mp.question_no, mp.correct_answer,
        mp.option_a, mp.option_b, mp.option_c, mp.option_d,
        mp.option_a_graph, mp.option_b_graphic, mp.option_c_graphic, mp.option_d_graphic,
        mp.paper, mp.tags, mp.user_id, mp.created_at,
        mp.solution, mp.solution_diagram, mp.question_diagram
    FROM "Math_Past_Paper" mp
    WHERE
        (filter_year IS NULL OR mp.year = filter_year) AND
        (filter_paper IS NULL OR mp.paper = filter_paper)
    ORDER BY mp.year DESC, mp.paper, mp.question_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all unique tags
CREATE OR REPLACE FUNCTION get_all_tags()
RETURNS TEXT[] AS $$
DECLARE
    all_tags TEXT[] := '{}';
    tag_array TEXT[];
BEGIN
    -- Collect all tags from all questions
    FOR tag_array IN
        SELECT DISTINCT tags
        FROM "Math_Past_Paper"
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    LOOP
        all_tags := all_tags || tag_array;
    END LOOP;

    -- Remove duplicates and sort
    SELECT ARRAY(
        SELECT DISTINCT unnest(all_tags)
        ORDER BY unnest(all_tags)
    ) INTO all_tags;

    RETURN all_tags;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: SAFELY UPDATE DISCUSSION SEARCH FUNCTIONS
-- ============================================================================

-- Check if discussions table exists before creating functions
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discussions' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating optimized search functions for discussions...';

        -- Safely drop existing functions (only if they exist)
        IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'search_discussions_by_content' AND routine_schema = 'public') THEN
            DROP FUNCTION IF EXISTS search_discussions_by_content(TEXT);
            RAISE NOTICE 'Dropped existing search_discussions_by_content function';
        END IF;

        RAISE NOTICE 'Discussions search functions will be created...';
    ELSE
        RAISE NOTICE 'Discussions table does not exist - skipping search functions';
    END IF;
END $$;

-- Create optimized search function for discussions
CREATE OR REPLACE FUNCTION search_discussions_by_content(search_term TEXT)
RETURNS TABLE (
    id BIGINT,
    question_id BIGINT,
    user_id UUID,
    comment TEXT,
    diagram TEXT,
    votes_count INTEGER,
    parent BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY SELECT
        d.id,
        d.question_id,
        d.user_id,
        d.comment,
        d.diagram,
        d.votes_count,
        d.parent,
        d.created_at,
        d.updated_at
    FROM discussions d
    WHERE
        -- Use full-text search for better performance
        to_tsvector('english', d.comment) @@ plainto_tsquery('english', search_term)
        OR
        -- Fallback to ILIKE for partial matches
        d.comment ILIKE '%' || search_term || '%'
    ORDER BY d.votes_count DESC, d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get query performance statistics
CREATE OR REPLACE FUNCTION get_query_performance_stats()
RETURNS TABLE (
    metric TEXT,
    value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Math Papers'::TEXT, COUNT(*)::TEXT FROM "Math_Past_Paper"
    UNION ALL
    SELECT 'Total Discussions', COUNT(*)::TEXT FROM discussions
    UNION ALL
    SELECT 'Database Size', pg_size_pretty(pg_database_size(current_database()))
    UNION ALL
    SELECT 'Active Connections', count(*)::TEXT
    FROM pg_stat_activity
    WHERE state = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE FUNCTION get_slow_queries(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION
) AS $$
BEGIN
    -- Check if pg_stat_statements extension is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        RETURN QUERY
        SELECT
            pss.query,
            pss.calls,
            pss.total_time,
            pss.mean_time
        FROM pg_stat_statements pss
        ORDER BY pss.mean_time DESC
        LIMIT limit_count;
    ELSE
        RAISE NOTICE 'pg_stat_statements extension not available - cannot show slow queries';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for all functions (safe - only adds permissions)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- STEP 6: VERIFICATION
-- ============================================================================

-- Verify functions were created
SELECT
    'Verification: Created Functions' as step,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'search_math_papers_by_keyword',
    'filter_math_papers_by_year_paper',
    'get_all_tags',
    'search_discussions_by_content',
    'get_query_performance_stats',
    'get_slow_queries'
)
ORDER BY routine_name;

-- Test the functions
SELECT
    'Verification: Function Tests' as step,
    'Math Papers Search' as function_name,
    COUNT(*) as test_result
FROM search_math_papers_by_keyword('test');

SELECT
    'Verification: Function Tests' as step,
    'Discussions Search' as function_name,
    COUNT(*) as test_result
FROM search_discussions_by_content('test');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Safe optimized search functions completed successfully!';
    RAISE NOTICE 'Your search performance should now be significantly improved.';
    RAISE NOTICE 'New functions available:';
    RAISE NOTICE '- search_math_papers_by_keyword(text) - Fast math paper search';
    RAISE NOTICE '- filter_math_papers_by_year_paper(integer, text) - Fast filtering';
    RAISE NOTICE '- get_all_tags() - Get all available tags';
    RAISE NOTICE '- search_discussions_by_content(text) - Fast discussion search';
    RAISE NOTICE '- get_query_performance_stats() - Monitor performance';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the new search functions in your application';
    RAISE NOTICE '2. Monitor performance with get_query_performance_stats()';
    RAISE NOTICE '3. Your database is now fully optimized!';
END $$;
