import React, { useState, useEffect } from 'react'
import {
    Container,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Paper,
    useMediaQuery,
    useTheme
} from '@mui/material'
import {
    Menu,
    MenuOpen,
    ChevronLeft,
    ChevronRight,
    MenuBook,
    Construction
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { parseTopicTagUrl, createTopicTagUrl } from '../../utils/urlHelpers'
import ExampleSidebar from './ExampleSidebar'
import KeyConceptHighlight from './KeyConceptHighlight'
import ExampleQuestions from './ExampleQuestions'

const ExampleModule = () => {
    const navigate = useNavigate()
    const params = useParams()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { topic: topicParam, tag: tagParam } = params || {}

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState(null)
    const [selectedTag, setSelectedTag] = useState(null)

    const [concepts, setConcepts] = useState([])
    const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
    const [examples, setExamples] = useState([])
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Initialize from URL params on mount or when params change
    useEffect(() => {
        if (topicParam && tagParam) {
            const parsed = parseTopicTagUrl(topicParam, tagParam)
            if (parsed) {
                setSelectedTopic(parsed.topic)
                setSelectedTag(parsed.tag)
            }
        } else {
            // Clear selections if no URL params
            setSelectedTopic(null)
            setSelectedTag(null)
            setConcepts([])
            setExamples([])
        }
    }, [topicParam, tagParam])

    useEffect(() => {
        // Fetch from database when topic/tag is selected
        if (selectedTopic && selectedTag) {
            fetchConcepts(selectedTopic, selectedTag)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTopic, selectedTag])

    // Fetch examples when concept index changes
    useEffect(() => {
        if (concepts.length > 0 && currentConceptIndex >= 0 && currentConceptIndex < concepts.length) {
            const currentConcept = concepts[currentConceptIndex]
            if (currentConcept && currentConcept.id) {
                fetchExamples(currentConcept.id)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConceptIndex, concepts])

    const fetchConcepts = async (topic, tag) => {
        setLoading(true)
        setError(null)

        try {
            // Fetch key concepts
            const { data: conceptsData, error: conceptsError } = await supabase
                .from('key_concepts')
                .select('*')
                .eq('topic', topic)
                .eq('tag', tag)
                .eq('is_active', true)
                .order('created_at')

            if (conceptsError) throw conceptsError

            setConcepts(conceptsData || [])
            setCurrentConceptIndex(0)

            // If we have concepts, fetch examples for the first one
            if (conceptsData && conceptsData.length > 0 && conceptsData[0]?.id) {
                await fetchExamples(conceptsData[0].id)
            } else {
                setExamples([])
                setCurrentExampleIndex(0)
            }
        } catch (err) {
            console.error('Error fetching concepts:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchExamples = async (keyConceptId) => {
        try {
            setLoading(true)
            const { data: examplesData, error: examplesError } = await supabase
                .from('note_examples')
                .select('*')
                .eq('key_concept_id', keyConceptId)
                .eq('is_active', true)
                .order('display_order')
                .order('created_at')

            if (examplesError) throw examplesError

            setExamples(examplesData || [])
            setCurrentExampleIndex(0)
        } catch (err) {
            console.error('Error fetching examples:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleConceptChange = (newIndex) => {
        if (concepts[newIndex]) {
            setCurrentConceptIndex(newIndex)
            setCurrentExampleIndex(0) // Reset to first example when concept changes
            // Note: URL stays the same, only concept selection changes
        }
    }

    const handleExamplePrevious = () => {
        setCurrentExampleIndex((prev) => (prev > 0 ? prev - 1 : examples.length - 1))
    }

    const handleExampleNext = () => {
        setCurrentExampleIndex((prev) => (prev < examples.length - 1 ? prev + 1 : 0))
    }

    const handleTopicTagSelect = (topic, tag) => {
        // Navigate to the topic/tag URL
        const url = createTopicTagUrl(topic, tag)
        navigate(url)
    }

    // Render "Under Construction" message
    const renderUnderConstruction = (message) => (
        <Paper
            elevation={2}
            sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: 'background.default',
                border: '2px dashed',
                borderColor: 'divider'
            }}
        >
            <Construction sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
                Under Construction
            </Typography>
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
        </Paper>
    )

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 2 },
                mb: { xs: 3, sm: 4 }
            }}>
                <IconButton
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                >
                    {sidebarOpen ? <MenuOpen /> : <Menu />}
                </IconButton>
                {selectedTopic && selectedTag && (
                    <Box sx={{
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.5, sm: 2 },
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        display: 'inline-block',
                        alignSelf: { xs: 'flex-start', sm: 'center' },
                        ml: { xs: 0, sm: 'auto' },
                        width: { xs: '100%', sm: 'auto' }
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: '1rem', sm: '1.5rem' },
                                wordBreak: 'break-word'
                            }}
                        >
                            {selectedTopic} &gt; {selectedTag}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: { xs: 0, md: 3 } }}>
                {/* Sidebar */}
                <ExampleSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onTopicTagSelect={handleTopicTagSelect}
                />

                {/* Spacer for sidebar */}
                {sidebarOpen && (
                    <Box
                        sx={{
                            width: 280,
                            flexShrink: 0,
                            display: { xs: 'none', md: 'block' }
                        }}
                    />
                )}

                {/* Main Content */}
                <Box sx={{ flex: 1, minWidth: 0, width: '100%', maxWidth: '100%' }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            Error: {error}
                        </Alert>
                    )}

                    {!loading && !error && (selectedTopic && selectedTag) && (
                        <>
                            {concepts.length > 0 && (
                                <KeyConceptHighlight
                                    concepts={concepts}
                                    onConceptChange={handleConceptChange}
                                    currentIndex={currentConceptIndex}
                                />
                            )}

                            {concepts.length > 0 && examples.length > 0 && (
                                <Box>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        justifyContent: 'space-between',
                                        mb: { xs: 2, sm: 3 },
                                        p: { xs: 1.5, sm: 2 },
                                        backgroundColor: 'background.paper',
                                        borderRadius: 1,
                                        boxShadow: 1,
                                        gap: { xs: 2, sm: 0 }
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MenuBook sx={{ fontSize: { xs: 24, sm: 28 }, color: 'primary.main', flexShrink: 0 }} />
                                            <Typography variant="h6" component="h2" sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
                                                <Typography component="span" variant="body2" sx={{ ml: 0.5, color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                    ({currentExampleIndex + 1} of {examples.length})
                                                </Typography>
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: { xs: 1, sm: 2 },
                                            alignSelf: { xs: 'stretch', sm: 'center' },
                                            justifyContent: { xs: 'space-between', sm: 'flex-end' }
                                        }}>
                                            <IconButton
                                                onClick={handleExamplePrevious}
                                                disabled={loading}
                                                aria-label="Previous Example"
                                                color="primary"
                                                size={isMobile ? 'small' : 'medium'}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover'
                                                    }
                                                }}
                                            >
                                                <ChevronLeft />
                                            </IconButton>
                                            <Typography
                                                variant="body1"
                                                color="text.primary"
                                                sx={{
                                                    minWidth: { xs: '50px', sm: '60px' },
                                                    textAlign: 'center',
                                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                                }}
                                            >
                                                {currentExampleIndex + 1} / {examples.length}
                                            </Typography>
                                            <IconButton
                                                onClick={handleExampleNext}
                                                disabled={loading}
                                                aria-label="Next Example"
                                                color="primary"
                                                size={isMobile ? 'small' : 'medium'}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover'
                                                    }
                                                }}
                                            >
                                                <ChevronRight />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <ExampleQuestions example={examples[currentExampleIndex]} />
                                </Box>
                            )}

                            {concepts.length > 0 && examples.length === 0 && (
                                renderUnderConstruction(
                                    `Examples for this key concept are currently under construction. Please check back soon.`
                                )
                            )}

                            {concepts.length === 0 && (
                                renderUnderConstruction(
                                    `Content for ${selectedTopic} > ${selectedTag} is currently under construction. Please check back soon.`
                                )
                            )}
                        </>
                    )}

                    {!loading && !error && !selectedTopic && !selectedTag && (
                        <Alert severity="info">
                            Please select a topic and tag from the sidebar to view examples.
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    )
}

export default ExampleModule

