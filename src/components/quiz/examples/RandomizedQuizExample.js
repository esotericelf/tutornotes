/**
 * Example: How to integrate answer randomization into your existing QuizTaker
 * This shows the minimal changes needed to add randomization
 */

import React, { useState, useEffect } from 'react';
import { Container, Box, Paper, Typography, Button, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { randomizeAnswerOptions, convertToOriginalAnswer } from '../utils/answerRandomizer';
import { supabase } from '../../../services/supabase';

const RandomizedQuizExample = ({ quizId }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            // 1. Get quiz details
            const { data: quiz, error: quizError } = await supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('id', quizId)
                .single();

            if (quizError) throw quizError;

            // 2. Get questions
            const { data: rawQuestions, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .in('id', quiz.questions)
                .eq('is_active', true);

            if (questionsError) throw questionsError;

            // 3. RANDOMIZE THE OPTIONS - This is the key change!
            const randomizedQuestions = rawQuestions.map(question =>
                randomizeAnswerOptions(question)
            );

            setQuestions(randomizedQuestions);
        } catch (error) {
            console.error('Error loading quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (event) => {
        const newAnswers = { ...answers, [currentQuestion]: event.target.value };
        setAnswers(newAnswers);
    };

    const submitQuiz = async () => {
        try {
            // 4. Convert answers back to original format for database storage
            const convertedAnswers = questions.map((question, index) => {
                const userAnswer = answers[index];
                const originalAnswer = convertToOriginalAnswer(userAnswer, question);

                return {
                    question_id: question.id,
                    selected_answer: originalAnswer, // Store original format
                    is_correct: userAnswer === question.correct_answer // Check against randomized correct answer
                };
            });

            // 5. Submit to database
            const { data, error } = await supabase
                .from('quiz_attempts')
                .insert({
                    quiz_id: quizId,
                    user_id: 'user-id', // Get from auth context
                    answers: convertedAnswers,
                    score: Math.round((convertedAnswers.filter(a => a.is_correct).length / questions.length) * 100),
                    completed_at: new Date().toISOString()
                });

            if (error) throw error;

            console.log('Quiz submitted successfully!', data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
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

    if (loading) return <Typography>Loading...</Typography>;

    const currentQ = questions[currentQuestion];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Question {currentQuestion + 1} of {questions.length}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    {renderWithLaTeX(currentQ.question)}
                </Typography>

                <RadioGroup
                    value={answers[currentQuestion] || ''}
                    onChange={handleAnswerSelect}
                >
                    {['A', 'B', 'C', 'D'].map((option) => (
                        <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={`${option}) `}{renderWithLaTeX(currentQ[`option_${option.toLowerCase()}`])}
                        />
                    ))}
                </RadioGroup>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        disabled={currentQuestion === questions.length - 1}
                    >
                        Next
                    </Button>

                    {currentQuestion === questions.length - 1 && (
                        <Button
                            variant="contained"
                            onClick={submitQuiz}
                        >
                            Submit Quiz
                        </Button>
                    )}
                </Box>

                {/* Debug info - remove in production */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" display="block">
                        Debug Info:
                    </Typography>
                    <Typography variant="caption" display="block">
                        Original correct answer: {currentQ._originalCorrectAnswer}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Randomized correct answer: {currentQ.correct_answer}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Your answer: {answers[currentQuestion] || 'None'}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default RandomizedQuizExample;
