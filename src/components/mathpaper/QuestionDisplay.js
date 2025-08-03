import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Divider,
    IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const QuestionDisplay = ({ question }) => {
    const [solutionDiagramExpanded, setSolutionDiagramExpanded] = useState(false);
    const [selectedDiagramIndex, setSelectedDiagramIndex] = useState(0);

    const handleSolutionDiagramToggle = () => {
        setSolutionDiagramExpanded(!solutionDiagramExpanded);
    };

    // Parse solution_diagram - could be string, array, or PostgreSQL array
    const getSolutionDiagrams = () => {
        if (!question.solution_diagram) return [];

        // If it's already an array, return it
        if (Array.isArray(question.solution_diagram)) {
            return question.solution_diagram;
        }

        // If it's a string, check if it's a PostgreSQL array format
        if (typeof question.solution_diagram === 'string') {
            // PostgreSQL array format: {item1,item2,item3}
            if (question.solution_diagram.startsWith('{') && question.solution_diagram.endsWith('}')) {
                const content = question.solution_diagram.slice(1, -1); // Remove { and }
                if (content.trim() === '') return [];
                return content.split(',').map(item => item.trim().replace(/^"(.*)"$/, '$1'));
            }

            // Try to parse as JSON array
            try {
                const parsed = JSON.parse(question.solution_diagram);
                return Array.isArray(parsed) ? parsed : [question.solution_diagram];
            } catch {
                // If parsing fails, treat as single string
                return [question.solution_diagram];
            }
        }

        // Fallback: treat as single item
        return [question.solution_diagram];
    };

    const solutionDiagrams = getSolutionDiagrams();

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

    // Helper function to render various diagram types including HTML
    const renderGeoGebraDiagram = (content) => {
        if (!content) return null;

        // Check if it's already an iframe
        if (content.includes('<iframe')) {
            return content;
        }

        // Check if it's HTML content (starts with < and contains HTML tags)
        if (content.trim().startsWith('<') && (content.includes('<div') || content.includes('<svg') || content.includes('<html'))) {
            return content; // Return HTML content as-is
        }

        // Check if it's a URL to an HTML file or JSXGraph
        if (content.includes('.html') || (content.includes('http') && !content.includes('geogebra.org') && !content.includes('replit'))) {
            // Special handling for JSXGraph URLs
            if (content.includes('jsxgraphdemo.netlify.app')) {
                return `<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <iframe src="${content}"
                            width="100%"
                            height="500px"
                            style="border: none; background: white; overflow: hidden;"
                            title="JSXGraph Diagram"
                            scrolling="no"
                            allowfullscreen>
                    </iframe>
                </div>`;
            }
            return `<iframe src="${content}" width="100%" height="100%" style="border: none; overflow: hidden;" title="HTML Diagram" scrolling="no" allowfullscreen></iframe>`;
        }

        // Convert GeoGebra URL to iframe
        if (content.includes('geogebra.org/m/')) {
            const materialId = content.split('/m/')[1];
            const iframeHtml = `<iframe scrolling="no" title="GeoGebra Diagram" src="https://www.geogebra.org/material/iframe/id/${materialId}/width/100%/height/100%/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false" width="100%" height="100%" style="border:0px;"></iframe>`;
            return iframeHtml;
        }

        // Convert Replit URL to iframe
        if (content.includes('replit.dev') || content.includes('replit.com') || content.includes('replit.app')) {
            const iframeHtml = `<iframe src="${content}" width="100%" height="100%" style="border:0px;" title="Replit Diagram" allowfullscreen></iframe>`;
            return iframeHtml;
        }

        // If it's plain text, wrap it in a div
        return `<div style="padding: 20px; text-align: center;">${content}</div>`;
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
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

            {/* Question Section - Only show if question text or diagram exists */}
            {(question.question || question.question_diagram) && (
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
                        <Box sx={{ flex: question.question_diagram ? '0 0 70%' : '1 1 100%' }}>
                            {question.question && (
                                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: 3 }}>
                                    {renderWithLaTeX(question.question)}
                                </Typography>
                            )}

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
                        {question.question_diagram && (
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
                                    <div dangerouslySetInnerHTML={{ __html: renderGeoGebraDiagram(question.question_diagram) }} />
                                </Paper>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}

            {/* Solution Section */}
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: 3
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        Solution
                    </Typography>

                    {/* Correct Answer Badge */}
                    {question.correct_answer && (
                        <Paper
                            elevation={2}
                            sx={{
                                padding: 2,
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                color: 'white',
                                minWidth: 120,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                {question.correct_answer}
                            </Typography>
                            <Typography variant="body2">Correct Answer</Typography>
                        </Paper>
                    )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', gap: 3, position: 'relative', minHeight: '300px' }}>
                    {/* Solution Text - Full width when diagram collapsed, 50% when expanded */}
                    <Box sx={{
                        flex: solutionDiagramExpanded ? '0 0 50%' : '1 1 100%',
                        transition: 'flex 0.3s ease-in-out',
                        paddingRight: solutionDiagramExpanded ? 0 : '70px'
                    }}>
                        {renderSolution(question.solution)}
                    </Box>

                    {/* Solution Diagram Sidebar - 50% width, full height, collapsible */}
                    <Box sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: solutionDiagramExpanded ? '50%' : '60px',
                        transition: 'width 0.3s ease-in-out',
                        zIndex: 1
                    }}>
                        <Paper
                            elevation={3}
                            sx={{
                                width: '100%',
                                height: '100%',
                                background: '#F4FFED',
                                borderRadius: 2,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Toggle Button */}
                            <Box
                                sx={{
                                    padding: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)'
                                    }
                                }}
                                onClick={handleSolutionDiagramToggle}
                            >
                                <IconButton size="small" color="primary">
                                    {solutionDiagramExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                                {solutionDiagramExpanded && (
                                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ ml: 1 }}>
                                        Solution Diagram
                                    </Typography>
                                )}
                            </Box>

                            {/* Diagram Content */}
                            <Box sx={{
                                flex: 1,
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                {solutionDiagramExpanded ? (
                                    solutionDiagrams.length > 0 ? (
                                        <>
                                            {/* Diagram Tabs - Only show if multiple diagrams */}
                                            {solutionDiagrams.length > 1 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    overflowX: 'auto',
                                                    '&::-webkit-scrollbar': {
                                                        height: '4px'
                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        background: 'rgba(0,0,0,0.1)'
                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        background: 'rgba(0,0,0,0.3)',
                                                        borderRadius: '2px'
                                                    }
                                                }}>
                                                    {solutionDiagrams.map((_, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                padding: '8px 16px',
                                                                cursor: 'pointer',
                                                                borderBottom: selectedDiagramIndex === index ? '2px solid #1976d2' : 'none',
                                                                backgroundColor: selectedDiagramIndex === index ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                                                                color: selectedDiagramIndex === index ? '#1976d2' : 'inherit',
                                                                fontWeight: selectedDiagramIndex === index ? 'bold' : 'normal',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: 'fit-content',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(25, 118, 210, 0.05)'
                                                                }
                                                            }}
                                                            onClick={() => setSelectedDiagramIndex(index)}
                                                        >
                                                            {index + 1}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {/* Diagram Display */}
                                            <Box sx={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'auto',
                                                padding: 1
                                            }}>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: renderGeoGebraDiagram(solutionDiagrams[selectedDiagramIndex])
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                />
                                            </Box>
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                            No diagram available for this solution.
                                        </Typography>
                                    )
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="primary"
                                        sx={{
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                            transform: 'rotate(180deg)',
                                            fontWeight: 'bold',
                                            alignSelf: 'center',
                                            justifySelf: 'center'
                                        }}
                                    >
                                        {solutionDiagrams.length > 1 ? `${solutionDiagrams.length} Diagrams` : 'Diagram'}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default QuestionDisplay;