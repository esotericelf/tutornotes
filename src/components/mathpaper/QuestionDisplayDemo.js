import React, { useState } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { CheckCircle, Visibility, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const QuestionDisplayDemo = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showSolution, setShowSolution] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    const quizQuestions = [
        {
            id: 1,
            question: "What is the derivative of $f(x) = x^3 + 2x^2 - 5x + 1$?",
            option_a: "$3x^2 + 4x - 5$",
            option_b: "$3x^2 + 2x - 5$",
            option_c: "$x^2 + 4x - 5$",
            option_d: "$3x^2 + 4x + 5$",
            correct_answer: 'A',
            solution: "Using the power rule: $\\frac{d}{dx}(x^3) = 3x^2$, $\\frac{d}{dx}(2x^2) = 4x$, $\\frac{d}{dx}(-5x) = -5$, $\\frac{d}{dx}(1) = 0$. Therefore, $f'(x) = 3x^2 + 4x - 5$."
        },
        {
            id: 2,
            question: "Solve for $x$: $2x + 5 = 13$",
            option_a: "$x = 4$",
            option_b: "$x = 3$",
            option_c: "$x = 9$",
            option_d: "$x = 6$",
            correct_answer: 'A',
            solution: "Subtract 5 from both sides: $2x = 13 - 5 = 8$. Then divide by 2: $x = \\frac{8}{2} = 4$."
        },
        {
            id: 3,
            question: "What is the value of $\\sin(30°)$?",
            option_a: "$\\frac{1}{2}$",
            option_b: "$\\frac{\\sqrt{2}}{2}$",
            option_c: "$\\frac{\\sqrt{3}}{2}$",
            option_d: "$1$",
            correct_answer: 'A',
            solution: "From the unit circle, $\\sin(30°) = \\frac{1}{2}$. This is a standard trigonometric value."
        },
        {
            id: 4,
            question: "Find the area of a circle with radius $r = 5$ cm.",
            option_a: "$25\\pi$ cm²",
            option_b: "$10\\pi$ cm²",
            option_c: "$50\\pi$ cm²",
            option_d: "$5\\pi$ cm²",
            correct_answer: 'A',
            solution: "The area of a circle is $A = \\pi r^2$. With $r = 5$: $A = \\pi \\times 5^2 = \\pi \\times 25 = 25\\pi$ cm²."
        },
        {
            id: 5,
            question: "What is the slope of the line $y = 3x - 2$?",
            option_a: "$3$",
            option_b: "$-2$",
            option_c: "$2$",
            option_d: "$-3$",
            correct_answer: 'A',
            solution: "In the slope-intercept form $y = mx + b$, the slope is $m$. For $y = 3x - 2$, the slope is $3$."
        },
        {
            id: 6,
            question: "Evaluate $\\log_2(8)$",
            option_a: "$3$",
            option_b: "$2$",
            option_c: "$4$",
            option_d: "$1$",
            correct_answer: 'A',
            solution: "We need to find what power of 2 gives 8. Since $2^3 = 8$, we have $\\log_2(8) = 3$."
        },
        {
            id: 7,
            question: "What is the vertex of the parabola $y = (x-2)^2 + 3$?",
            option_a: "$(2, 3)$",
            option_b: "$(-2, 3)$",
            option_c: "$(2, -3)$",
            option_d: "$(-2, -3)$",
            correct_answer: 'A',
            solution: "In vertex form $y = a(x-h)^2 + k$, the vertex is at $(h, k)$. For $y = (x-2)^2 + 3$, the vertex is at $(2, 3)$."
        },
        {
            id: 8,
            question: "Solve the quadratic equation $x^2 - 5x + 6 = 0$",
            option_a: "$x = 2$ or $x = 3$",
            option_b: "$x = 1$ or $x = 6$",
            option_c: "$x = -2$ or $x = -3$",
            option_d: "$x = 0$ or $x = 5$",
            correct_answer: 'A',
            solution: "Factoring: $x^2 - 5x + 6 = (x-2)(x-3) = 0$. Therefore, $x = 2$ or $x = 3$."
        },
        {
            id: 9,
            question: "What is the integral of $\\int 2x \\, dx$?",
            option_a: "$x^2 + C$",
            option_b: "$2x^2 + C$",
            option_c: "$x + C$",
            option_d: "$2x + C$",
            correct_answer: 'A',
            solution: "Using the power rule for integration: $\\int 2x \\, dx = 2 \\cdot \\frac{x^2}{2} + C = x^2 + C$."
        },
        {
            id: 10,
            question: "In a right triangle with legs of length 3 and 4, what is the length of the hypotenuse?",
            option_a: "$5$",
            option_b: "$7$",
            option_c: "$12$",
            option_d: "$25$",
            correct_answer: 'A',
            solution: "Using the Pythagorean theorem: $c^2 = a^2 + b^2 = 3^2 + 4^2 = 9 + 16 = 25$. Therefore, $c = \\sqrt{25} = 5$."
        }
    ];

    const handleAnswerSelect = (event) => {
        const newAnswers = { ...answers, [currentQuestion]: event.target.value };
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Check for blank answers before final submission
            const blankAnswers = quizQuestions.filter((_, index) => !answers[index]);
            if (blankAnswers.length > 0) {
                setShowSubmitDialog(true);
            } else {
                setShowSolution(true);
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleConfirmSubmit = () => {
        setShowSubmitDialog(false);
        setShowSolution(true);
    };

    const handleCancelSubmit = () => {
        setShowSubmitDialog(false);
    };

    const getScore = () => {
        let correct = 0;
        quizQuestions.forEach((question, index) => {
            if (answers[index] === question.correct_answer) {
                correct++;
            }
        });
        return { correct, total: quizQuestions.length };
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


    if (showSolution) {
        const score = getScore();
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Results Header */}
                <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Quiz Complete!
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                            </Typography>
                        </Box>
                        <Chip
                            label="Demo Quiz"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        />
                    </Box>
                </Paper>

                {/* Results for each question */}
                {quizQuestions.map((question, index) => (
                    <Paper key={question.id} elevation={3} sx={{ p: 4, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color="primary">
                                Question {index + 1}
                            </Typography>
                            <Chip
                                label={answers[index] === question.correct_answer ? "Correct" : "Incorrect"}
                                color={answers[index] === question.correct_answer ? "success" : "error"}
                                icon={answers[index] === question.correct_answer ? <CheckCircle /> : <Visibility />}
                            />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Your answer: {answers[index] || "Not answered"} |
                            Correct answer: {question.correct_answer}
                        </Typography>

                        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                            {renderWithLaTeX(question.question)}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                            {renderWithLaTeX(question.solution)}
                        </Typography>
                    </Paper>
                ))}
            </Container>
        );
    }

    const currentQ = quizQuestions[currentQuestion];
    const blankAnswers = quizQuestions.filter((_, index) => !answers[index]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Mathematics Quiz Demo
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Question {currentQuestion + 1} of {quizQuestions.length}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                            label="Demo"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        />
                        <Chip
                            label="Mathematics"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        />
                    </Box>
                </Box>
            </Paper>

            {/* Progress Stepper */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Stepper activeStep={currentQuestion} alternativeLabel>
                    {quizQuestions.map((_, index) => (
                        <Step key={index}>
                            <StepLabel>
                                {answers[index] ? "✓" : `${index + 1}`}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Question Display */}
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                {/* Question Text */}
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    {renderWithLaTeX(currentQ.question)}
                </Typography>

                {/* Multiple Choice Options */}
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                        value={answers[currentQuestion] || ''}
                        onChange={handleAnswerSelect}
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
                                            {renderWithLaTeX(currentQ[`option_${option.toLowerCase()}`])}
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: answers[currentQuestion] === option ? 'primary.main' : 'divider',
                                    borderRadius: 1,
                                    bgcolor: answers[currentQuestion] === option ? 'primary.50' : 'background.paper',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Paper>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<NavigateBefore />}
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                >
                    Previous
                </Button>

                <Button
                    variant="contained"
                    endIcon={currentQuestion === quizQuestions.length - 1 ? <CheckCircle /> : <NavigateNext />}
                    onClick={handleNext}
                >
                    {currentQuestion === quizQuestions.length - 1 ? 'Submit Quiz' : 'Next'}
                </Button>
            </Box>

            {/* Blank Answers Alert Dialog */}
            <Dialog open={showSubmitDialog} onClose={handleCancelSubmit} maxWidth="sm" fullWidth>
                <DialogTitle>Incomplete Quiz</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        You have {blankAnswers.length} unanswered question(s). Are you sure you want to submit?
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Unanswered questions: {blankAnswers.map((_, index) => index + 1).join(', ')}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelSubmit}>Continue Quiz</Button>
                    <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
                        Submit Anyway
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default QuestionDisplayDemo;