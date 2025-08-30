-- Safe Math_Past_Paper Table Schema Update
-- This script checks existing structure before making changes

-- ============================================================================
-- STEP 1: CHECK CURRENT TABLE STRUCTURE
-- ============================================================================

-- Check current columns in Math_Past_Paper table
SELECT
    'Current Table Structure' as step,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Math_Past_Paper'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current data count
SELECT
    'Current Data Count' as step,
    COUNT(*) as total_records
FROM "Math_Past_Paper";

-- Check if new columns already exist
SELECT
    'Checking New Columns' as step,
    column_name,
    CASE
        WHEN column_name IN ('paper', 'tags', 'solution', 'solution_diagram', 'question_diagram')
        THEN 'Will be added if missing'
        ELSE 'Already exists'
    END as status
FROM information_schema.columns
WHERE table_name = 'Math_Past_Paper'
AND table_schema = 'public'
AND column_name IN ('paper', 'tags', 'solution', 'solution_diagram', 'question_diagram');

-- ============================================================================
-- STEP 2: SAFELY ADD NEW COLUMNS (IF NOT EXISTS)
-- ============================================================================

-- Add 'paper' column for Paper I or II (safe - only adds if missing)
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "paper" TEXT;

-- Add 'tags' column as an array of text for keyword search (safe - only adds if missing)
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- Add solution column to Math_Past_Paper table (safe - only adds if missing)
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "solution" TEXT;

-- Add solution diagram column for visual solutions (safe - only adds if missing)
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "solution_diagram" TEXT;

-- Add question diagram column for visual questions (safe - only adds if missing)
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "question_diagram" TEXT;

-- ============================================================================
-- STEP 3: SAFELY UPDATE DEFAULT VALUES (ONLY IF NEEDED)
-- ============================================================================

-- Check how many records need default values
SELECT
    'Records Needing Default Values' as step,
    COUNT(*) as records_with_null_paper
FROM "Math_Past_Paper"
WHERE "paper" IS NULL;

SELECT
    'Records Needing Default Values' as step,
    COUNT(*) as records_with_null_tags
FROM "Math_Past_Paper"
WHERE "tags" IS NULL;

-- Only update if there are records that need default values
DO $$
DECLARE
    null_paper_count INTEGER;
    null_tags_count INTEGER;
BEGIN
    -- Count records with NULL paper
    SELECT COUNT(*) INTO null_paper_count
    FROM "Math_Past_Paper"
    WHERE "paper" IS NULL;

    -- Count records with NULL tags
    SELECT COUNT(*) INTO null_tags_count
    FROM "Math_Past_Paper"
    WHERE "tags" IS NULL;

    -- Update paper column only if needed
    IF null_paper_count > 0 THEN
        UPDATE "Math_Past_Paper" SET "paper" = 'I' WHERE "paper" IS NULL;
        RAISE NOTICE 'Updated % records with default paper value', null_paper_count;
    ELSE
        RAISE NOTICE 'No records needed paper default value update';
    END IF;

    -- Update tags column only if needed
    IF null_tags_count > 0 THEN
        UPDATE "Math_Past_Paper" SET "tags" = '{}' WHERE "tags" IS NULL;
        RAISE NOTICE 'Updated % records with default tags value', null_tags_count;
    ELSE
        RAISE NOTICE 'No records needed tags default value update';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: SAFELY CREATE INDEXES (IF NOT EXISTS)
-- ============================================================================

-- Create indexes for performance (safe - only creates if missing)
CREATE INDEX IF NOT EXISTS idx_math_past_paper_paper ON "Math_Past_Paper"("paper");
CREATE INDEX IF NOT EXISTS idx_math_past_paper_tags ON "Math_Past_Paper" USING GIN("tags");

-- ============================================================================
-- STEP 5: SAFELY UPDATE FUNCTIONS AND VIEWS
-- ============================================================================

-- Check if functions exist before dropping
SELECT
    'Checking Existing Functions' as step,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('search_math_papers_by_keyword', 'filter_math_papers_by_year_paper');

-- Safely drop existing functions (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'search_math_papers_by_keyword' AND routine_schema = 'public') THEN
        DROP FUNCTION IF EXISTS search_math_papers_by_keyword(TEXT);
        RAISE NOTICE 'Dropped existing search_math_papers_by_keyword function';
    ELSE
        RAISE NOTICE 'search_math_papers_by_keyword function does not exist - skipping drop';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'filter_math_papers_by_year_paper' AND routine_schema = 'public') THEN
        DROP FUNCTION IF EXISTS filter_math_papers_by_year_paper(INTEGER, TEXT);
        RAISE NOTICE 'Dropped existing filter_math_papers_by_year_paper function';
    ELSE
        RAISE NOTICE 'filter_math_papers_by_year_paper function does not exist - skipping drop';
    END IF;
END $$;

-- Update the view to include the new columns (safe - replaces view)
CREATE OR REPLACE VIEW "Math_Past_Paper_View" AS
SELECT
    id, year, question_no, correct_answer, option_a, option_b, option_c, option_d,
    option_a_graph, option_b_graphic, option_c_graphic, option_d_graphic,
    paper, tags, user_id, created_at, solution, solution_diagram, question_diagram
FROM "Math_Past_Paper"
ORDER BY year DESC, paper, question_no;

-- Recreate the search function with new columns
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
        mp.correct_answer ILIKE '%' || search_term || '%' OR
        mp.option_a ILIKE '%' || search_term || '%' OR
        mp.option_b ILIKE '%' || search_term || '%' OR
        mp.option_c ILIKE '%' || search_term || '%' OR
        mp.option_d ILIKE '%' || search_term || '%' OR
        mp.solution ILIKE '%' || search_term || '%' OR
        mp.tags && ARRAY[search_term] OR
        EXISTS (SELECT 1 FROM unnest(mp.tags) tag WHERE tag ILIKE '%' || search_term || '%')
    ORDER BY mp.year DESC, mp.paper, mp.question_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the filter function with new columns
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

-- ============================================================================
-- STEP 6: GRANT PERMISSIONS (SAFE)
-- ============================================================================

-- Grant permissions (safe - only adds permissions)
GRANT SELECT ON "Math_Past_Paper_View" TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- STEP 7: VERIFICATION
-- ============================================================================

-- Verify the updated table structure
SELECT
    'Final Table Structure' as step,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Math_Past_Paper'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify functions were created
SELECT
    'Verification: Functions' as step,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('search_math_papers_by_keyword', 'filter_math_papers_by_year_paper');

-- Test the view
SELECT
    'Verification: View Test' as step,
    COUNT(*) as total_records_in_view
FROM "Math_Past_Paper_View";

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Safe Math_Past_Paper schema update completed successfully!';
    RAISE NOTICE 'Your data is safe - no data was deleted or lost.';
    RAISE NOTICE 'New columns added: paper, tags, solution, solution_diagram, question_diagram';
    RAISE NOTICE 'Functions updated: search_math_papers_by_keyword, filter_math_papers_by_year_paper';
    RAISE NOTICE 'View updated: Math_Past_Paper_View';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the new search functions';
    RAISE NOTICE '2. Add tags to your existing questions if desired';
    RAISE NOTICE '3. Continue with discussions table setup';
END $$;
