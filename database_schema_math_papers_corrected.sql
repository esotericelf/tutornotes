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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_math_past_paper_paper ON "Math_Past_Paper"("paper");
CREATE INDEX IF NOT EXISTS idx_math_past_paper_tags ON "Math_Past_Paper" USING GIN("tags");

-- Update existing records with default values
UPDATE "Math_Past_Paper" SET "paper" = 'I' WHERE "paper" IS NULL;
UPDATE "Math_Past_Paper" SET "tags" = '{}' WHERE "tags" IS NULL;

-- Add constraints
ALTER TABLE "Math_Past_Paper" ADD CONSTRAINT chk_paper_type CHECK ("paper" IN ('I', 'II'));
ALTER TABLE "Math_Past_Paper" ALTER COLUMN "tags" SET NOT NULL;
ALTER TABLE "Math_Past_Paper" ALTER COLUMN "tags" SET DEFAULT '{}';

-- Create view
CREATE OR REPLACE VIEW "Math_Past_Paper_View" AS
SELECT
    id, year, question_no, correct_answer, option_a, option_b, option_c, option_d,
    option_a_graph, option_b_graphic, option_c_graphic, option_d_graphic,
    paper, tags, user_id, created_at
FROM "Math_Past_Paper"
ORDER BY year DESC, paper, question_no;

-- Enable RLS
ALTER TABLE "Math_Past_Paper" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to math papers" ON "Math_Past_Paper" FOR SELECT USING (true);
CREATE POLICY "Allow admin insert math papers" ON "Math_Past_Paper" FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Allow admin update math papers" ON "Math_Past_Paper" FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Allow admin delete math papers" ON "Math_Past_Paper" FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Helper Functions
CREATE OR REPLACE FUNCTION get_available_years()
RETURNS TABLE (year INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT mp.year FROM "Math_Past_Paper" mp ORDER BY mp.year DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_available_question_numbers()
RETURNS TABLE (question_no smallint) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT mp.question_no FROM "Math_Past_Paper" mp ORDER BY mp.question_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_available_papers()
RETURNS TABLE (paper TEXT) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT mp.paper FROM "Math_Past_Paper" mp WHERE mp.paper IS NOT NULL ORDER BY mp.paper;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_all_tags()
RETURNS TABLE (tag TEXT) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT unnest(mp.tags) as tag FROM "Math_Past_Paper" mp
    WHERE mp.tags IS NOT NULL AND array_length(mp.tags, 1) > 0 ORDER BY tag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search Functions
CREATE OR REPLACE FUNCTION search_math_papers_by_keyword(search_term TEXT)
RETURNS TABLE (
    id bigint, year integer, question_no smallint, correct_answer text,
    option_a text, option_b text, option_c text, option_d text,
    option_a_graph TEXT[], option_b_graphic TEXT[], option_c_graphic TEXT[], option_d_graphic TEXT[],
    paper TEXT, tags TEXT[], user_id uuid, created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY SELECT
        mp.id, mp.year, mp.question_no, mp.correct_answer,
        mp.option_a, mp.option_b, mp.option_c, mp.option_d,
        mp.option_a_graph, mp.option_b_graphic, mp.option_c_graphic, mp.option_d_graphic,
        mp.paper, mp.tags, mp.user_id, mp.created_at
    FROM "Math_Past_Paper" mp
    WHERE
        mp.correct_answer ILIKE '%' || search_term || '%' OR
        mp.option_a ILIKE '%' || search_term || '%' OR
        mp.option_b ILIKE '%' || search_term || '%' OR
        mp.option_c ILIKE '%' || search_term || '%' OR
        mp.option_d ILIKE '%' || search_term || '%' OR
        mp.tags && ARRAY[search_term] OR
        EXISTS (SELECT 1 FROM unnest(mp.tags) tag WHERE tag ILIKE '%' || search_term || '%')
    ORDER BY mp.year DESC, mp.paper, mp.question_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION filter_math_papers_by_year_paper(filter_year INTEGER DEFAULT NULL, filter_paper TEXT DEFAULT NULL)
RETURNS TABLE (
    id bigint, year integer, question_no smallint, correct_answer text,
    option_a text, option_b text, option_c text, option_d text,
    option_a_graph TEXT[], option_b_graphic TEXT[], option_c_graphic TEXT[], option_d_graphic TEXT[],
    paper TEXT, tags TEXT[], user_id uuid, created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY SELECT
        mp.id, mp.year, mp.question_no, mp.correct_answer,
        mp.option_a, mp.option_b, mp.option_c, mp.option_d,
        mp.option_a_graph, mp.option_b_graphic, mp.option_c_graphic, mp.option_d_graphic,
        mp.paper, mp.tags, mp.user_id, mp.created_at
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