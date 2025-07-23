-- Math_Past_Paper Table Schema Update - CORRECTED VERSION
-- Based on actual table structure:
-- id bigint, year integer, question_no smallint, correct_answer text,
-- option_a/b/c/d text, option_a_graph/b_graphic/c_graphic/d_graphic ARRAY, user_id uuid

-- Add 'paper' column for Paper I or II
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "paper" TEXT;

-- Add 'tags' column as an array of text for keyword search
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- Add solution column to Math_Past_Paper table
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "solution" TEXT;

-- Add solution diagram column for visual solutions
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "solution_diagram" TEXT;

-- Add question diagram column for visual questions
ALTER TABLE "Math_Past_Paper"
ADD COLUMN IF NOT EXISTS "question_diagram" TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_math_past_paper_paper ON "Math_Past_Paper"("paper");
CREATE INDEX IF NOT EXISTS idx_math_past_paper_tags ON "Math_Past_Paper" USING GIN("tags");

-- Update existing records with default values
UPDATE "Math_Past_Paper" SET "paper" = 'I' WHERE "paper" IS NULL;
UPDATE "Math_Past_Paper" SET "tags" = '{}' WHERE "tags" IS NULL;

-- Drop existing functions first
DROP FUNCTION IF EXISTS search_math_papers_by_keyword(TEXT);
DROP FUNCTION IF EXISTS filter_math_papers_by_year_paper(INTEGER, TEXT);

-- Update the view to include the new columns
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

-- Grant permissions
GRANT SELECT ON "Math_Past_Paper_View" TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;