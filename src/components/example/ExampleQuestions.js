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
                const mathContent = part.slice(1, -1)
                return <InlineMath key={index} math={mathContent} />
            }
            return <span key={index}>{part}</span>
        })
    }

    const handleStep = (step) => () => {
        setActiveStep(step)
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
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Problem
                </Typography>
                <Typography variant="body1">
                    {renderWithLaTeX(example.problem || '')}
                </Typography>
            </Paper>

            {/* Steps and Diagrams Side by Side */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Steps Column */}
                <Box sx={{ flex: { md: '1 1 50%' }, flexWrap: { md: 'nowrap' } }}>
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
                                    px: 2,
                                    py: 1.5,
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
                                        margin: '12px 0',
                                        '&.Mui-expanded': {
                                            margin: '12px 0'
                                        }
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                    <Typography variant="h6" sx={{ flex: 1, fontWeight: activeStep === index ? 600 : 400 }}>
                                        {step.title || `Step ${index + 1}`}
                                    </Typography>
                                    {index < activeStep && (
                                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                            ✓
                                        </Typography>
                                    )}
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{
                                px: 2,
                                py: 3,
                                border: 'none',
                                borderTop: 'none',
                                borderBottom: 'none',
                                borderLeft: 'none',
                                borderRight: 'none'
                            }}>
                                {step.description && (
                                    <Typography variant="body1" paragraph>
                                        {renderWithLaTeX(step.description)}
                                    </Typography>
                                )}
                                {step.math && (
                                    <Box sx={{ my: 2 }}>
                                        <BlockMath math={step.math} />
                                    </Box>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Diagrams Column */}
                {diagrams.length > 0 && (
                    <Box sx={{ flex: { md: '1 1 50%' } }}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Interactive Diagram
                                </Typography>
                                {diagrams.length > 1 ? (
                                    <Box>
                                        <Tabs
                                            value={diagramTabIndex}
                                            onChange={(e, newValue) => setDiagramTabIndex(newValue)}
                                            sx={{ mb: 2 }}
                                        >
                                            {diagrams.map((_, index) => (
                                                <Tab key={index} label={index + 1} />
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

