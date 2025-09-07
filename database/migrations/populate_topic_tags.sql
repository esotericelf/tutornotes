-- Populate Topic Tags Table with Master Tags
-- These are reusable tags that can be applied to any content

-- First, let's add 'master_tag' as a valid content_type
ALTER TABLE topic_tags DROP CONSTRAINT IF EXISTS topic_tags_content_type_check;
ALTER TABLE topic_tags ADD CONSTRAINT topic_tags_content_type_check
    CHECK (content_type IN ('math_paper', 'quiz_question', 'quiz_quiz', 'discussion', 'master_tag'));

-- Insert master tags (these can be applied to any content later)
INSERT INTO topic_tags (topic, tag, content_type, content_id, created_by) VALUES
-- Quadratic Equations
('Quadratic Equations', 'factor_method', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Quadratic Equations', 'roots', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Quadratic Equations', 'graph_x_intercepts', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Quadratic Equations', 'quadratic_formula', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Quadratic Equations', 'real_roots', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Quadratic Equations', 'nonreal_roots', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Functions and Graphs
('Functions and Graphs', 'function_notation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Functions and Graphs', 'domain', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Functions and Graphs', 'range', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Functions and Graphs', 'graphical_representation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Functions and Graphs', 'quadratic_graph_features', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Exponential and Logarithmic
('Exponential and Logarithmic', 'rational_indices', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Exponential and Logarithmic', 'logarithm_properties', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Exponential and Logarithmic', 'exponential_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Exponential and Logarithmic', 'logarithmic_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Exponential and Logarithmic', 'Richter_Scale', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Exponential and Logarithmic', 'decibels', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Polynomials
('Polynomials', 'polynomial_division', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Polynomials', 'remainder_theorem', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Polynomials', 'factor_theorem', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Polynomials', 'gcd_polynomials', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Polynomials', 'lcm_polynomials', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Polynomials', 'rational_functions', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- More Equations
('More Equations', 'simultaneous_linear_quadratic', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('More Equations', 'fractional_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('More Equations', 'exponential_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('More Equations', 'logarithmic_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('More Equations', 'trigonometric_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Variations
('Variations', 'direct_variation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Variations', 'inverse_variation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Variations', 'joint_variation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Variations', 'partial_variation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Variations', 'real_life_applications', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Sequences and Series
('Sequences and Series', 'arithmetic_sequence', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Sequences and Series', 'geometric_sequence', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Sequences and Series', 'general_term', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Sequences and Series', 'sum_finite_terms', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Sequences and Series', 'sum_infinite_series', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Sequences and Series', 'interest_growth_depreciation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Inequalities and Linear Programming
('Inequalities and Linear Programming', 'compound_inequalities', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Inequalities and Linear Programming', 'quadratic_inequalities', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Inequalities and Linear Programming', 'linear_inequalities_two_variables', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Inequalities and Linear Programming', 'linear_programming', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Graphs of Functions
('Graphs of Functions', 'constant_function', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'linear_function', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'quadratic_function', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'trigonometric_function', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'exponential_function', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'logarithmic_function', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'graph_transformations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Graphs of Functions', 'equation_inequality_solutions', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Equations of Straight Lines
('Equations of Straight Lines', 'slope', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Straight Lines', 'intercepts', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Straight Lines', 'point_slope_form', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Straight Lines', 'two_point_form', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Straight Lines', 'intersection_two_lines', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Properties of Circles
('Properties of Circles', 'chords', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Properties of Circles', 'arcs', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Properties of Circles', 'angle_properties', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Properties of Circles', 'cyclic_quadrilateral', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Properties of Circles', 'tangent_properties', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Properties of Circles', 'alternate_segment', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Loci
('Loci', 'fixed_distance', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Loci', 'equidistant_points', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Loci', 'equidistant_lines', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Loci', 'algebraic_loci_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Equations of Circles
('Equations of Circles', 'circle_equation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Circles', 'center_radius', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Circles', 'tangent_to_circle', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Equations of Circles', 'intersection_line_circle', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Trigonometry
('Trigonometry', 'sine', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'cosine', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'tangent', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'trigonometric_graphs', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'trigonometric_equations', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'area_triangle', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'sine_formula', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'cosine_formula', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'Heron_formula', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'projection', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Trigonometry', 'three_perpendiculars', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Permutations and Combinations
('Permutations and Combinations', 'addition_rule', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Permutations and Combinations', 'multiplication_rule', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Permutations and Combinations', 'permutation_notation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Permutations and Combinations', 'combination_notation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Permutations and Combinations', 'distinct_objects', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Probability
('Probability', 'set_notation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Probability', 'Venn_Diagram', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Probability', 'addition_law', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Probability', 'multiplication_law', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Probability', 'conditional_probability', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Measures of Dispersion
('Measures of Dispersion', 'range', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Measures of Dispersion', 'interquartile_range', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Measures of Dispersion', 'boxplot', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Measures of Dispersion', 'variance', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Measures of Dispersion', 'standard_deviation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Measures of Dispersion', 'standard_scores', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Measures of Dispersion', 'normal_distribution', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Uses of Statistics
('Uses of Statistics', 'survey_sampling', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Uses of Statistics', 'questionnaire_design', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Uses of Statistics', 'probability_sampling', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Uses of Statistics', 'validity', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Uses of Statistics', 'reliability', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Further Applications
('Further Applications', 'financial_problems', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'data_analysis', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'Ptolemy_Theorem', 'master_tag', 'master', (SELECT id FROM profiles LIMit 1)),
('Further Applications', 'linear_correlation', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'Fibonacci', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'Golden_Ratio', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'cryptography', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'Ceva_Theorem', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Further Applications', 'mathematical_games', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),

-- Inquiry and Investigation
('Inquiry and Investigation', 'discovery_learning', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Inquiry and Investigation', 'mathematical_communication', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Inquiry and Investigation', 'reasoning', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1)),
('Inquiry and Investigation', 'conceptual_understanding', 'master_tag', 'master', (SELECT id FROM profiles LIMIT 1));

-- Create a function to copy master tags to actual content
CREATE OR REPLACE FUNCTION apply_master_tags_to_content(
    content_type_param VARCHAR(50),
    content_id_param TEXT,
    topic_param VARCHAR(100),
    tag_param VARCHAR(50),
    user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if master tag exists
    IF NOT EXISTS (
        SELECT 1 FROM topic_tags
        WHERE topic = topic_param
        AND tag = tag_param
        AND content_type = 'master_tag'
    ) THEN
        RAISE EXCEPTION 'Master tag "%" - "%" does not exist', topic_param, tag_param;
    END IF;

    -- Apply tag to content
    INSERT INTO topic_tags (topic, tag, content_type, content_id, created_by)
    VALUES (topic_param, tag_param, content_type_param, content_id_param, user_id_param)
    ON CONFLICT (topic, tag, content_type, content_id) DO NOTHING;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all available master tags
CREATE OR REPLACE FUNCTION get_master_tags()
RETURNS TABLE (
    topic VARCHAR(100),
    tag VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tt.topic,
        tt.tag
    FROM topic_tags tt
    WHERE tt.content_type = 'master_tag'
    AND tt.is_active = true
    ORDER BY tt.topic, tt.tag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION apply_master_tags_to_content(VARCHAR(50), TEXT, VARCHAR(100), VARCHAR(50), UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_master_tags() TO authenticated;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ Master tags populated successfully!';
    RAISE NOTICE 'Total master tags created: %', (SELECT COUNT(*) FROM topic_tags WHERE content_type = 'master_tag');
    RAISE NOTICE '';
    RAISE NOTICE 'Usage examples:';
    RAISE NOTICE '1. Get all available tags: SELECT * FROM get_master_tags();';
    RAISE NOTICE '2. Apply tag to math paper: SELECT apply_master_tags_to_content(''math_paper'', ''123'', ''Quadratic Equations'', ''factor_method'');';
    RAISE NOTICE '3. Apply tag to quiz question: SELECT apply_master_tags_to_content(''quiz_question'', ''uuid-456'', ''Functions and Graphs'', ''domain'');';
END $$;
