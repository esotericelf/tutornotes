-- Create Discussions Table
-- This table stores discussions/comments for math past paper questions

CREATE TABLE IF NOT EXISTS discussions (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES "Math_Past_Paper"(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    diagram TEXT, -- for iframe link rendering
    votes_count INTEGER DEFAULT 0,
    parent BIGINT REFERENCES discussions(id) ON DELETE CASCADE, -- for nested replies
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussions_question_id ON discussions(question_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_parent ON discussions(parent);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_votes_count ON discussions(votes_count DESC);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_discussions_question_created ON discussions(question_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_question_votes ON discussions(question_id, votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_parent_created ON discussions(parent, created_at ASC);

-- Enable Row Level Security
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read discussions
CREATE POLICY "Allow authenticated users to read discussions" ON discussions
FOR SELECT TO authenticated USING (true);

-- Allow users to insert their own discussions
CREATE POLICY "Allow users to insert their own discussions" ON discussions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own discussions
CREATE POLICY "Allow users to update their own discussions" ON discussions
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow users to delete their own discussions
CREATE POLICY "Allow users to delete their own discussions" ON discussions
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_discussions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_discussions_updated_at
    BEFORE UPDATE ON discussions
    FOR EACH ROW
    EXECUTE FUNCTION update_discussions_updated_at();

-- Create a function to get discussion threads for a question
CREATE OR REPLACE FUNCTION get_discussion_threads(question_id_param BIGINT)
RETURNS TABLE (
    id BIGINT,
    question_id BIGINT,
    user_id UUID,
    comment TEXT,
    diagram TEXT,
    votes_count INTEGER,
    parent BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    level INTEGER,
    path LTREE
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE discussion_tree AS (
        -- Base case: top-level comments (parent IS NULL)
        SELECT
            d.id,
            d.question_id,
            d.user_id,
            d.comment,
            d.diagram,
            d.votes_count,
            d.parent,
            d.created_at,
            d.updated_at,
            0 as level,
            d.id::text::ltree as path
        FROM discussions d
        WHERE d.question_id = question_id_param AND d.parent IS NULL

        UNION ALL

        -- Recursive case: replies
        SELECT
            d.id,
            d.question_id,
            d.user_id,
            d.comment,
            d.diagram,
            d.votes_count,
            d.parent,
            d.created_at,
            d.updated_at,
            dt.level + 1,
            dt.path || d.id::text::ltree
        FROM discussions d
        INNER JOIN discussion_tree dt ON d.parent = dt.id
        WHERE d.question_id = question_id_param
    )
    SELECT * FROM discussion_tree
    ORDER BY path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON discussions TO authenticated;
GRANT USAGE ON SEQUENCE discussions_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION get_discussion_threads(BIGINT) TO authenticated;

-- Create a view for easy access to discussions with user information
CREATE OR REPLACE VIEW discussions_with_users AS
SELECT
    d.id,
    d.question_id,
    d.user_id,
    d.comment,
    d.diagram,
    d.votes_count,
    d.parent,
    d.created_at,
    d.updated_at,
    u.email as user_email,
    u.raw_user_meta_data->>'full_name' as user_full_name
FROM discussions d
LEFT JOIN auth.users u ON d.user_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON discussions_with_users TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO discussions (question_id, user_id, comment, votes_count) VALUES
--     (1, 'your-user-id-here', 'This is a great question!', 5),
--     (1, 'your-user-id-here', 'I think the answer is B', 3);

-- Verification query
SELECT
    'Discussions table created successfully' as status,
    COUNT(*) as total_discussions
FROM discussions;
