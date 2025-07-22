import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import QuestionDisplay from './QuestionDisplay';

const QuestionDisplayDemo = () => {
    // Sample question data for extremum of quadratic function
    const sampleQuestion = {
        id: 1,
        question_no: 15,
        year: 2023,
        paper: 'I',
        correct_answer: "Find the extremum of the quadratic function f(x) = 2x² - 8x + 5. Determine whether it is a maximum or minimum and give the coordinates of the extremum point.",
        option_a: "Minimum at (2, -3)",
        option_b: "Maximum at (2, -3)",
        option_c: "Minimum at (-2, 3)",
        option_d: "Maximum at (-2, 3)",
        tags: ['quadratic functions', 'extremum', 'calculus', 'vertex form']
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{
                    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    Question Display Demo
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Stunning Layout for Math Questions with LaTeX Support
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                    This demo showcases a beautiful layout for displaying math questions with metadata blocks,
                    detailed solutions with LaTeX rendering, and a reserved area for diagrams and visualizations.
                </Typography>
            </Box>

            <QuestionDisplay question={sampleQuestion} />
        </Container>
    );
};

export default QuestionDisplayDemo;