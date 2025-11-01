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
                    <FunctionsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="h6">Formula</Typography>
                </Box>
                {formulaArray.map((item, index) => {
                    // Check if item is purely math (starts and ends with $)
                    const trimmed = item.trim()
                    const isPureMath = trimmed.startsWith('$') && trimmed.endsWith('$')

                    if (isPureMath) {
                        const mathContent = trimmed.slice(1, -1)
                        return (
                            <Box key={index} sx={{ mb: 1 }}>
                                <BlockMath math={mathContent} />
                            </Box>
                        )
                    } else {
                        return (
                            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
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
                <Typography variant="h6" sx={{ mb: 1 }}>Derivation</Typography>
                {derivationArray.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5, pl: 2 }}>
                        {renderWithLaTeX(item)}
                    </Typography>
                ))}
            </Box>
        )
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Lightbulb sx={{ color: 'primary.main' }} />
                    <Typography variant="h4">
                        {selectedConcept.concept_title || 'Key Concept'}
                    </Typography>
                </Box>

                {conceptsArray.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ButtonGroup size="small">
                            <IconButton onClick={handlePrevious} size="small">
                                <ChevronLeft />
                            </IconButton>
                            <IconButton onClick={handleNext} size="small">
                                <ChevronRight />
                            </IconButton>
                        </ButtonGroup>
                        <Typography variant="body2" color="text.secondary">
                            {selectedConceptIndex + 1} of {conceptsArray.length}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box>
                <Typography variant="body1" paragraph>
                    {renderWithLaTeX(selectedConcept.concept_statement || '')}
                </Typography>

                {renderFormulaArray(selectedConcept.formula)}

                {renderDerivationArray(selectedConcept.derivation)}

                {selectedConcept.supplementary_note && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {renderWithLaTeX(selectedConcept.supplementary_note)}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    )
}

export default KeyConceptHighlight

