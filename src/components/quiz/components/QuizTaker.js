/**
 * Quiz Taker Component
 * Handles taking quizzes with randomized questions and answer options
 */

import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    LinearProgress,
    Alert,
    CircularProgress,
    AppBar,
    Toolbar,
    IconButton,
    Chip,
    Grid,
    Paper
} from '@mui/material';
import {
    ArrowBack,
    ArrowForward,
    CheckCircle,
    Timer,
    Quiz
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AuthContext from '../../../contexts/AuthContext';
import randomizedQuizService from '../services/randomizedQuizService';

const QuizTaker = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Get test data from navigation state
    const { test, isPractice = false } = location.state || {};

    // State management
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);

    // Initialize quiz
    useEffect(() => {
        if (!test) {
            navigate('/dashboard');
            return;
        }

        setQuizStarted(true);
        // Initialize answers object
        const initialAnswers = {};
        test.questions.forEach((question, index) => {
            initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
    }, [test, navigate]);

    // Timer effect
    useEffect(() => {
        if (!quizStarted || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, timeRemaining]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError(null);

            // Calculate score
            let correctAnswers = 0;
            const quizAnswers = [];

            test.questions.forEach((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correct_answer;

                if (isCorrect) {
                    correctAnswers++;
                }

                quizAnswers.push({
                    question_id: question.id,
                    selected_answer: userAnswer,
                    is_correct: isCorrect
                });
            });

            const percentage = Math.round((correctAnswers / test.questions.length) * 100);

            // Create attempt data
            const attemptData = {
                user_id: user?.id,
                quiz_id: test.id,
                score: correctAnswers,
                max_score: test.questions.length,
                percentage: percentage,
                time_taken_seconds: (30 * 60) - timeRemaining,
                answers: quizAnswers,
                completed_at: new Date().toISOString(),
                is_completed: true
            };

            // Submit attempt
            if (user) {
                await randomizedQuizService.submitQuizAttempt(attemptData, test.questions);
            }

            // Navigate to results
            navigate('/quiz/results', {
                state: {
                    test,
                    attemptData,
                    isPractice
                }
            });

        } catch (err) {
            setError(err.message || 'Failed to submit quiz');
            console.error('Error submitting quiz:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getProgress = () => {
        return ((currentQuestionIndex + 1) / test.questions.length) * 100;
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(answer => answer !== null).length;
    };

    // Helper function to render text with LaTeX
    const renderWithLaTeX = (text) => {
        if (!text) return '';

        try {
            // Split text by LaTeX delimiters - using simpler pattern that works
            const parts = text.split(/(\$[^$]+\$)/);

            return parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    // Inline math: $...$
                    const math = part.slice(1, -1);
                    try {
                        return <InlineMath key={index} math={math} />;
                    } catch (error) {
                        console.warn('KaTeX rendering error:', error);
                        return <span key={index} style={{ color: 'red' }}>{part}</span>;
                    }
                } else {
                    // Regular text
                    return <span key={index}>{part}</span>;
                }
            });
        } catch (error) {
            console.warn('LaTeX parsing error:', error);
            return <span>{text}</span>;
        }
    };

    if (!test) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    No quiz data found. Please start a quiz from the dashboard.
                </Alert>
            </Container>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            {/* Header */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar>
                    <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Quiz sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h1" color="primary" fontWeight="bold">
                            {test.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Question {currentQuestionIndex + 1} of {test.questions.length}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            icon={<Timer />}
                            label={formatTime(timeRemaining)}
                            color={timeRemaining < 300 ? 'error' : 'primary'}
                            variant="outlined"
                        />
                        <Chip
                            label={`${getAnsweredCount()}/${test.questions.length} answered`}
                            color="info"
                            variant="outlined"
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Progress Bar */}
            <LinearProgress
                variant="determinate"
                value={getProgress()}
                sx={{ height: 4 }}
            />

            {/* Main Content */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Question Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                            {renderWithLaTeX(currentQuestion.question)}
                        </Typography>

                        {/* Question Diagram */}
                        {currentQuestion.question_diagram && (
                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                <div dangerouslySetInnerHTML={{ __html: currentQuestion.question_diagram }} />
                            </Box>
                        )}

                        {/* Answer Options */}
                        <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                                value={answers[currentQuestionIndex] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                            >
                                {['A', 'B', 'C', 'D'].map((option) => (
                                    <FormControlLabel
                                        key={option}
                                        value={option}
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="body1">
                                                    {renderWithLaTeX(currentQuestion[`option_${option.toLowerCase()}`])}
                                                </Typography>
                                                {currentQuestion[`option_${option.toLowerCase()}_diagram`] && (
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: currentQuestion[`option_${option.toLowerCase()}_diagram`]
                                                    }} />
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {test.questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setCurrentQuestionIndex(index)}
                                sx={{ minWidth: 40 }}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </Box>

                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <Button
                            variant="contained"
                            endIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircle />}
                            onClick={handleSubmitQuiz}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            endIcon={<ArrowForward />}
                            onClick={handleNextQuestion}
                        >
                            Next
                        </Button>
                    )}
                </Box>

                {/* Quick Stats */}
                <Paper sx={{ p: 2, mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                                Progress
                            </Typography>
                            <Typography variant="h6">
                                {Math.round(getProgress())}%
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                                Answered
                            </Typography>
                            <Typography variant="h6">
                                {getAnsweredCount()}/{test.questions.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                                Time Left
                            </Typography>
                            <Typography variant="h6">
                                {formatTime(timeRemaining)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                                Type
                            </Typography>
                            <Typography variant="h6">
                                {isPractice ? 'Practice' : 'Quiz'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default QuizTaker;