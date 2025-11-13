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
    useTheme,
    Button
} from '@mui/material'
import {
    Menu,
    MenuOpen,
    ChevronLeft,
    ChevronRight,
    MenuBook,
    Construction,
    ArrowBack
} from '@mui/icons-material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { parseTopicTagUrl, createTopicTagUrl } from '../../utils/urlHelpers'
import { useTranslation } from '../../hooks/useTranslation'
import ExampleSidebar from './ExampleSidebar'
import KeyConceptHighlight from './KeyConceptHighlight'
import ExampleQuestions from './ExampleQuestions'

const ExampleModule = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = useParams()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { topic: topicParam, tag: tagParam } = params || {}
    const { isChinese, translateTopicTag, lookupEnglishFromChinese, currentLanguage } = useTranslation()

    // Get referrer from navigation state
    const referrer = location.state?.referrer

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState(null)
    const [selectedTag, setSelectedTag] = useState(null)
    const [topicTranslation, setTopicTranslation] = useState(null)
    const [tagTranslation, setTagTranslation] = useState(null)

    const [concepts, setConcepts] = useState([])
    const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
    const [examples, setExamples] = useState([])
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Initialize from URL params on mount or when params change
    useEffect(() => {
        const initializeFromUrl = async () => {
            if (topicParam && tagParam) {
                const parsed = await parseTopicTagUrl(topicParam, tagParam)
                if (parsed) {
                    if (parsed.isChinese) {
                        // URL contains Chinese - need to look up English equivalents
                        const { topic, tag } = await lookupEnglishFromChinese(parsed.topic, parsed.tag)
                        setSelectedTopic(topic)
                        setSelectedTag(tag)
                        // Set Chinese translations from URL
                        setTopicTranslation(parsed.topic)
                        setTagTranslation(parsed.tag)
                    } else {
                        // URL contains English
                        setSelectedTopic(parsed.topic)
                        setSelectedTag(parsed.tag)
                        // Fetch Chinese translations
                        translateTopicTag(parsed.topic, parsed.tag).then(({ topic, tag }) => {
                            // Only set if different from English (actual translation exists)
                            setTopicTranslation(topic !== parsed.topic ? topic : null)
                            setTagTranslation(tag !== parsed.tag ? tag : null)
                        }).catch(err => {
                            console.error('Error fetching translations:', err)
                            setTopicTranslation(null)
                            setTagTranslation(null)
                        })
                    }
                }
            } else {
                // Clear selections if no URL params
                setSelectedTopic(null)
                setSelectedTag(null)
                setTopicTranslation(null)
                setTagTranslation(null)
                setConcepts([])
                setExamples([])
            }
        }
        initializeFromUrl()
    }, [topicParam, tagParam, translateTopicTag, lookupEnglishFromChinese])

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
            // Fetch key concepts with Chinese translations
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

    const handleTopicTagSelect = async (topic, tag) => {
        // Fetch translations first
        const { topic: topicCh, tag: tagCh } = await translateTopicTag(topic, tag)
        // Only set if different from English (actual translation exists)
        const finalTopicCh = topicCh !== topic ? topicCh : null
        const finalTagCh = tagCh !== tag ? tagCh : null

        // Create URL with Chinese translations if language is Chinese
        const url = createTopicTagUrl(topic, tag, finalTopicCh, finalTagCh, currentLanguage)
        navigate(url)

        setTopicTranslation(finalTopicCh)
        setTagTranslation(finalTagCh)
    }

    // Update translations when language changes or topic/tag changes
    useEffect(() => {
        if (selectedTopic && selectedTag) {
            const fetchTranslations = async () => {
                try {
                    const { topic, tag } = await translateTopicTag(selectedTopic, selectedTag)
                    // Only set if different from English (actual translation exists)
                    setTopicTranslation(topic !== selectedTopic ? topic : null)
                    setTagTranslation(tag !== selectedTag ? tag : null)
                } catch (err) {
                    console.error('Error fetching translations:', err)
                    setTopicTranslation(null)
                    setTagTranslation(null)
                }
            }
            fetchTranslations()
        }
    }, [selectedTopic, selectedTag, isChinese, translateTopicTag])

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                    >
                        {sidebarOpen ? <MenuOpen /> : <Menu />}
                    </IconButton>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => {
                            if (referrer) {
                                navigate(referrer)
                            } else {
                                navigate(-1)
                            }
                        }}
                        sx={{
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        }}
                    >
                        {(() => {
                            if (!referrer) return 'Back'
                            const dseMathMatch = referrer.match(/\/DSE_Math\/(\d{4})\/([IVX]+)\/(\d+)/)
                            if (dseMathMatch) {
                                const [, year, paper, questionNo] = dseMathMatch
                                return `Back to ${year} Paper ${paper} Question ${questionNo}`
                            }
                            return 'Back'
                        })()}
                    </Button>
                </Box>
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
                            {(isChinese() && topicTranslation && topicTranslation !== selectedTopic) ? topicTranslation : selectedTopic} &gt; {(isChinese() && tagTranslation && tagTranslation !== selectedTag) ? tagTranslation : selectedTag}
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
                                    `Content for ${(isChinese() && topicTranslation && topicTranslation !== selectedTopic) ? topicTranslation : selectedTopic} > ${(isChinese() && tagTranslation && tagTranslation !== selectedTag) ? tagTranslation : selectedTag} is currently under construction. Please check back soon.`
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

