/**
 * Quiz Taker Component
 * Handles taking quizzes with randomized questions and answer options
 */

import React, { useEffect, useCallback } from 'react';
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
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useAuth, useQuiz } from '../../../store/hooks';
import {
    initializeQuiz,
    submitQuiz,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    setAnswer,
    setTimeRemaining,
    setIsSubmitting,
    setError,
    clearError
} from '../../../store/slices/quizSlice';

const QuizTaker = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get test data from navigation state
    const { test, isPractice = false } = location.state || {};

    // Redux state and dispatch
    const {
        currentTest,
        currentQuestionIndex,
        answers,
        timeRemaining,
        isSubmitting,
        error,
        quizStarted,
        dispatch
    } = useQuiz();

    // Initialize quiz
    useEffect(() => {
        if (!test) {
            navigate('/dashboard');
            return;
        }

        // Initialize quiz with Redux
        dispatch(initializeQuiz({ ...test, isPractice }));
    }, [test, isPractice, navigate, dispatch]);

    const handleSubmitQuiz = useCallback(async () => {
        if (isSubmitting) return;

        try {
            dispatch(setIsSubmitting(true));
            dispatch(clearError());

            // Submit quiz using Redux action
            const result = await dispatch(submitQuiz({
                test: currentTest,
                answers,
                userId: user.id,
                timeRemaining
            }));

            console.log('QuizTaker - Submit result:', result);

            if (result.error) {
                dispatch(setError(result.error));
                return;
            }

            // Navigate to results with attempt data
            const attemptData = result.payload?.results;
            const attemptId = attemptData?.id;

            console.log('QuizTaker - Navigating with:', { attemptId, attemptData });

            // Create a comprehensive results object for the results page
            const resultsData = {
                test: currentTest,
                isPractice,
                attemptId,
                attemptData,
                // Also include calculated results as fallback
                calculatedResults: {
                    score: result.payload?.score || 0,
                    percentage: result.payload?.percentage || 0,
                    correctAnswers: result.payload?.correctAnswers || 0,
                    totalQuestions: result.payload?.totalQuestions || 0,
                    timeUsed: result.payload?.timeUsed || 0,
                    answers: answers
                }
            };

            console.log('QuizTaker - Full results data:', resultsData);

            navigate('/quiz/results', {
                state: resultsData
            });

        } catch (err) {
            dispatch(setError(err.message || 'Failed to submit quiz'));
            console.error('Error submitting quiz:', err);
        } finally {
            dispatch(setIsSubmitting(false));
        }
    }, [isSubmitting, currentTest, answers, timeRemaining, user, navigate, isPractice, dispatch]);

    // Timer effect
    useEffect(() => {
        if (!quizStarted || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            dispatch(setTimeRemaining(timeRemaining - 1));
            if (timeRemaining <= 1) {
                handleSubmitQuiz();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, timeRemaining, handleSubmitQuiz, dispatch]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionIndex, answer) => {
        dispatch(setAnswer({ questionIndex, answer }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < currentTest?.questions.length - 1) {
            dispatch(nextQuestion());
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            dispatch(previousQuestion());
        }
    };


    const getProgress = () => {
        return ((currentQuestionIndex + 1) / (currentTest?.questions.length || 1)) * 100;
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(answer => answer !== null).length;
    };

    // Helper function to render text with LaTeX
    const renderWithLaTeX = (text) => {
        if (!text) return '';

        try {
            // First, split by newlines to handle line breaks
            const lines = text.split('\n');

            return lines.map((line, lineIndex) => {
                // Split each line by LaTeX delimiters
                const parts = line.split(/(\$[^$]+\$)/);

                const lineContent = parts.map((part, partIndex) => {
                    if (part.startsWith('$') && part.endsWith('$')) {
                        // Inline math: $...$
                        const math = part.slice(1, -1);
                        try {
                            return <InlineMath key={`${lineIndex}-${partIndex}`} math={math} />;
                        } catch (error) {
                            console.warn('KaTeX rendering error:', error);
                            return <span key={`${lineIndex}-${partIndex}`} style={{ color: 'red' }}>{part}</span>;
                        }
                    } else {
                        // Regular text
                        return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
                    }
                });

                // Return each line as a div with proper line break
                return (
                    <div key={lineIndex} style={{ marginBottom: lineIndex < lines.length - 1 ? '0.5em' : '0' }}>
                        {lineContent}
                    </div>
                );
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

    // Show loading state while quiz is being initialized
    if (!currentTest || !currentTest.questions || currentTest.questions.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Loading quiz...
                    </Typography>
                </Box>
            </Container>
        );
    }

    const currentQuestion = currentTest.questions[currentQuestionIndex];

    // Additional safety check for current question
    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    Question not found. Please try refreshing the page or start a new quiz.
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>

            {/* Progress Bar */}
            <LinearProgress
                variant="determinate"
                value={getProgress()}
                sx={{ height: 4 }}
            />

            {/* Main Content */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                        {typeof error === 'string' ? error : error?.message || 'An error occurred'}
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
                                                <Typography variant="body1" component="div">
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
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: { xs: 2, sm: 0 }
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        size="small"
                        sx={{
                            minWidth: { xs: 'auto', sm: 'auto' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                    >
                        Previous
                    </Button>

                    <Box sx={{
                        display: 'flex',
                        gap: { xs: 0.5, sm: 1 },
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        maxWidth: { xs: '100%', sm: 'auto' },
                        overflowX: { xs: 'auto', sm: 'visible' },
                        pb: { xs: 1, sm: 0 }
                    }}>
                        {currentTest?.questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => dispatch(setCurrentQuestionIndex(index))}
                                sx={{
                                    minWidth: { xs: 32, sm: 40 },
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    height: { xs: 32, sm: 36 }
                                }}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </Box>

                    {currentQuestionIndex === (currentTest?.questions.length || 0) - 1 ? (
                        <Button
                            variant="contained"
                            endIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircle />}
                            onClick={handleSubmitQuiz}
                            disabled={isSubmitting}
                            size="small"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            endIcon={<ArrowForward />}
                            onClick={handleNextQuestion}
                            size="small"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            Next
                        </Button>
                    )}
                </Box>

                {/* Quick Stats */}
                <Paper sx={{ p: 2, mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Progress
                            </Typography>
                            <Typography variant="h6">
                                {Math.round(getProgress())}%
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Answered
                            </Typography>
                            <Typography variant="h6">
                                {getAnsweredCount()}/{currentTest?.questions.length}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Time Left
                            </Typography>
                            <Typography variant="h6">
                                {formatTime(timeRemaining)}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
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