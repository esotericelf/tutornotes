-- Fix Quiz RLS Policies
-- Add missing policy to allow users to create their own quizzes

-- Add policy for users to create their own quizzes
CREATE POLICY "Users can create their own quizzes" ON quiz_quizzes
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Add policy for users to update their own quizzes
CREATE POLICY "Users can update their own quizzes" ON quiz_quizzes
    FOR UPDATE USING (created_by = auth.uid());

-- Add policy for users to view their own quizzes (including private ones)
CREATE POLICY "Users can view their own quizzes" ON quiz_quizzes
    FOR SELECT USING (created_by = auth.uid());

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quiz RLS policies updated successfully!';
    RAISE NOTICE '✅ Users can now create and manage their own quizzes!';
END $$;
