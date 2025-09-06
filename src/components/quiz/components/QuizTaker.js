import React, { useState, useEffect } from 'react';
import {
    Container, Box, Paper, Typography, Button, Radio, RadioGroup,
    FormControlLabel, FormControl, FormLabel, LinearProgress, Chip,
    IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { NavigateBefore, NavigateNext, Timer, PlayArrow, Pause, Stop } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import quizService from '../services/quizService';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const QuizTaker = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const result = await quizService.getQuizById(quizId);
                if (result.error) throw result.error;
                setQuiz(result.data);
                setTimeRemaining(result.data.time_limit_minutes * 60);
                setLoading(false);
            } catch (err) {
                setError('Failed to load quiz');
                setLoading(false);
            }
        };
        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (!isStarted || isPaused || timeRemaining <= 0) return;
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
    }, [isStarted, isPaused, timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleStartQuiz = () => setIsStarted(true);
    const handlePauseQuiz = () => setIsPaused(!isPaused);
    const handleSubmitQuiz = () => setShowSubmitDialog(true);

    const handleConfirmSubmit = () => {
        setShowSubmitDialog(false);
        navigate(`/quiz/${quizId}/results`, {
            state: { answers, quiz, timeTaken: quiz.time_limit_minutes * 60 - timeRemaining }
        });
    };

    const getProgressPercentage = () => {
        if (!quiz) return 0;
        const answeredCount = Object.keys(answers).length;
        return (answeredCount / (quiz.questions?.length || 0)) * 100;
    };

    const getCurrentQuestion = () => {
        if (!quiz?.questions) return null;
        return quiz.questions[currentQuestionIndex];
    };

    const renderWithLaTeX = (text) => {
        if (!text) return '';
        const parts = text.split(/(\$[^$]+\$)/);
        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                const math = part.slice(1, -1);
                return <InlineMath key={index} math={math} />;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const renderDiagram = (diagramContent) => {
        if (!diagramContent) return null;

        if (diagramContent.includes('<iframe')) {
            return (
                <Box sx={{ width: '100%', height: '300px', overflow: 'hidden', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
                    <div dangerouslySetInnerHTML={{ __html: diagramContent }} />
                </Box>
            );
        }

        if (diagramContent.includes('geogebra.org/m/')) {
            const materialId = diagramContent.split('/m/')[1];
            return (
                <Box sx={{ width: '100%', height: '300px', overflow: 'hidden', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
                    <iframe
                        scrolling="no"
                        title="GeoGebra Diagram"
                        src={`https://www.geogebra.org/material/iframe/id/${materialId}/width/100%/height/300/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`}
                        width="100%"
                        height="300px"
                        style={{ border: '0px' }}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    />
                </Box>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LinearProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Loading quiz...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!quiz) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">Quiz not found</Alert>
            </Container>
        );
    }

    const currentQuestion = getCurrentQuestion();
    const progressPercentage = getProgressPercentage();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Quiz Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {quiz.title}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {quiz.description}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isStarted && (
                            <>
                                <Chip
                                    icon={<Timer />}
                                    label={formatTime(timeRemaining)}
                                    color={timeRemaining < 300 ? 'error' : 'default'}
                                    variant="outlined"
                                    sx={{ color: 'white', borderColor: 'white' }}
                                />

                                <IconButton onClick={handlePauseQuiz} sx={{ color: 'white' }}>
                                    {isPaused ? <PlayArrow /> : <Pause />}
                                </IconButton>
                            </>
                        )}

                        {!isStarted ? (
                            <Button
                                variant="contained"
                                startIcon={<PlayArrow />}
                                onClick={handleStartQuiz}
                                sx={{ bgcolor: 'white', color: 'primary.main' }}
                            >
                                Start Quiz
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Stop />}
                                onClick={handleSubmitQuiz}
                                color="error"
                                sx={{ bgcolor: 'white', color: 'error.main' }}
                            >
                                Submit Quiz
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Progress Bar */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Progress: {Object.keys(answers).length} / {quiz.questions?.length || 0} questions answered
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {Math.round(progressPercentage)}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Paper>

            {/* Question Navigation */}
            {isStarted && (
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            startIcon={<NavigateBefore />}
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        <Typography variant="body1">
                            Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}
                        </Typography>

                        <Button
                            endIcon={<NavigateNext />}
                            onClick={handleNextQuestion}
                            disabled={currentQuestionIndex === (quiz.questions?.length || 0) - 1}
                        >
                            Next
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Question Display */}
            {isStarted && currentQuestion && (
                <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                    {/* Question Text */}
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        {renderWithLaTeX(currentQuestion.question)}
                    </Typography>

                    {/* Question Diagram - Fixed overflow */}
                    {currentQuestion.question_diagram && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                Question Diagram:
                            </Typography>
                            {renderDiagram(currentQuestion.question_diagram)}
                        </Box>
                    )}

                    {/* Multiple Choice Options */}
                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <FormLabel component="legend" sx={{ mb: 2 }}>
                            Select your answer:
                        </FormLabel>
                        <RadioGroup
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                        >
                            {['A', 'B', 'C', 'D'].map((option) => (
                                <FormControlLabel
                                    key={option}
                                    value={option}
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '30px' }}>
                                                {option})
                                            </Typography>
                                            <Typography variant="body1">
                                                {renderWithLaTeX(currentQuestion[`option_${option.toLowerCase()}`])}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: answers[currentQuestion.id] === option ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        bgcolor: answers[currentQuestion.id] === option ? 'primary.50' : 'background.paper',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    {/* Option Diagrams */}
                    {['A', 'B', 'C', 'D'].map((option) => {
                        const diagramKey = `option_${option.toLowerCase()}_diagram`;
                        if (currentQuestion[diagramKey]) {
                            return (
                                <Box key={option} sx={{ mt: 2, mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Diagram for option {option}:
                                    </Typography>
                                    {renderDiagram(currentQuestion[diagramKey])}
                                </Box>
                            );
                        }
                        return null;
                    })}
                </Paper>
            )}

            {/* Submit Quiz Dialog */}
            <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Submit Quiz?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Questions answered: {Object.keys(answers).length} / {quiz.questions?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Time remaining: {formatTime(timeRemaining)}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSubmitDialog(false)}>Continue Quiz</Button>
                    <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
                        Submit Quiz
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Instructions for non-started state */}
            {!isStarted && (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Ready to start?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        This quiz contains {quiz.questions?.length || 0} questions and you have {quiz.time_limit_minutes} minutes to complete it.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={handleStartQuiz}
                    >
                        Start Quiz Now
                    </Button>
                </Paper>
            )}
        </Container>
    );
};

export default QuizTaker;
