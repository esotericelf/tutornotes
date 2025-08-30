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
                <Typography key={index} variant="body1" sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.6,
                    mb: 1,
                    wordBreak: 'break-word'
                }}>
                    {renderWithLaTeX(line)}
                </Typography>
            );
        });
    };



    // Helper function to check if content is iframe or HTML
    const isIframeContent = (content) => {
        if (!content) return false;

        // Check if it's already an iframe (most common case for GeoGebra)
        if (content.includes('<iframe')) return true;

        // Check if it's a URL that will be converted to iframe
        if (content.includes('geogebra.org/m/') ||
            (content.includes('http') && !content.includes('geogebra.org') && !content.includes('jsxgraphdemo.netlify.app'))) {
            return true;
        }

        // If it's HTML content (starts with < and contains HTML tags), it's not iframe
        if (content.trim().startsWith('<') && (content.includes('<div') || content.includes('<svg') || content.includes('<html'))) {
            return false;
        }

        // Plain text is not iframe
        return false;
    };

    // Helper function to render iframe content directly
    const renderIframeContent = (content) => {
        if (!content) return null;

        // Check if it's already an iframe (most common case for GeoGebra)
        if (content.includes('<iframe')) {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }

        // Check if it's HTML content (starts with < and contains HTML tags)
        if (content.trim().startsWith('<') && (content.includes('<div') || content.includes('<svg') || content.includes('<html'))) {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }

        // Check if it's a URL to an HTML file or JSXGraph
        if (content.includes('.html') || (content.includes('http') && !content.includes('geogebra.org'))) {
            // Special handling for JSXGraph URLs
            if (content.includes('jsxgraphdemo.netlify.app')) {
                return (
                    <div style={{ background: 'transparent', padding: 0, borderRadius: 0, boxShadow: 'none' }}>
                        <iframe
                            src={content}
                            width="100%"
                            height="500px"
                            style={{ border: 'none', background: 'transparent', overflow: 'hidden' }}
                            title="JSXGraph Diagram"
                            scrolling="no"
                            allowFullScreen
                        />
                    </div>
                );
            }
            return (
                <iframe
                    src={content}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', background: 'transparent', overflow: 'hidden' }}
                    title="HTML Diagram"
                    scrolling="no"
                    allowFullScreen
                />
            );
        }

        // Convert GeoGebra URL to iframe (for base URLs, not iframe HTML)
        if (content.includes('geogebra.org/m/') && !content.includes('<iframe')) {
            const materialId = content.split('/m/')[1];
            return (
                <iframe
                    scrolling="no"
                    title="GeoGebra Diagram"
                    src={`https://www.geogebra.org/material/iframe/id/${materialId}/width/100%/height/100%/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`}
                    width="100%"
                    height="100%"
                    style={{ border: '0px' }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    onError={(e) => {
                        console.warn('GeoGebra iframe failed to load:', e);
                    }}
                />
            );
        }

        // If it's plain text, wrap it in a div
        return <div style={{ padding: 0, textAlign: 'center', background: 'transparent' }}>{content}</div>;
    };

    return (
        <Box sx={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: { xs: 1, sm: 2, md: 3 },
            overflow: 'hidden'
        }}>
            {/* Metadata Row */}
            <Box sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                mb: { xs: 2, sm: 3 },
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                <Paper
                    elevation={2}
                    sx={{
                        padding: { xs: 1, sm: 2 },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        minWidth: { xs: '100%', sm: 120 },
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.25rem' } }}>
                        {question.year}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Year</Typography>
                </Paper>

                <Paper
                    elevation={2}
                    sx={{
                        padding: { xs: 1, sm: 2 },
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        minWidth: { xs: '100%', sm: 120 },
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.25rem' } }}>
                        {question.paper}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Paper</Typography>
                </Paper>

                <Paper
                    elevation={2}
                    sx={{
                        padding: { xs: 1, sm: 2 },
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        minWidth: { xs: '100%', sm: 120 },
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.25rem' } }}>
                        {question.question_no}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Question</Typography>
                </Paper>
            </Box>

            {/* Question Section - Only show if question text or diagram exists */}
            {(question.question || question.question_diagram) && (
                <Paper
                    elevation={3}
                    sx={{
                        padding: { xs: 2, sm: 3, md: 4 },
                        mb: { xs: 2, sm: 3 },
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: { xs: 2, sm: 3 }
                    }}
                >
                    <Divider sx={{ mb: { xs: 1, sm: 2 } }} />

                    {/* Question Content with optional diagram */}
                    <Box sx={{
                        display: 'flex',
                        gap: { xs: 2, sm: 3 },
                        flexDirection: { xs: 'column', md: 'row' }
                    }}>
                        {/* Question Text - 70% width or full width if no diagram */}
                        <Box sx={{
                            flex: question.question_diagram ? { xs: '1 1 100%', md: '0 0 70%' } : '1 1 100%'
                        }}>
                            {question.question && (
                                <Typography variant="body1" sx={{
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    lineHeight: 1.6,
                                    mb: { xs: 2, sm: 3 },
                                    wordBreak: 'break-word'
                                }}>
                                    {renderWithLaTeX(question.question)}
                                </Typography>
                            )}

                            {/* Multiple Choice Options */}
                            {question.options && (
                                <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                                    <Box sx={{ display: 'grid', gap: { xs: 0.5, sm: 1 } }}>
                                        {question.options.map((option, index) => (
                                            <Box key={index} sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                p: { xs: 1.5, sm: 2 },
                                                bgcolor: 'rgba(255,255,255,0.7)',
                                                borderRadius: 1,
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                flexDirection: { xs: 'column', sm: 'row' }
                                            }}>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold',
                                                    mr: { xs: 0, sm: 2 },
                                                    mb: { xs: 0.5, sm: 0 },
                                                    minWidth: { xs: 'auto', sm: '30px' },
                                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                                }}>
                                                    {String.fromCharCode(65 + index)})
                                                </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    wordBreak: 'break-word'
                                                }}>
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
                            <Box sx={{
                                flex: { xs: '1 1 100%', md: '0 0 30%' },
                                minHeight: { xs: '200px', sm: '250px' }
                            }}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        padding: { xs: 1.5, sm: 2 },
                                        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                        borderRadius: 2,
                                        height: '100%'
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" align="center" sx={{
                                        fontSize: { xs: '1rem', sm: '1.25rem' },
                                        mb: { xs: 1, sm: 2 }
                                    }}>
                                        Diagram
                                    </Typography>
                                    {renderIframeContent(question.question_diagram)}
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
                    padding: { xs: 2, sm: 3, md: 4 },
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: { xs: 2, sm: 3 }
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: { xs: 1, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Typography variant="h5" fontWeight="bold" color="primary" sx={{
                        fontSize: { xs: '1.3rem', sm: '1.5rem' }
                    }}>
                        Solution
                    </Typography>

                    {/* Correct Answer Badge */}
                    {question.correct_answer && (
                        <Paper
                            elevation={2}
                            sx={{
                                padding: { xs: 1, sm: 2 },
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                color: 'white',
                                minWidth: { xs: '100%', sm: 120 },
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                {question.correct_answer}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Correct Answer</Typography>
                        </Paper>
                    )}
                </Box>
                <Divider sx={{ mb: { xs: 1, sm: 2 } }} />

                <Box sx={{
                    display: 'flex',
                    gap: { xs: 2, sm: 3 },
                    position: 'relative',
                    minHeight: { xs: '400px', sm: '500px' },
                    flexDirection: { xs: 'column', lg: 'row' }
                }}>
                    {/* Solution Text - Full width when diagram collapsed, 50% when expanded */}
                    <Box sx={{
                        flex: solutionDiagramExpanded ? { xs: '1 1 100%', lg: '0 0 50%' } : '1 1 100%',
                        transition: 'flex 0.3s ease-in-out',
                        paddingRight: solutionDiagramExpanded ? { xs: 0, lg: 0 } : { xs: 0, lg: '70px' }
                    }}>
                        {renderSolution(question.solution)}
                    </Box>

                    {/* Solution Diagram Sidebar - 50% width, full height, collapsible */}
                    <Box sx={{
                        position: { xs: 'relative', lg: 'absolute' },
                        right: { xs: 0, lg: 0 },
                        top: { xs: 0, lg: 0 },
                        bottom: { xs: 'auto', lg: 0 },
                        width: solutionDiagramExpanded ? { xs: '100%', lg: '50%' } : { xs: '100%', lg: '60px' },
                        height: { xs: solutionDiagramExpanded ? '400px' : '60px', lg: '100%' },
                        transition: 'all 0.3s ease-in-out',
                        zIndex: 1,
                        mt: { xs: 2, lg: 0 }
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
                                    padding: { xs: 0.5, sm: 1 },
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    minHeight: { xs: '50px', sm: '60px' },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)'
                                    }
                                }}
                                onClick={handleSolutionDiagramToggle}
                            >
                                <IconButton size="small" color="primary" sx={{
                                    transform: { xs: solutionDiagramExpanded ? 'rotate(180deg)' : 'rotate(0deg)', lg: 'none' }
                                }}>
                                    {solutionDiagramExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                                {solutionDiagramExpanded && (
                                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{
                                        ml: 1,
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}>
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
                                overflow: 'hidden',
                                minHeight: 0 // Ensure proper flex shrinking
                            }}>
                                {solutionDiagramExpanded ? (
                                    solutionDiagrams.length > 0 ? (
                                        <>
                                            {/* Diagram Display */}
                                            <Box sx={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                                padding: isIframeContent(solutionDiagrams[selectedDiagramIndex]) ? 0 : {
                                                    xs: solutionDiagrams.length > 1 ? '85px 0 0 0' : '50px 0 0 0',
                                                    sm: '60px 0 0 0'
                                                }, // Responsive padding for HTML content: 50px (toggle) + 35px (tabs) = 85px on mobile
                                                minHeight: 0, // Allow proper flex shrinking
                                                // Mobile-only iframe scaling
                                                '& iframe': {
                                                    '@media (max-width: 600px)': {
                                                        width: '100% !important',
                                                        height: 'auto !important',
                                                        maxWidth: '100% !important',
                                                        aspectRatio: '490/420'
                                                    }
                                                },
                                                // Mobile-specific JSXGraph handling
                                                '& iframe[title="JSXGraph Diagram"]': {
                                                    '@media (max-width: 600px)': {
                                                        height: '400px !important',
                                                        maxHeight: 'calc(100% - 35px) !important'
                                                    }
                                                }
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    {renderIframeContent(solutionDiagrams[selectedDiagramIndex])}
                                                </div>
                                            </Box>

                                            {/* Diagram Tabs - Only show if multiple diagrams, positioned at bottom */}
                                            {solutionDiagrams.length > 1 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    borderTop: '1px solid rgba(0,0,0,0.1)',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    overflowX: 'auto',
                                                    flexShrink: 0, // Prevent tabs from shrinking
                                                    height: { xs: '35px', sm: '40px' }, // Responsive height for tabs
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
                                                                padding: { xs: '6px 12px', sm: '8px 16px' },
                                                                cursor: 'pointer',
                                                                borderTop: selectedDiagramIndex === index ? '2px solid #1976d2' : 'none',
                                                                backgroundColor: selectedDiagramIndex === index ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                                                                color: selectedDiagramIndex === index ? '#1976d2' : 'inherit',
                                                                fontWeight: selectedDiagramIndex === index ? 'bold' : 'normal',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: 'fit-content',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                fontSize: { xs: '0.8rem', sm: '1rem' },
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
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            p: { xs: 1.5, sm: 2 },
                                            textAlign: 'center',
                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                        }}>
                                            No diagram available for this solution.
                                        </Typography>
                                    )
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="primary"
                                        sx={{
                                            writingMode: { xs: 'horizontal-tb', lg: 'vertical-rl' },
                                            textOrientation: { xs: 'mixed', lg: 'mixed' },
                                            transform: { xs: 'none', lg: 'rotate(180deg)' },
                                            fontWeight: 'bold',
                                            alignSelf: 'center',
                                            justifySelf: 'center',
                                            padding: { xs: '8px 4px', sm: '16px 8px' },
                                            fontSize: { xs: '0.8rem', sm: '1rem' }
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