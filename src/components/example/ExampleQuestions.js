import React, { useState } from 'react'
import {
    Paper,
    Box,
    Typography,
    Card,
    CardContent,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'
import { InlineMath, BlockMath } from 'react-katex'
import {
    ExpandMore
} from '@mui/icons-material'
import 'katex/dist/katex.min.css'

const ExampleQuestions = ({ example }) => {
    const [activeStep, setActiveStep] = useState(0)
    const [diagramTabIndex, setDiagramTabIndex] = useState(0)

    if (!example) {
        return null
    }

    // Normalize steps to array
    const steps = Array.isArray(example.steps) ? example.steps : []

    // Normalize diagrams - could be array or single string
    const diagrams = Array.isArray(example.diagrams)
        ? example.diagrams
        : example.diagram
            ? [example.diagram]
            : []

    // Helper function to render text with KaTeX
    const renderWithLaTeX = (text) => {
        if (!text) return null

        // Split by $ delimiters
        const parts = text.split(/(\$[^$]+\$)/g)

        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                let mathContent = part.slice(1, -1)
                // Normalize double backslashes to single backslashes
                // This handles cases where backslashes are escaped in the database
                mathContent = mathContent.replace(/\\\\/g, '\\')
                return <InlineMath key={index} math={mathContent} />
            }
            return <span key={index}>{part}</span>
        })
    }

    // Helper function to render math field with support for \n line breaks
    const renderMath = (mathString) => {
        if (!mathString) return null

        // Split by \n to handle multiple lines
        const lines = mathString.split('\\n').filter(line => line.trim() !== '')

        return (
            <Box sx={{ my: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={2}
                    sx={{
                        maxWidth: '90%',
                        width: '100%',
                        p: { xs: 2, sm: 3 },
                        backgroundColor: 'background.default',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1
                    }}
                >
                    <Box sx={{
                        '& .katex': {
                            fontSize: { xs: '0.9em', sm: '1em' }
                        },
                        '& .katex-display': {
                            textAlign: 'left !important',
                            margin: '0.5em 0',
                            display: 'block'
                        },
                        '& .katex-display > .katex': {
                            textAlign: 'left !important'
                        }
                    }}>
                        {lines.map((line, index) => {
                            let mathContent = line.trim()

                            // Check if already wrapped in $...$
                            if (mathContent.startsWith('$') && mathContent.endsWith('$')) {
                                // Extract content between $ signs
                                mathContent = mathContent.slice(1, -1).trim()
                            }

                            // Check for LaTeX line breaks
                            // Pattern: \\ (two backslashes) not followed by a letter (which would be a LaTeX command)
                            // This handles both \\ (2 backslashes in string) and \\\\ (4 backslashes in string = 2 after JSON)
                            // First normalize \\\\ to \\ if present (from database escaping)
                            let contentForCheck = mathContent.replace(/\\\\\\\\/g, '\\\\')

                            // Check if there are line breaks: \\ not followed by a letter
                            const hasLineBreak = /\\\\(?!\s*[a-zA-Z])/.test(contentForCheck)

                            if (hasLineBreak) {
                                // Split by LaTeX line breaks (\\ not followed by letter)
                                const mathParts = contentForCheck.split(/\\\\(?!\s*[a-zA-Z])/).filter(part => part.trim() !== '')

                                return (
                                    <Box key={index} sx={{ mb: index < lines.length - 1 ? 1 : 0, pl: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
                                        {mathParts.map((part, partIndex) => {
                                            let normalizedPart = part.trim()
                                            // Normalize remaining escaped backslashes (preserve LaTeX commands)
                                            // Normalize \\\\ to \\, but keep \\alpha, \\beta, etc.
                                            while (normalizedPart.includes('\\\\\\\\')) {
                                                normalizedPart = normalizedPart.replace(/\\\\\\\\/g, '\\\\')
                                            }
                                            // Normalize \\ to \ only if not followed by a letter
                                            normalizedPart = normalizedPart.replace(/\\\\(?!\s*[a-zA-Z])/g, '\\')

                                            return (
                                                <Box
                                                    key={partIndex}
                                                    sx={{
                                                        mb: partIndex < mathParts.length - 1 ? 0.5 : 0,
                                                        overflowX: 'auto',
                                                        '& .katex-display': {
                                                            textAlign: 'left !important',
                                                            margin: '0.5em 0'
                                                        }
                                                    }}
                                                >
                                                    <BlockMath math={normalizedPart} />
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                )
                            }

                            // No LaTeX line breaks, normalize escaped backslashes normally
                            // Normalize quadruple backslashes to double
                            while (mathContent.includes('\\\\\\\\')) {
                                mathContent = mathContent.replace(/\\\\\\\\/g, '\\\\')
                            }
                            // Normalize double backslashes that aren't LaTeX commands to single
                            mathContent = mathContent.replace(/\\\\(?!\s*[a-zA-Z])/g, '\\')

                            // If not wrapped, check if it contains $ signs that might indicate inline math
                            if (!mathContent.startsWith('$') && !mathContent.endsWith('$')) {
                                const hasInlineMath = mathContent.includes('$')
                                if (hasInlineMath) {
                                    // Handle mixed content with inline math
                                    return (
                                        <Box key={index} sx={{ mb: index < lines.length - 1 ? 1 : 0, pl: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
                                            {renderWithLaTeX(mathContent)}
                                        </Box>
                                    )
                                }
                            }

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: index < lines.length - 1 ? 1 : 0,
                                        pl: { xs: 1.5, sm: 2 },
                                        textAlign: 'left',
                                        overflowX: 'auto',
                                        '& .katex-display': {
                                            textAlign: 'left !important',
                                            margin: '0.5em 0'
                                        }
                                    }}
                                >
                                    <BlockMath math={mathContent} />
                                </Box>
                            )
                        })}
                    </Box>
                </Paper>
            </Box>
        )
    }

    const renderDiagram = (diagram) => {
        if (!diagram) return null

        // Helper function to extract dimensions and calculate aspect ratio
        const getAspectRatio = (htmlString) => {
            // Try to extract width and height from attributes
            const widthMatch = htmlString.match(/width=["'](\d+)/)
            const heightMatch = htmlString.match(/height=["'](\d+)/)

            // Also check in style attribute
            const styleMatch = htmlString.match(/style=["']([^"']*)["']/)
            let width = widthMatch ? parseInt(widthMatch[1]) : null
            let height = heightMatch ? parseInt(heightMatch[1]) : null

            if (styleMatch) {
                const style = styleMatch[1]
                const styleWidthMatch = style.match(/width:\s*(\d+)px/)
                const styleHeightMatch = style.match(/height:\s*(\d+)px/)
                if (!width && styleWidthMatch) width = parseInt(styleWidthMatch[1])
                if (!height && styleHeightMatch) height = parseInt(styleHeightMatch[1])
            }

            // Default to 490x420 if not found
            width = width || 490
            height = height || 420

            // Calculate aspect ratio percentage
            return (height / width) * 100
        }

        // Check if it's an iframe string
        if (typeof diagram === 'string' && diagram.trim().startsWith('<iframe')) {
            // Extract src from the iframe HTML string
            const srcMatch = diagram.match(/src=["']([^"']+)["']/)
            const src = srcMatch ? srcMatch[1] : ''
            const aspectRatio = getAspectRatio(diagram)

            if (src) {
                return (
                    <Box
                        sx={{
                            width: '100%',
                            position: 'relative',
                            paddingBottom: `${aspectRatio}%`,
                            height: 0,
                            overflow: 'hidden'
                        }}
                    >
                        <iframe
                            src={src}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: '0px'
                            }}
                            title="GeoGebra Diagram"
                            scrolling="no"
                        />
                    </Box>
                )
            }

            // Fallback: render original HTML but override width styles
            const modifiedDiagram = diagram
                .replace(/width=["'][^"']*["']/g, '')
                .replace(/style=["']([^"']*)["']/g, (match, style) => {
                    const newStyle = (style || '').replace(/width:\s*[^;]+;?/g, '')
                    return `style="${newStyle} width: 100%; height: 100%;"`
                })

            return (
                <Box
                    sx={{
                        width: '100%',
                        position: 'relative',
                        paddingBottom: `${aspectRatio}%`,
                        height: 0,
                        overflow: 'hidden'
                    }}
                    dangerouslySetInnerHTML={{ __html: modifiedDiagram }}
                />
            )
        }

        // Check if it's a GeoGebra URL (might contain dimensions in the URL)
        if (typeof diagram === 'string' && diagram.includes('geogebra.org')) {
            // Try to extract dimensions from URL (GeoGebra URLs sometimes have /width/XXX/height/YYY)
            const urlWidthMatch = diagram.match(/\/width\/(\d+)/)
            const urlHeightMatch = diagram.match(/\/height\/(\d+)/)

            let aspectRatio = 85.71 // Default 420/490
            if (urlWidthMatch && urlHeightMatch) {
                const width = parseInt(urlWidthMatch[1])
                const height = parseInt(urlHeightMatch[1])
                aspectRatio = (height / width) * 100
            }

            return (
                <Box
                    sx={{
                        width: '100%',
                        position: 'relative',
                        paddingBottom: `${aspectRatio}%`,
                        height: 0,
                        overflow: 'hidden'
                    }}
                >
                    <iframe
                        src={diagram}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: '0px'
                        }}
                        title="GeoGebra Diagram"
                        scrolling="no"
                    />
                </Box>
            )
        }

        return null
    }

    return (
        <Box>
            {/* Problem Statement */}
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
                {example.example_title && (
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            mb: 2,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            wordBreak: 'break-word'
                        }}
                    >
                        {example.example_title}
                    </Typography>
                )}
                <Typography
                    variant="body1"
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& .katex': {
                            fontSize: { xs: '0.9em', sm: '1em' }
                        }
                    }}
                >
                    {renderWithLaTeX(example.problem || '')}
                </Typography>
            </Paper>

            {/* Steps and Diagrams Side by Side */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
                {/* Steps Column */}
                <Box sx={{ flex: { md: '1 1 50%' }, flexWrap: { md: 'nowrap' }, width: '100%' }}>
                    {steps.map((step, index) => (
                        <Accordion
                            key={index}
                            expanded={activeStep === index}
                            onChange={() => setActiveStep(index)}
                            sx={{
                                mb: 1,
                                boxShadow: 'none',
                                border: 'none',
                                '&:before': {
                                    display: 'none'
                                },
                                '&.Mui-expanded': {
                                    margin: '0 0 8px 0'
                                },
                                '&:not(:last-child)': {
                                    borderBottom: 'none'
                                },
                                '&:not(:first-child)': {
                                    borderTop: 'none'
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                sx={{
                                    px: { xs: 1.5, sm: 2 },
                                    py: { xs: 1, sm: 1.5 },
                                    border: 'none',
                                    borderTop: 'none',
                                    borderBottom: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    },
                                    '&.Mui-expanded': {
                                        minHeight: 'auto',
                                        borderBottom: 'none'
                                    },
                                    '& .MuiAccordionSummary-content': {
                                        margin: { xs: '8px 0', sm: '12px 0' },
                                        '&.Mui-expanded': {
                                            margin: { xs: '8px 0', sm: '12px 0' }
                                        }
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            flex: 1,
                                            fontWeight: activeStep === index ? 600 : 400,
                                            fontSize: { xs: '0.875rem', sm: '1.25rem' },
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        {step.title || `Step ${index + 1}`}
                                    </Typography>
                                    {index < activeStep && (
                                        <Typography
                                            variant="body2"
                                            color="success.main"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                                flexShrink: 0
                                            }}
                                        >
                                            ✓
                                        </Typography>
                                    )}
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{
                                px: { xs: 1.5, sm: 2 },
                                py: { xs: 2, sm: 3 },
                                border: 'none',
                                borderTop: 'none',
                                borderBottom: 'none',
                                borderLeft: 'none',
                                borderRight: 'none'
                            }}>
                                {step.description && (
                                    <Typography
                                        variant="body1"
                                        paragraph
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            '& .katex': {
                                                fontSize: { xs: '0.9em', sm: '1em' }
                                            }
                                        }}
                                    >
                                        {renderWithLaTeX(step.description)}
                                    </Typography>
                                )}
                                {step.math && renderMath(step.math)}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Diagrams Column */}
                {diagrams.length > 0 && (
                    <Box sx={{ flex: { md: '1 1 50%' }, width: '100%' }}>
                        <Card elevation={2}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                {diagrams.length > 1 ? (
                                    <Box>
                                        <Tabs
                                            value={diagramTabIndex}
                                            onChange={(e, newValue) => setDiagramTabIndex(newValue)}
                                            sx={{
                                                mb: 2,
                                                '& .MuiTabs-scrollButtons': {
                                                    display: { xs: 'flex', sm: 'flex' }
                                                }
                                            }}
                                            variant="scrollable"
                                            scrollButtons="auto"
                                        >
                                            {diagrams.map((_, index) => (
                                                <Tab
                                                    key={index}
                                                    label={index + 1}
                                                    sx={{
                                                        minWidth: { xs: 48, sm: 72 },
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                />
                                            ))}
                                        </Tabs>
                                        <Box>
                                            {renderDiagram(diagrams[diagramTabIndex])}
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box>
                                        {renderDiagram(diagrams[0])}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default ExampleQuestions

