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

        // Split by $ delimiters, but handle nested cases
        const parts = text.split(/(\$[^$]+\$)/g)

        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                let mathContent = part.slice(1, -1)
                // Normalize escaped backslashes - handle multiple levels of escaping
                // Replace \\\\ with \\, then \\ with \ (in case of double escaping)
                // This handles cases where backslashes are escaped in the database
                while (mathContent.includes('\\\\')) {
                    mathContent = mathContent.replace(/\\\\/g, '\\')
                }
                return <InlineMath key={index} math={mathContent} />
            }
            return <span key={index}>{part}</span>
        })
    }

    const renderFormulaArray = (formulaArray) => {
        if (!formulaArray || formulaArray.length === 0) return null

        return (
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FunctionsIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Formula/ Core Idea
                    </Typography>
                </Box>
                {/* Centered highlighted container for formulas */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2
                    }}
                >
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
                        {formulaArray.map((item, index) => {
                            const trimmed = item.trim()
                            const isPureMath = trimmed.startsWith('$') && trimmed.endsWith('$')

                            if (isPureMath) {
                                let mathContent = trimmed.slice(1, -1)
                                // Normalize escaped backslashes - handle multiple levels of escaping
                                while (mathContent.includes('\\\\')) {
                                    mathContent = mathContent.replace(/\\\\/g, '\\')
                                }

                                // Check if math content contains \n (newline inside math block)
                                const hasNewline = mathContent.includes('\\n') || mathContent.includes('\n')

                                if (hasNewline) {
                                    // Split math content by \n and render each part as separate BlockMath
                                    const mathLines = mathContent.split(/\\n|\n/).filter(line => line.trim() !== '')

                                    return (
                                        <Box key={index} sx={{ mb: 1, pl: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
                                            {mathLines.map((line, lineIndex) => {
                                                const trimmedLine = line.trim()
                                                // Normalize backslashes for this line
                                                let normalizedLine = trimmedLine
                                                while (normalizedLine.includes('\\\\')) {
                                                    normalizedLine = normalizedLine.replace(/\\\\/g, '\\')
                                                }

                                                return (
                                                    <Box
                                                        key={lineIndex}
                                                        sx={{
                                                            mb: lineIndex < mathLines.length - 1 ? 0.5 : 0,
                                                            overflowX: 'auto',
                                                            '& .katex-display': {
                                                                textAlign: 'left !important',
                                                                margin: '0.5em 0'
                                                            }
                                                        }}
                                                    >
                                                        <BlockMath math={normalizedLine} />
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    )
                                } else {
                                    // No newlines, render as single BlockMath
                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                mb: 1,
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
                                }
                            } else {
                                // Mixed content (text + math) - check if \n is inside a math block
                                // Find all math blocks and check if any contain \n
                                const mathBlockRegex = /\$([^$]+)\$/g
                                const mathBlocks = []
                                let match

                                while ((match = mathBlockRegex.exec(item)) !== null) {
                                    mathBlocks.push({
                                        start: match.index,
                                        end: match.index + match[0].length,
                                        fullMatch: match[0],
                                        content: match[1]
                                    })
                                }

                                // Check if any math block contains \n
                                const hasNewlineInMath = mathBlocks.some(block =>
                                    block.content.includes('\\n') || block.content.includes('\n')
                                )

                                if (hasNewlineInMath) {
                                    // Process each math block that contains \n
                                    let result = []
                                    let currentIndex = 0

                                    mathBlocks.forEach((block, blockIndex) => {
                                        // Add text before this math block
                                        if (currentIndex < block.start) {
                                            const textBefore = item.slice(currentIndex, block.start)
                                            if (textBefore.trim()) {
                                                result.push({ type: 'text', content: textBefore })
                                            }
                                        }

                                        // Process math block with \n
                                        if (block.content.includes('\\n') || block.content.includes('\n')) {
                                            let mathContent = block.content
                                            // Normalize backslashes
                                            while (mathContent.includes('\\\\')) {
                                                mathContent = mathContent.replace(/\\\\/g, '\\')
                                            }
                                            // Split by \n
                                            const mathLines = mathContent.split(/\\n|\n/).filter(line => line.trim() !== '')
                                            result.push({ type: 'math-multiline', content: mathLines })
                                        } else {
                                            // Single math block without \n
                                            let mathContent = block.content
                                            while (mathContent.includes('\\\\')) {
                                                mathContent = mathContent.replace(/\\\\/g, '\\')
                                            }
                                            result.push({ type: 'math', content: mathContent })
                                        }

                                        currentIndex = block.end
                                    })

                                    // Add remaining text after last math block
                                    if (currentIndex < item.length) {
                                        const textAfter = item.slice(currentIndex)
                                        if (textAfter.trim()) {
                                            result.push({ type: 'text', content: textAfter })
                                        }
                                    }

                                    return (
                                        <Box key={index} sx={{ mb: 1, pl: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
                                            {result.map((part, partIndex) => {
                                                if (part.type === 'text') {
                                                    return (
                                                        <Typography
                                                            key={partIndex}
                                                            variant="body1"
                                                            component="span"
                                                            sx={{
                                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                                                '& .katex': {
                                                                    fontSize: { xs: '0.9em', sm: '1em' }
                                                                }
                                                            }}
                                                        >
                                                            {renderWithLaTeX(part.content)}
                                                        </Typography>
                                                    )
                                                } else if (part.type === 'math-multiline') {
                                                    return (
                                                        <Box key={partIndex}>
                                                            {part.content.map((mathLine, lineIndex) => {
                                                                let normalizedLine = mathLine.trim()
                                                                while (normalizedLine.includes('\\\\')) {
                                                                    normalizedLine = normalizedLine.replace(/\\\\/g, '\\')
                                                                }
                                                                return (
                                                                    <Box
                                                                        key={lineIndex}
                                                                        sx={{
                                                                            mb: lineIndex < part.content.length - 1 ? 0.5 : 0,
                                                                            overflowX: 'auto',
                                                                            '& .katex-display': {
                                                                                textAlign: 'left !important',
                                                                                margin: '0.5em 0'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <BlockMath math={normalizedLine} />
                                                                    </Box>
                                                                )
                                                            })}
                                                        </Box>
                                                    )
                                                } else if (part.type === 'math') {
                                                    return (
                                                        <Box key={partIndex} component="span" sx={{ display: 'inline-block', overflowX: 'auto' }}>
                                                            <InlineMath math={part.content} />
                                                        </Box>
                                                    )
                                                }
                                                return null
                                            })}
                                        </Box>
                                    )
                                } else {
                                    // No newlines in math blocks, render normally
                                    return (
                                        <Typography
                                            key={index}
                                            variant="body1"
                                            sx={{
                                                mb: 1,
                                                pl: { xs: 1.5, sm: 2 },
                                                textAlign: 'left',
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
                            }
                        })}
                    </Paper>
                </Box>
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

