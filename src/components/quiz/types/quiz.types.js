/**
 * Quiz Module Type Definitions
 * These define the data structures used throughout the quiz system
 */

// Question Types
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    NUMERIC: 'numeric',
    TEXT: 'text'
};

export const DIFFICULTY_LEVELS = {
    BEGINNER: 1,
    EASY: 2,
    MEDIUM: 3,
    HARD: 4,
    EXPERT: 5
};

export const DIFFICULTY_LABELS = {
    1: 'Beginner',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Expert'
};

// Question Structure
export const Question = {
    id: null,
    tags: [],
    question: '',
    question_diagram: null,
    option_a: '',
    option_a_diagram: null,
    option_b: '',
    option_b_diagram: null,
    option_c: '',
    option_c_diagram: null,
    option_d: '',
    option_d_diagram: null,
    correct_answer: null,
    solution: '',
    solution_diagram: null,
    difficulty_level: DIFFICULTY_LEVELS.MEDIUM,
    subject_area: '',
    created_at: null,
    updated_at: null,
    created_by: null,
    is_active: true
};

// Quiz Structure
export const Quiz = {
    id: null,
    title: '',
    description: '',
    attempt_count: 0,
    pass_rate: 0.00,
    questions: [],
    tags: [],
    time_limit_minutes: 30,
    passing_score: 70,
    is_public: false,
    created_at: null,
    updated_at: null,
    created_by: null,
    is_active: true
};

// Quiz Attempt Structure
export const QuizAttempt = {
    id: null,
    user_id: null,
    quiz_id: null,
    score: 0,
    max_score: 0,
    percentage: 0.00,
    time_taken_seconds: 0,
    answers: {},
    started_at: null,
    completed_at: null,
    is_completed: false
};

// Quiz Result Structure
export const QuizResult = {
    id: null,
    attempt_id: null,
    question_id: null,
    user_answer: null,
    is_correct: false,
    time_spent_seconds: 0,
    created_at: null
};

// User Answer Structure
export const UserAnswer = {
    question_id: null,
    selected_option: null,
    time_spent: 0,
    is_correct: false
};

// Quiz Session State
export const QuizSession = {
    current_question_index: 0,
    answers: {},
    time_remaining: 0,
    is_paused: false,
    start_time: null
};

// Quiz Statistics
export const QuizStats = {
    total_questions: 0,
    answered_questions: 0,
    correct_answers: 0,
    current_score: 0,
    max_possible_score: 0,
    percentage_complete: 0,
    time_elapsed: 0
};

// GeoGebra Diagram Structure
export const GeoGebraDiagram = {
    url: '',
    width: '100%',
    height: '400px',
    allow_scale: true,
    show_toolbar: false,
    show_menu: false,
    show_algebra_input: false,
    show_reset_icon: false,
    enable_label_drags: false,
    enable_shift_drag_zoom: false,
    enable_right_click: false,
    show_zoom_buttons: false
};

// Quiz Filter Options
export const QuizFilters = {
    subject_area: '',
    difficulty_level: null,
    tags: [],
    is_public: null,
    created_by: null,
    min_questions: 0,
    max_questions: null,
    time_limit_min: 0,
    time_limit_max: null
};

// Quiz Sort Options
export const QuizSortOptions = {
    TITLE_ASC: 'title_asc',
    TITLE_DESC: 'title_desc',
    CREATED_ASC: 'created_asc',
    CREATED_DESC: 'created_desc',
    DIFFICULTY_ASC: 'difficulty_asc',
    DIFFICULTY_DESC: 'difficulty_desc',
    POPULARITY: 'popularity',
    PASS_RATE: 'pass_rate'
};

// Quiz Creation/Edit Form State
export const QuizFormState = {
    title: '',
    description: '',
    tags: [],
    time_limit_minutes: 30,
    passing_score: 70,
    is_public: false,
    questions: [],
    selected_questions: [],
    available_questions: []
};

// Question Creation/Edit Form State
export const QuestionFormState = {
    question: '',
    question_diagram: null,
    option_a: '',
    option_a_diagram: null,
    option_b: '',
    option_b_diagram: null,
    option_c: '',
    option_c_diagram: null,
    option_d: '',
    option_d_diagram: null,
    correct_answer: null,
    solution: '',
    solution_diagram: null,
    difficulty_level: DIFFICULTY_LEVELS.MEDIUM,
    subject_area: '',
    tags: []
};

// Quiz Progress Tracking
export const QuizProgress = {
    quiz_id: null,
    user_id: null,
    current_question: 0,
    total_questions: 0,
    answered_questions: 0,
    correct_answers: 0,
    time_elapsed: 0,
    time_remaining: 0,
    is_completed: false,
    score: 0,
    max_score: 0,
    percentage: 0
};

// Quiz Analytics
export const QuizAnalytics = {
    total_attempts: 0,
    unique_users: 0,
    average_score: 0,
    average_time: 0,
    pass_rate: 0,
    question_analysis: [],
    user_performance: [],
    time_distribution: []
};

// Export all types for easy importing
const quizTypes = {
    Question,
    Quiz,
    QuizAttempt,
    QuizResult,
    UserAnswer,
    QuizSession,
    QuizStats,
    GeoGebraDiagram,
    QuizFilters,
    QuizSortOptions,
    QuizFormState,
    QuestionFormState,
    QuizProgress,
    QuizAnalytics,
    QUESTION_TYPES,
    DIFFICULTY_LEVELS,
    DIFFICULTY_LABELS
};

export default quizTypes;
