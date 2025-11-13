import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardActionArea,
    Chip
} from '@mui/material'
import {
    Lightbulb,
    ArrowForward
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { createTopicTagUrl } from '../../utils/urlHelpers'
import { useTranslation } from '../../hooks/useTranslation'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

/**
 * Component that displays excerpts of key concepts with links to full examples
 * Fetches key concepts from the database and shows preview cards
 *
 * @param {number} limit - Maximum number of concepts to display (default: 6)
 * @param {string} topic - Optional topic filter to show only concepts for a specific topic
 * @param {string} tag - Optional tag filter to show only concepts for a specific tag
 * @param {Array} questionTags - Optional array of tag objects from question (e.g., [{tag: "formula"}, {tag: "changing subject"}])
 *
 * @example
 * // Display 6 key concepts
 * <KeyConceptExcerpts />
 *
 * @example
 * // Display concepts for a specific topic
 * <KeyConceptExcerpts topic="quadratic equations in one unknown" limit={4} />
 *
 * @example
 * // Display concepts matching question tags
 * <KeyConceptExcerpts questionTags={[{tag: "formula"}, {tag: "changing subject"}]} />
 */
const KeyConceptExcerpts = ({ limit = 6, topic = null, tag = null, questionTags = null }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isChinese, translateTopicTag, currentLanguage } = useTranslation()

    const [concepts, setConcepts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchKeyConcepts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic, tag, questionTags, isChinese])

    const fetchKeyConcepts = async () => {
        setLoading(true)
        setError(null)

        try {
            // If questionTags are provided, first look up topic/tag pairs from topic_tags
            let topicTagPairs = []
            if (questionTags && questionTags.length > 0) {
                // Extract tag strings (could be English or Chinese)
                // Handle both {tag: "string"} format and just tag strings
                const tagStrings = questionTags
                    .map(t => typeof t === 'string' ? t : (t.tag || t))
                    .filter(Boolean)

                if (tagStrings.length > 0) {
                    // Query topic_tags to find matching topic/tag pairs
                    // Query each tag string separately for both English and Chinese matches
                    const tagQueries = tagStrings.flatMap(tagStr => [
                    // Query for English tag match - tags are always derived from topic_tags
                    supabase
                        .from('topic_tags')
                        .select('topic, tag, topic_ch, tag_ch')
                        .eq('is_active', true)
                        .eq('tag', tagStr),
                    // Query for Chinese tag match - tags are always derived from topic_tags
                    supabase
                        .from('topic_tags')
                        .select('topic, tag, topic_ch, tag_ch')
                        .eq('is_active', true)
                        .eq('tag_ch', tagStr)
                    ])

                    const tagResults = await Promise.all(tagQueries)
                    const topicTagData = []
                    tagResults.forEach((result) => {
                        if (result.error) {
                            console.error('Error querying topic_tags:', result.error)
                        }
                        if (result.data && result.data.length > 0) {
                            topicTagData.push(...result.data)
                        }
                    })

                    if (topicTagData && topicTagData.length > 0) {
                        // Get unique topic/tag pairs - use ENGLISH topic and tag from topic_tags
                        // key_concepts table uses English topic/tag only (no topic_ch or tag_ch columns)
                        // Tags are always derived from topic_tags table, so we get exact English pairs
                        const pairsMap = {}
                        topicTagData.forEach(item => {
                            // Use English topic and tag (key_concepts table stores English only)
                            const key = `${item.topic}::${item.tag}`
                            if (!pairsMap[key]) {
                                pairsMap[key] = {
                                    topic: item.topic,      // English topic for querying key_concepts
                                    tag: item.tag,          // English tag for querying key_concepts
                                    topic_ch: item.topic_ch || null, // Chinese topic for display
                                    tag_ch: item.tag_ch || null      // Chinese tag for display
                                }
                            }
                        })
                        topicTagPairs = Object.values(pairsMap)
                    }
                }
            }

            let query = supabase
                .from('key_concepts')
                .select('id, topic, tag, concept_title, concept_title_ch, concept_statement, concept_statement_ch, created_at')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            // Filter by topic/tag if provided
            if (topic) {
                query = query.eq('topic', topic)
            }
            if (tag) {
                query = query.eq('tag', tag)
            }

            // If we have topic/tag pairs from questionTags, filter by them
            let data = null
            let fetchError = null

            if (topicTagPairs.length > 0) {
                // Query each topic/tag pair separately with EXACT match
                // Tags are always derived from topic_tags table, so we use exact topic/tag pairs
                const queryPromises = topicTagPairs.map(pair => {
                    return supabase
                        .from('key_concepts')
                        .select('id, topic, tag, concept_title, concept_title_ch, concept_statement, concept_statement_ch, created_at')
                        .eq('is_active', true)
                        .eq('topic', pair.topic)  // Exact match for topic
                        .eq('tag', pair.tag)       // Exact match for tag
                        .order('created_at', { ascending: false })
                        .limit(limit * 2)
                })

                const results = await Promise.all(queryPromises)
                const allConcepts = []
                results.forEach((result) => {
                    if (result.error) {
                        console.error('Error querying key_concepts:', result.error)
                        fetchError = result.error
                    } else if (result.data) {
                        if (result.data.length > 0) {
                            allConcepts.push(...result.data)
                        }
                    }
                })

                // Remove duplicates and sort by created_at
                const uniqueConcepts = {}
                allConcepts.forEach(concept => {
                    const key = `${concept.topic}::${concept.tag}::${concept.id}`
                    if (!uniqueConcepts[key] ||
                        new Date(concept.created_at) > new Date(uniqueConcepts[key].created_at)) {
                        uniqueConcepts[key] = concept
                    }
                })
                data = Object.values(uniqueConcepts).sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                )
            } else {
                // No questionTags, use regular query
                const result = await query.limit(limit * 2)
                data = result.data
                fetchError = result.error
                if (result.error) {
                    console.error('Error querying key_concepts:', result.error)
                }
            }

            if (fetchError) throw fetchError

            // Group concepts by topic/tag and get the first one from each group
            const groupedConcepts = {}
            if (data && data.length > 0) {
                data.forEach(concept => {
                    const key = `${concept.topic}::${concept.tag}`
                    if (!groupedConcepts[key] ||
                        new Date(concept.created_at) > new Date(groupedConcepts[key].created_at)) {
                        groupedConcepts[key] = concept
                    }
                })
            }

            const uniqueConcepts = Object.values(groupedConcepts).slice(0, limit)

            // Add Chinese translations to concepts
            // We already have topic_ch and tag_ch from the topicTagPairs lookup
            // Create a map for quick lookup
            if (uniqueConcepts.length > 0) {
                const translationMap = {}
                topicTagPairs.forEach(pair => {
                    const key = `${pair.topic}::${pair.tag}`
                    translationMap[key] = {
                        topic_ch: pair.topic_ch,
                        tag_ch: pair.tag_ch
                    }
                })

                // Add translations to concepts using the map
                const conceptsWithTranslations = uniqueConcepts.map(concept => {
                    const key = `${concept.topic}::${concept.tag}`
                    const translation = translationMap[key]
                    return {
                        ...concept,
                        topic_ch: translation?.topic_ch || null,
                        tag_ch: translation?.tag_ch || null
                    }
                })

                setConcepts(conceptsWithTranslations)
            } else {
                setConcepts([])
            }
        } catch (err) {
            console.error('Error fetching key concepts:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleConceptClick = async (concept) => {
        try {
            // Get Chinese translations for navigation
            const { topic: topicCh, tag: tagCh } = await translateTopicTag(concept.topic, concept.tag)
            const finalTopicCh = topicCh !== concept.topic ? topicCh : null
            const finalTagCh = tagCh !== concept.tag ? tagCh : null

            // Create URL and navigate with referrer information
            const url = createTopicTagUrl(concept.topic, concept.tag, finalTopicCh, finalTagCh, currentLanguage)
            // Pass current location as referrer so back button can show question details
            navigate(url, {
                state: {
                    referrer: location.pathname + location.search
                }
            })
        } catch (err) {
            console.error('Error navigating to concept:', err)
            // Fallback: navigate without translations
            const url = createTopicTagUrl(concept.topic, concept.tag, null, null, currentLanguage)
            navigate(url, {
                state: {
                    referrer: location.pathname + location.search
                }
            })
        }
    }

    // Helper function to render text with LaTeX (for excerpts)
    const renderWithLaTeX = (text) => {
        if (!text) return ''
        const parts = text.split(/(\$[^$]+\$)/g)
        return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                const math = part.slice(1, -1)
                return <InlineMath key={index} math={math} />
            }
            return <span key={index}>{part}</span>
        })
    }

    // Truncate text to excerpt length
    const truncateText = (text, maxLength = 150) => {
        if (!text || text.length <= maxLength) return text
        // Find the last space before maxLength to avoid cutting words
        const truncated = text.substring(0, maxLength)
        const lastSpace = truncated.lastIndexOf(' ')
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        )
    }

    // Always show the component for debugging, even if no concepts found
    if (concepts.length === 0 && !loading && !error) {
        // Show a message if no concepts found (for debugging)
        return (
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Lightbulb sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
                    <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        {isChinese() ? '重點概念預覽' : 'Key Concepts Preview'}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {isChinese()
                        ? '暫無相關重點概念'
                        : 'No related key concepts found'}
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ mb: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Lightbulb sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
                <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {isChinese() ? '重點概念預覽' : 'Key Concepts Preview'}
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                width: '100%'
            }}>
                {concepts.map((concept) => {
                    const title = (isChinese() && concept.concept_title_ch && concept.concept_title_ch.trim())
                        ? concept.concept_title_ch
                        : (concept.concept_title || 'Key Concept')

                    const statement = (isChinese() && concept.concept_statement_ch && concept.concept_statement_ch.trim())
                        ? concept.concept_statement_ch
                        : (concept.concept_statement || '')

                    const excerpt = truncateText(statement, 120)
                    const topicDisplay = (isChinese() && concept.topic_ch) ? concept.topic_ch : concept.topic
                    const tagDisplay = (isChinese() && concept.tag_ch) ? concept.tag_ch : concept.tag

                    return (
                        <Box key={concept.id} sx={{
                            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                            minWidth: 0
                        }}>
                            <Card
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                                elevation={2}
                            >
                                <CardActionArea
                                    onClick={() => handleConceptClick(concept)}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        p: 2
                                    }}
                                >
                                    <Box sx={{ width: '100%', mb: 1 }}>
                                        <Chip
                                            label={topicDisplay}
                                            size="small"
                                            sx={{ mb: 0.5, mr: 0.5 }}
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={tagDisplay}
                                            size="small"
                                            sx={{ mb: 0.5 }}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: { xs: '1rem', sm: '1.125rem' },
                                            fontWeight: 600,
                                            mb: 1.5,
                                            color: 'primary.main',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                            color: 'text.secondary',
                                            mb: 2,
                                            flexGrow: 1,
                                            lineHeight: 1.6,
                                            '& .katex': {
                                                fontSize: '0.9em'
                                            }
                                        }}
                                    >
                                        {renderWithLaTeX(excerpt)}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'primary.main',
                                            mt: 'auto',
                                            pt: 1
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                                mr: 0.5
                                            }}
                                        >
                                            {isChinese() ? '查看完整內容' : 'View Full Content'}
                                        </Typography>
                                        <ArrowForward sx={{ fontSize: 16 }} />
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

export default KeyConceptExcerpts

