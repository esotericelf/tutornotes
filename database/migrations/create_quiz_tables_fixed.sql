-- Quiz Module Database Schema (Fixed Version)
-- This creates the necessary tables for the quiz functionality
-- IMPORTANT: Run create_profiles_table.sql first!

-- Check if profiles table exists before proceeding
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Profiles table does not exist. Please run create_profiles_table.sql first.';
    END IF;

    RAISE NOTICE '✅ Profiles table found, proceeding with quiz tables creation...';
END $$;

-- Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tags TEXT[] DEFAULT '{}',
    question TEXT NOT NULL,
    question_diagram TEXT, -- GeoGebra iframe URL or embed code
    option_a TEXT NOT NULL,
    option_a_diagram TEXT, -- GeoGebra iframe URL or embed code
    option_b TEXT NOT NULL,
    option_b_diagram TEXT, -- GeoGebra iframe URL or embed code
    option_c TEXT NOT NULL,
    option_c_diagram TEXT, -- GeoGebra iframe URL or embed code
    option_d TEXT NOT NULL,
    option_d_diagram TEXT, -- GeoGebra iframe URL or embed code
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    solution TEXT,
    solution_diagram TEXT, -- GeoGebra URL or embed code
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    subject_area TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true
);

-- Quiz table
CREATE TABLE IF NOT EXISTS quiz_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    attempt_count INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage (0.00 to 100.00)
    questions UUID[] DEFAULT '{}', -- Array of question IDs
    tags TEXT[] DEFAULT '{}',
    time_limit_minutes INTEGER DEFAULT 30,
    passing_score INTEGER DEFAULT 70, -- Percentage required to pass
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true
);

-- Quiz attempts table (tracks user performance)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    quiz_id UUID REFERENCES quiz_quizzes(id) NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken_seconds INTEGER,
    answers JSONB, -- Store user's answers: {"question_id": "selected_option"}
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false
);

-- Quiz results table (detailed breakdown)
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID REFERENCES quiz_attempts(id) NOT NULL,
    question_id UUID REFERENCES quiz_questions(id) NOT NULL,
    user_answer CHAR(1),
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_tags ON quiz_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_subject ON quiz_questions(subject_area);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_quizzes_tags ON quiz_quizzes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_attempt ON quiz_results(attempt_id);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_quizzes_updated_at
    BEFORE UPDATE ON quiz_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate quiz pass rate
CREATE OR REPLACE FUNCTION calculate_quiz_pass_rate(quiz_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_attempts INTEGER;
    passed_attempts INTEGER;
BEGIN
    SELECT COUNT(*),
           COUNT(CASE WHEN percentage >= (SELECT passing_score FROM quiz_quizzes WHERE id = quiz_uuid) THEN 1 END)
    INTO total_attempts, passed_attempts
    FROM quiz_attempts
    WHERE quiz_id = quiz_uuid AND is_completed = true;

    IF total_attempts = 0 THEN
        RETURN 0.00;
    END IF;

    RETURN ROUND((passed_attempts::DECIMAL / total_attempts::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz statistics
CREATE OR REPLACE FUNCTION update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update attempt count
    UPDATE quiz_quizzes
    SET attempt_count = (
        SELECT COUNT(*)
        FROM quiz_attempts
        WHERE quiz_id = NEW.quiz_id AND is_completed = true
    )
    WHERE id = NEW.quiz_id;

    -- Update pass rate
    UPDATE quiz_quizzes
    SET pass_rate = calculate_quiz_pass_rate(NEW.quiz_id)
    WHERE id = NEW.quiz_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quiz statistics when attempts are completed
CREATE TRIGGER update_quiz_stats_trigger
    AFTER UPDATE ON quiz_attempts
    FOR EACH ROW
    WHEN (OLD.is_completed = false AND NEW.is_completed = true)
    EXECUTE FUNCTION update_quiz_statistics();

-- Row Level Security (RLS) policies
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions
CREATE POLICY "Users can view active questions" ON quiz_questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all questions" ON quiz_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quiz_quizzes
CREATE POLICY "Users can view public quizzes" ON quiz_quizzes
    FOR SELECT USING (is_public = true OR is_active = true);

CREATE POLICY "Admins can manage all quizzes" ON quiz_quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own attempts" ON quiz_attempts
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for quiz_results
CREATE POLICY "Users can view their own results" ON quiz_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own results" ON quiz_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE id = attempt_id AND user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON quiz_quizzes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON quiz_attempts TO authenticated;
GRANT SELECT, INSERT ON quiz_results TO authenticated;

-- Grant admin permissions
GRANT ALL ON quiz_questions TO service_role;
GRANT ALL ON quiz_quizzes TO service_role;
GRANT ALL ON quiz_attempts TO service_role;
GRANT ALL ON quiz_results TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quiz tables created successfully!';
    RAISE NOTICE '✅ RLS policies configured!';
    RAISE NOTICE '✅ Permissions granted!';
    RAISE NOTICE '🎯 You can now start using the quiz module!';
END $$;
