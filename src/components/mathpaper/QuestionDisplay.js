import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Divider,
    Collapse,
    IconButton,
    Breadcrumbs,
    Link
} from '@mui/material';
import { ExpandMore, ExpandLess, Home } from '@mui/icons-material';
import { InlineMath, BlockMath } from 'react-katex';
import { useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';

const QuestionDisplay = ({ question }) => {
    const [solutionDiagramExpanded, setSolutionDiagramExpanded] = useState(false);
    const navigate = useNavigate();

    const handleSolutionDiagramToggle = () => {
        setSolutionDiagramExpanded(!solutionDiagramExpanded);
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    // Helper function to render text with LaTeX
    const renderWithLaTeX = (text) => {
        if (!text) return '';

        // Split text by LaTeX delimiters
        const parts = text.split(/(\$[^$]+\$|\\\([^)]+\\\)|\\\[[^\]]+\\\])/);

        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                // Inline math: $...$
                const math = part.slice(1, -1);
                return <InlineMath key={index} math={math} />;
            } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                // Inline math: \(...\)
                const math = part.slice(2, -2);
                return <InlineMath key={index} math={math} />;
            } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                // Block math: \[...\]
                const math = part.slice(2, -2);
                return <BlockMath key={index} math={math} />;
            } else {
                // Regular text
                return <span key={index}>{part}</span>;
            }
        });
    };

    // Helper function to render solution with proper formatting
    const renderSolution = (solution) => {
        if (!solution) return '';

        return solution.split('\n').map((line, index) => {
            if (line.trim() === '') {
                return <Box key={index} sx={{ height: '1rem' }} />;
            }
            return (
                <Typography key={index} variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: 1 }}>
                    {renderWithLaTeX(line)}
                </Typography>
            );
        });
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
            {/* Breadcrumb Navigation */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        component="button"
                        variant="body1"
                        onClick={handleHomeClick}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        <Home sx={{ mr: 0.5, fontSize: 20 }} />
                        Home
                    </Link>
                    <Typography color="text.primary">Question {question.question_no}</Typography>
                </Breadcrumbs>
            </Box>

            {/* Metadata Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper
                    elevation={2}
                    sx={{
                        padding: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        minWidth: 120,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        {question.year}
                    </Typography>
                    <Typography variant="body2">Year</Typography>
                </Paper>

                <Paper
                    elevation={2}
                    sx={{
                        padding: 2,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        minWidth: 120,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        {question.paper}
                    </Typography>
                    <Typography variant="body2">Paper</Typography>
                </Paper>

                <Paper
                    elevation={2}
                    sx={{
                        padding: 2,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        minWidth: 120,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        {question.question_no}
                    </Typography>
                    <Typography variant="body2">Question</Typography>
                </Paper>
            </Box>

            {/* Question Section */}
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    mb: 3,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: 3
                }}
            >
                <Divider sx={{ mb: 2 }} />

                {/* Question Content with optional diagram */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Question Text - 70% width or full width if no diagram */}
                    <Box sx={{ flex: question.questionDiagram ? '0 0 70%' : '1 1 100%' }}>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: 3 }}>
                            {renderWithLaTeX(question.question)}
                        </Typography>

                        {/* Multiple Choice Options */}
                        {question.options && (
                            <Box sx={{ mt: 3 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    {question.options.map((option, index) => (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 2,
                                            bgcolor: 'rgba(255,255,255,0.7)',
                                            borderRadius: 1,
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2, minWidth: '30px' }}>
                                                {String.fromCharCode(65 + index)})
                                            </Typography>
                                            <Typography variant="body1">
                                                {renderWithLaTeX(option)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Question Diagram - 30% width, only if exists */}
                    {question.questionDiagram && (
                        <Box sx={{ flex: '0 0 30%' }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    padding: 2,
                                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                    borderRadius: 2,
                                    height: '100%'
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" align="center">
                                    Diagram
                                </Typography>
                                <div dangerouslySetInnerHTML={{ __html: question.questionDiagram }} />
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Solution Section */}
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: 3
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                    Solution
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Solution Text - 70% width */}
                    <Box sx={{ flex: '0 0 70%' }}>
                        {renderSolution(question.solution)}
                    </Box>

                    {/* Solution Diagram - 30% width */}
                    <Box sx={{ flex: '0 0 30%' }}>
                        <Paper
                            elevation={1}
                            sx={{
                                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                borderRadius: 2,
                                height: 'fit-content',
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    padding: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(0,0,0,0.1)'
                                }}
                                onClick={handleSolutionDiagramToggle}
                            >
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    Solution Diagram
                                </Typography>
                                <IconButton size="small">
                                    {solutionDiagramExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>

                            <Collapse in={solutionDiagramExpanded}>
                                <Box sx={{ padding: 2 }}>
                                    {question.solutionDiagram ? (
                                        <div dangerouslySetInnerHTML={{ __html: question.solutionDiagram }} />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No diagram available for this solution.
                                        </Typography>
                                    )}
                                </Box>
                            </Collapse>
                        </Paper>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default QuestionDisplay;