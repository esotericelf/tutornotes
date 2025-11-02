import React, { useState, useEffect } from 'react'
import {
    Paper,
    Box,
    Typography,
    Divider,
    IconButton,
    ButtonGroup
} from '@mui/material'
import {
    Lightbulb,
    Functions as FunctionsIcon,
    ChevronLeft,
    ChevronRight
} from '@mui/icons-material'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

const KeyConceptHighlight = ({ concepts = [], onConceptChange, currentIndex = 0 }) => {
    // Normalize concepts to array
    const conceptsArray = Array.isArray(concepts) ? concepts : concepts ? [concepts] : []

    const [selectedConceptIndex, setSelectedConceptIndex] = useState(currentIndex)

    // Sync with parent's currentIndex
    useEffect(() => {
        if (currentIndex !== selectedConceptIndex && currentIndex >= 0 && currentIndex < conceptsArray.length) {
            setSelectedConceptIndex(currentIndex)
        }
    }, [currentIndex, selectedConceptIndex, conceptsArray.length])

    if (conceptsArray.length === 0) {
        return null
    }

    const selectedConcept = conceptsArray[selectedConceptIndex]

    const handlePrevious = () => {
        const newIndex = selectedConceptIndex > 0 ? selectedConceptIndex - 1 : conceptsArray.length - 1
        setSelectedConceptIndex(newIndex)
        if (onConceptChange) {
            onConceptChange(newIndex)
        }
    }

    const handleNext = () => {
        const newIndex = selectedConceptIndex < conceptsArray.length - 1 ? selectedConceptIndex + 1 : 0
        setSelectedConceptIndex(newIndex)
        if (onConceptChange) {
            onConceptChange(newIndex)
        }
    }

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

    const renderFormulaArray = (formulaArray) => {
        if (!formulaArray || formulaArray.length === 0) return null

        return (
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FunctionsIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Formula/ Core Idea
                    </Typography>
                </Box>
                {formulaArray.map((item, index) => {
                    // Check if item is purely math (starts and ends with $)
                    const trimmed = item.trim()
                    const isPureMath = trimmed.startsWith('$') && trimmed.endsWith('$')

                    if (isPureMath) {
                        const mathContent = trimmed.slice(1, -1)
                        return (
                            <Box key={index} sx={{ mb: 1, overflowX: 'auto' }}>
                                <BlockMath math={mathContent} />
                            </Box>
                        )
                    } else {
                        return (
                            <Typography
                                key={index}
                                variant="body1"
                                sx={{
                                    mb: 1,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    '& .katex': {
                                        fontSize: { xs: '0.9em', sm: '1em' }
                                    }
                                }}
                            >
                                {renderWithLaTeX(item)}
                            </Typography>
                        )
                    }
                })}
            </Box>
        )
    }

    const renderDerivationArray = (derivationArray) => {
        if (!derivationArray || derivationArray.length === 0) return null

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Derivation
                </Typography>
                {derivationArray.map((item, index) => (
                    <Typography
                        key={index}
                        variant="body2"
                        sx={{
                            mb: 0.5,
                            pl: { xs: 1, sm: 2 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            '& .katex': {
                                fontSize: { xs: '0.85em', sm: '0.9em' }
                            }
                        }}
                    >
                        {renderWithLaTeX(item)}
                    </Typography>
                ))}
            </Box>
        )
    }

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                mb: 2,
                gap: { xs: 2, sm: 0 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <Lightbulb sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 }, flexShrink: 0 }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: { xs: '1.25rem', sm: '2rem' },
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        {selectedConcept.concept_title || 'Key Concept'}
                    </Typography>
                </Box>

                {conceptsArray.length > 1 && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexShrink: 0
                    }}>
                        <ButtonGroup size="small">
                            <IconButton onClick={handlePrevious} size="small" sx={{ px: { xs: 1, sm: 1.5 } }}>
                                <ChevronLeft />
                            </IconButton>
                            <IconButton onClick={handleNext} size="small" sx={{ px: { xs: 1, sm: 1.5 } }}>
                                <ChevronRight />
                            </IconButton>
                        </ButtonGroup>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {selectedConceptIndex + 1} of {conceptsArray.length}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box>
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
                    {renderWithLaTeX(selectedConcept.concept_statement || '')}
                </Typography>

                {renderFormulaArray(selectedConcept.formula)}

                {renderDerivationArray(selectedConcept.derivation)}

                {selectedConcept.supplementary_note && (
                    <Box sx={{ mt: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontStyle: 'italic',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                        >
                            {renderWithLaTeX(selectedConcept.supplementary_note)}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    )
}

export default KeyConceptHighlight

