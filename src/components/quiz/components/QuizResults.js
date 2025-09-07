/**
 * Quiz Results Component
 * Displays quiz results and performance analysis
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    Alert,
    AppBar,
    Toolbar,
    IconButton,
    Paper,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack,
    CheckCircle,
    Cancel,
    Timer,
    Quiz,
    TrendingUp,
    School
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import randomizedQuizService from '../services/randomizedQuizService';

const QuizResults = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get results data from navigation state
    const { test, attemptData, isPractice = false, attemptId } = location.state || {};

    // State for loading attempt data
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadedTest, setLoadedTest] = useState(test);
    const [loadedAttemptData, setLoadedAttemptData] = useState(attemptData);

    // Load attempt data if only attemptId is provided
    useEffect(() => {
        const loadAttemptData = async () => {
            console.log('QuizResults useEffect - attemptId:', attemptId);
            console.log('QuizResults useEffect - test:', test);
            console.log('QuizResults useEffect - attemptData:', attemptData);

            if (attemptId && !attemptData) {
                try {
                    setLoading(true);
                    setError(null);

                    console.log('Loading quiz results for attemptId:', attemptId);
                    const results = await randomizedQuizService.getQuizResults(attemptId);
                    console.log('Quiz results loaded:', results);

                    // Transform the data to match the expected format
                    const transformedTest = {
                        ...results.quiz,
                        questions: results.questions
                    };

                    const transformedAttemptData = {
                        ...results.attempt,
                        answers: results.attempt.answers || []
                    };

                    console.log('Transformed test:', transformedTest);
                    console.log('Transformed attempt data:', transformedAttemptData);

                    setLoadedTest(transformedTest);
                    setLoadedAttemptData(transformedAttemptData);
                } catch (err) {
                    console.error('Error loading quiz results:', err);
                    setError(`Failed to load quiz results: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadAttemptData();
    }, [attemptId, test, attemptData]);

    // Show loading state
    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">Loading quiz results...</Typography>
            </Container>
        );
    }

    // Show error state
    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </Container>
        );
    }

    // Use loaded data or fallback to state data
    const finalTest = loadedTest || test;
    const finalAttemptData = loadedAttemptData || attemptData;

    if (!finalTest || !finalAttemptData) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    No results data found. Please complete a quiz first.
                </Alert>
            </Container>
        );
    }

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const getScoreLabel = (percentage) => {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 80) return 'Good';
        if (percentage >= 70) return 'Satisfactory';
        if (percentage >= 60) return 'Needs Improvement';
        return 'Poor';
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                            Quiz Results
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {finalTest.title}
                        </Typography>
                    </Box>
                    <Chip
                        label={isPractice ? 'Practice Quiz' : 'Quiz'}
                        color="info"
                        variant="outlined"
                    />
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Score Summary */}
                <Card sx={{ mb: 4 }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                            {finalAttemptData.percentage}%
                        </Typography>
                        <Typography variant="h5" color={getScoreColor(finalAttemptData.percentage)} sx={{ mb: 3 }}>
                            {getScoreLabel(finalAttemptData.percentage)}
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Score
                                    </Typography>
                                    <Typography variant="h6">
                                        {finalAttemptData.score}/{finalAttemptData.max_score}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Time Taken
                                    </Typography>
                                    <Typography variant="h6">
                                        {formatTime(finalAttemptData.time_taken_seconds)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Questions
                                    </Typography>
                                    <Typography variant="h6">
                                        {finalTest.questions.length}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Type
                                    </Typography>
                                    <Typography variant="h6">
                                        {isPractice ? 'Practice' : 'Quiz'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <LinearProgress
                            variant="determinate"
                            value={finalAttemptData.percentage}
                            color={getScoreColor(finalAttemptData.percentage)}
                            sx={{ height: 8, borderRadius: 4, mb: 3 }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<School />}
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </Button>
                            {isPractice && (
                                <Button
                                    variant="outlined"
                                    startIcon={<Quiz />}
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Take Another Practice Quiz
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* Question Review */}
                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                            Question Review
                        </Typography>

                        {finalTest.questions.map((question, index) => {
                            const userAnswer = finalAttemptData.answers[index]?.selected_answer;
                            const isCorrect = finalAttemptData.answers[index]?.is_correct;

                            return (
                                <Paper key={question.id} sx={{ p: 3, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ mr: 2 }}>
                                            Question {index + 1}
                                        </Typography>
                                        {isCorrect ? (
                                            <Chip
                                                icon={<CheckCircle />}
                                                label="Correct"
                                                color="success"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip
                                                icon={<Cancel />}
                                                label="Incorrect"
                                                color="error"
                                                size="small"
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {renderWithLaTeX(question.question)}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Your Answer:
                                            </Typography>
                                            <Typography variant="body1" color={isCorrect ? 'success.main' : 'error.main'}>
                                                {userAnswer ? `${userAnswer}. ` : 'No answer'}{userAnswer ? renderWithLaTeX(question[`option_${userAnswer.toLowerCase()}`]) : ''}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Correct Answer:
                                            </Typography>
                                            <Typography variant="body1" color="success.main">
                                                {question.correct_answer}. {renderWithLaTeX(question[`option_${question.correct_answer.toLowerCase()}`])}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {question.solution && (
                                        <>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Solution:
                                            </Typography>
                                            <Typography variant="body1">
                                                {renderWithLaTeX(question.solution)}
                                            </Typography>
                                        </>
                                    )}
                                </Paper>
                            );
                        })}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default QuizResults;
