import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    Divider,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    School,
    CalendarToday,
    Assignment,
    Functions,
    Lightbulb,
    Image
} from '@mui/icons-material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const QuestionDisplay = ({ question }) => {
    if (!question) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No question selected
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header with Metadata */}
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: '1px solid #dee2e6'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    {/* Year Block */}
                    <Grid item xs={12} sm={4}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <CalendarToday sx={{ fontSize: 40, mb: 1, color: '#6c757d' }} />
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                    {question.year}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Year
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Paper Block */}
                    <Grid item xs={12} sm={4}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <School sx={{ fontSize: 40, mb: 1, color: '#6c757d' }} />
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                    Paper {question.paper}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Paper Type
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Question Number Block */}
                    <Grid item xs={12} sm={4}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Assignment sx={{ fontSize: 40, mb: 1, color: '#6c757d' }} />
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                    #{question.question_no}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Question
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Content Area */}
            <Grid container spacing={3}>
                {/* Solution Area (Left - 7/10 width) */}
                <Grid item xs={12} md={8.4}>
                    <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Functions sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="h5" fontWeight="bold">
                                Question & Solution
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Question Statement */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                                Question Statement:
                            </Typography>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderLeft: '4px solid #6c757d',
                                    border: '1px solid #dee2e6'
                                }}
                            >
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {question.correct_answer}
                                </Typography>

                                {/* Multiple Choice Options */}
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            A: {question.option_a}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            B: {question.option_b}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            C: {question.option_c}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            D: {question.option_d}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>

                        {/* Solution */}
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                                Solution:
                            </Typography>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderLeft: '4px solid #6c757d',
                                    border: '1px solid #dee2e6'
                                }}
                            >
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    To find the extremum of a quadratic function, we use the method of completing the square or calculus.
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Step 1:</strong> Identify the quadratic function in standard form:
                                    </Typography>
                                    <Box sx={{ textAlign: 'center', my: 2 }}>
                                        <BlockMath math="f(x) = ax^2 + bx + c" />
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Step 2:</strong> The vertex form is:
                                    </Typography>
                                    <Box sx={{ textAlign: 'center', my: 2 }}>
                                        <BlockMath math="f(x) = a(x - h)^2 + k" />
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Step 3:</strong> The coordinates of the vertex (extremum) are:
                                    </Typography>
                                    <Box sx={{ textAlign: 'center', my: 2 }}>
                                        <BlockMath math="h = -\frac{b}{2a}, \quad k = f(h)" />
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Step 4:</strong> For the function <InlineMath math="f(x) = 2x^2 - 8x + 5" />:
                                    </Typography>
                                    <Box sx={{ textAlign: 'center', my: 2 }}>
                                        <BlockMath math="h = -\frac{-8}{2(2)} = 2" />
                                        <BlockMath math="k = f(2) = 2(2)^2 - 8(2) + 5 = 8 - 16 + 5 = -3" />
                                    </Box>
                                </Box>

                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    Therefore, the extremum occurs at the point (2, -3) and it is a minimum since a &gt; 0.
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Tags:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {question.tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Diagram Area (Right - 3/10 width) */}
                <Grid item xs={12} md={3.6}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Image sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="bold">
                                Diagram & Visualization
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Placeholder for Diagram */}
                        <Box
                            sx={{
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '2px dashed #dee2e6',
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Image sx={{ fontSize: 60, color: '#adb5bd', mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Diagram placeholder
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Interactive graph will be displayed here
                                </Typography>
                            </Box>
                        </Box>

                        {/* Additional Notes */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Note:</strong> This area will contain interactive diagrams, graphs, and visual aids to help understand the mathematical concepts.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default QuestionDisplay;