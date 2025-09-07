-- Create Topic Tags Table
-- This table provides flexible tagging system for various content types
-- Supports tagging math papers, quiz questions, and other content

-- Check if topic_tags table already exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'topic_tags' AND table_schema = 'public') THEN
        RAISE NOTICE 'Topic_tags table already exists - skipping creation';
    ELSE
        RAISE NOTICE 'Creating topic_tags table...';
    END IF;
END $$;

-- Create the main topic_tags table with flexible content linking
CREATE TABLE IF NOT EXISTS topic_tags (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(100) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('math_paper', 'quiz_question', 'quiz_quiz', 'discussion')),
    content_id TEXT NOT NULL, -- Store ID as text to handle both BIGINT and UUID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,

    -- Ensure unique combination of topic, tag, and content
    UNIQUE(topic, tag, content_type, content_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topic_tags_topic ON topic_tags(topic);
CREATE INDEX IF NOT EXISTS idx_topic_tags_tag ON topic_tags(tag);
CREATE INDEX IF NOT EXISTS idx_topic_tags_content_type ON topic_tags(content_type);
CREATE INDEX IF NOT EXISTS idx_topic_tags_content_id ON topic_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_topic_tags_created_by ON topic_tags(created_by);
CREATE INDEX IF NOT EXISTS idx_topic_tags_created_at ON topic_tags(created_at DESC);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_topic_tags_content_lookup ON topic_tags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_topic_tags_topic_tag ON topic_tags(topic, tag);
CREATE INDEX IF NOT EXISTS idx_topic_tags_active ON topic_tags(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE topic_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read active topic tags
CREATE POLICY "Allow authenticated users to read active topic tags" ON topic_tags
    FOR SELECT TO authenticated USING (is_active = true);

-- Allow users to create their own topic tags
CREATE POLICY "Allow users to create their own topic tags" ON topic_tags
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own topic tags
CREATE POLICY "Allow users to update their own topic tags" ON topic_tags
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Allow users to delete their own topic tags
CREATE POLICY "Allow users to delete their own topic tags" ON topic_tags
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Allow admins to manage all topic tags
CREATE POLICY "Allow admins to manage all topic tags" ON topic_tags
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create helper functions for topic tag management

-- Function to get all tags for a specific content item
CREATE OR REPLACE FUNCTION get_content_tags(
    content_type_param VARCHAR(50),
    content_id_param TEXT
)
RETURNS TABLE (
    topic VARCHAR(100),
    tag VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tt.topic,
        tt.tag,
        tt.created_at
    FROM topic_tags tt
    WHERE tt.content_type = content_type_param
    AND tt.content_id = content_id_param
    AND tt.is_active = true
    ORDER BY tt.topic, tt.tag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all content items with a specific tag
CREATE OR REPLACE FUNCTION get_content_by_tag(
    topic_param VARCHAR(100),
    tag_param VARCHAR(50),
    content_type_param VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    content_type VARCHAR(50),
    content_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tt.content_type,
        tt.content_id,
        tt.created_at
    FROM topic_tags tt
    WHERE tt.topic = topic_param
    AND tt.tag = tag_param
    AND tt.is_active = true
    AND (content_type_param IS NULL OR tt.content_type = content_type_param)
    ORDER BY tt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular tags
CREATE OR REPLACE FUNCTION get_popular_tags(
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    topic VARCHAR(100),
    tag VARCHAR(50),
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tt.topic,
        tt.tag,
        COUNT(*) as usage_count
    FROM topic_tags tt
    WHERE tt.is_active = true
    GROUP BY tt.topic, tt.tag
    ORDER BY usage_count DESC, tt.topic, tt.tag
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add tags to content (with validation)
CREATE OR REPLACE FUNCTION add_content_tags(
    content_type_param VARCHAR(50),
    content_id_param TEXT,
    tags_to_add JSONB, -- Format: [{"topic": "algebra", "tag": "quadratic"}, ...]
    user_id_param UUID DEFAULT auth.uid()
)
RETURNS INTEGER AS $$
DECLARE
    tag_item JSONB;
    inserted_count INTEGER := 0;
BEGIN
    -- Validate content exists based on content_type
    IF content_type_param = 'math_paper' THEN
        IF NOT EXISTS (SELECT 1 FROM "Math_Past_Paper" WHERE id::TEXT = content_id_param) THEN
            RAISE EXCEPTION 'Math paper with ID % does not exist', content_id_param;
        END IF;
    ELSIF content_type_param = 'quiz_question' THEN
        IF NOT EXISTS (SELECT 1 FROM quiz_questions WHERE id::TEXT = content_id_param) THEN
            RAISE EXCEPTION 'Quiz question with ID % does not exist', content_id_param;
        END IF;
    ELSIF content_type_param = 'quiz_quiz' THEN
        IF NOT EXISTS (SELECT 1 FROM quiz_quizzes WHERE id::TEXT = content_id_param) THEN
            RAISE EXCEPTION 'Quiz with ID % does not exist', content_id_param;
        END IF;
    ELSIF content_type_param = 'discussion' THEN
        IF NOT EXISTS (SELECT 1 FROM discussions WHERE id::TEXT = content_id_param) THEN
            RAISE EXCEPTION 'Discussion with ID % does not exist', content_id_param;
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid content_type: %', content_type_param;
    END IF;

    -- Insert tags
    FOR tag_item IN SELECT * FROM jsonb_array_elements(tags_to_add)
    LOOP
        INSERT INTO topic_tags (topic, tag, content_type, content_id, created_by)
        VALUES (
            tag_item->>'topic',
            tag_item->>'tag',
            content_type_param,
            content_id_param,
            user_id_param
        )
        ON CONFLICT (topic, tag, content_type, content_id) DO NOTHING;

        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;

    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create views for easy access

-- View for topic tags with content information
CREATE OR REPLACE VIEW topic_tags_with_content AS
SELECT
    tt.id,
    tt.topic,
    tt.tag,
    tt.content_type,
    tt.content_id,
    tt.created_at,
    tt.created_by,
    p.username as created_by_username,
    p.full_name as created_by_full_name,
    CASE
        WHEN tt.content_type = 'math_paper' THEN
            (SELECT 'Year ' || year || ', Paper ' || COALESCE(paper, 'N/A') || ', Q' || question_no
             FROM "Math_Past_Paper" WHERE id::TEXT = tt.content_id)
        WHEN tt.content_type = 'quiz_question' THEN
            (SELECT LEFT(question, 50) || '...' FROM quiz_questions WHERE id::TEXT = tt.content_id)
        WHEN tt.content_type = 'quiz_quiz' THEN
            (SELECT title FROM quiz_quizzes WHERE id::TEXT = tt.content_id)
        WHEN tt.content_type = 'discussion' THEN
            (SELECT LEFT(comment, 50) || '...' FROM discussions WHERE id::TEXT = tt.content_id)
        ELSE 'Unknown Content'
    END as content_description
FROM topic_tags tt
LEFT JOIN profiles p ON tt.created_by = p.id
WHERE tt.is_active = true;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON topic_tags TO authenticated;
GRANT USAGE ON SEQUENCE topic_tags_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_tags(VARCHAR(50), TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_by_tag(VARCHAR(100), VARCHAR(50), VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_tags(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_content_tags(VARCHAR(50), TEXT, JSONB, UUID) TO authenticated;
GRANT SELECT ON topic_tags_with_content TO authenticated;

-- Grant admin permissions
GRANT ALL ON topic_tags TO service_role;
GRANT ALL ON SEQUENCE topic_tags_id_seq TO service_role;

-- Insert some sample data for testing (optional - uncomment if needed)
/*
-- Sample tags for math papers
INSERT INTO topic_tags (topic, tag, content_type, content_id, created_by) VALUES
    ('algebra', 'quadratic', 'math_paper', '1', (SELECT id FROM profiles LIMIT 1)),
    ('geometry', 'triangle', 'math_paper', '1', (SELECT id FROM profiles LIMIT 1)),
    ('calculus', 'derivative', 'math_paper', '2', (SELECT id FROM profiles LIMIT 1));

-- Sample tags for quiz questions
INSERT INTO topic_tags (topic, tag, content_type, content_id, created_by) VALUES
    ('algebra', 'linear', 'quiz_question', (SELECT id::TEXT FROM quiz_questions LIMIT 1), (SELECT id FROM profiles LIMIT 1)),
    ('statistics', 'probability', 'quiz_question', (SELECT id::TEXT FROM quiz_questions LIMIT 1), (SELECT id FROM profiles LIMIT 1));
*/

-- Verification query
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'topic_tags' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Topic_tags table created successfully!';
        RAISE NOTICE '✅ RLS policies configured!';
        RAISE NOTICE '✅ Helper functions created!';
        RAISE NOTICE '✅ Permissions granted!';
        RAISE NOTICE '🎯 You can now start using the topic tagging system!';
        RAISE NOTICE '';
        RAISE NOTICE 'Usage examples:';
        RAISE NOTICE '1. Get tags for a math paper: SELECT * FROM get_content_tags(''math_paper'', ''1'');';
        RAISE NOTICE '2. Find content by tag: SELECT * FROM get_content_by_tag(''algebra'', ''quadratic'');';
        RAISE NOTICE '3. Get popular tags: SELECT * FROM get_popular_tags(10);';
        RAISE NOTICE '4. Add tags: SELECT add_content_tags(''math_paper'', ''1'', ''[{"topic": "algebra", "tag": "quadratic"}]'');';
    ELSE
        RAISE NOTICE '❌ Topic_tags table creation failed!';
    END IF;
END $$;
