import React, { useState, useEffect } from 'react'
import {
    Container,
    Box,
    Typography,
    IconButton,
    Button,
    CircularProgress,
    Alert
} from '@mui/material'
import {
    ArrowBack,
    Menu,
    MenuOpen,
    ChevronLeft,
    ChevronRight,
    MenuBook
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import ExampleSidebar from './ExampleSidebar'
import KeyConceptHighlight from './KeyConceptHighlight'
import ExampleQuestions from './ExampleQuestions'

// Demo data for visual preview
const demoConcepts = [
    {
        id: 'demo-concept-1',
        concept_title: "Key Concept: Incenter - Basic Definition",
        concept_statement: "The incenter of a triangle is the point where the angle bisectors of the triangle meet. It is equidistant from all three sides of the triangle and is the center of the triangle's incircle. For a triangle formed by three lines $L_1$, $L_2$, and $L_3$ in the coordinate plane, the incenter can be found using the formula for the intersection of angle bisectors.",
        formula: [
            "If the three lines are $L_1: a_1x + b_1y + c_1 = 0$, $L_2: a_2x + b_2y + c_2 = 0$, and $L_3: a_3x + b_3y + c_3 = 0$, then the incenter coordinates are given by:",
            "$I = \\left(\\frac{d_1x_1 + d_2x_2 + d_3x_3}{d_1 + d_2 + d_3}, \\frac{d_1y_1 + d_2y_2 + d_3y_3}{d_1 + d_2 + d_3}\\right)$"
        ],
        derivation: [],
        supplementary_note: "Where $d_i$ represents the distance from each line."
    },
    {
        id: 'demo-concept-2',
        concept_title: "Key Concept: Incenter - Properties",
        concept_statement: "The incenter has several important geometric properties that make it unique among triangle centers.",
        formula: [],
        derivation: [
            "Property 1: Equidistant from all three sides",
            "Property 2: Center of the incircle (circle inscribed in triangle)",
            "Property 3: Intersection point of the three angle bisectors",
            "Property 4: Always lies inside the triangle"
        ],
        supplementary_note: "These properties are fundamental to understanding the incenter's role in triangle geometry."
    }
]

const demoExamples = [
    {
        problem: "Two lines are $L_1: x - y + 2 = 0$ and $L_2: x + y - 4 = 0$ (symmetric about $y = 3$ as before). The incenter of the triangle formed with a third line $L_3: y = mx - 1$ is $I = (1, 2)$. Find $m$.",
        steps: [
            {
                title: "Step 1: Find intersection points",
                description: "First, we need to find the three vertices of the triangle formed by the three lines.",
                math: "\\text{Intersection of } L_1 \\text{ and } L_2: \\text{Solve } \\begin{cases} x - y + 2 = 0 \\\\ x + y - 4 = 0 \\end{cases}"
            },
            {
                title: "Step 2: Apply incenter formula",
                description: "Using the incenter formula with the given coordinates.",
                math: "I = (1, 2) = \\left(\\frac{d_1x_1 + d_2x_2 + d_3x_3}{d_1 + d_2 + d_3}, \\frac{d_1y_1 + d_2y_2 + d_3y_3}{d_1 + d_2 + d_3}\\right)"
            },
            {
                title: "Step 3: Solve for m",
                description: "Substitute the known values and solve for the slope m.",
                math: "\\text{After substitution: } 1 = \\frac{d_1x_1 + d_2x_2 + d_3x_3}{d_1 + d_2 + d_3}"
            }
        ],
        diagrams: [
            '<iframe scrolling="no" title="2020 II 19" src="https://www.geogebra.org/material/iframe/id/pzknre5z/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/true/sdz/true/ctl/false" width="490px" height="420px" style="border:0px;"> </iframe>',
            '<iframe scrolling="no" title="2020 II 39" src="https://www.geogebra.org/material/iframe/id/htaavedb/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false" width="490px" height="420px" style="border:0px;"> </iframe>'
        ]
    },
    {
        problem: "Given a triangle with vertices at $(0, 0)$, $(4, 0)$, and $(2, 3)$, find the incenter of the triangle using the coordinate geometry method.",
        steps: [
            {
                title: "Step 1: Calculate side lengths",
                description: "Find the lengths of all three sides of the triangle.",
                math: "a = \\sqrt{(4-2)^2 + (0-3)^2} = \\sqrt{13}, \\quad b = \\sqrt{(2-0)^2 + (3-0)^2} = \\sqrt{13}, \\quad c = 4"
            },
            {
                title: "Step 2: Apply weighted centroid formula",
                description: "Use the incenter formula with weighted coordinates.",
                math: "I = \\left(\\frac{ax_1 + bx_2 + cx_3}{a+b+c}, \\frac{ay_1 + by_2 + cy_3}{a+b+c}\\right)"
            }
        ],
        diagrams: [
            '<iframe scrolling="no" title="Triangle Example" src="https://www.geogebra.org/material/iframe/id/pzknre5z/width/490/height/420/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/true/sdz/true/ctl/false" width="490px" height="420px" style="border:0px;"> </iframe>'
        ]
    }
]

const ExampleModule = () => {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState(null)
    const [selectedTag, setSelectedTag] = useState(null)
    const [useDemoData, setUseDemoData] = useState(true) // Toggle for demo mode

    const [concepts, setConcepts] = useState([])
    const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
    const [examples, setExamples] = useState([])
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Load demo data on mount
        if (useDemoData && !selectedTopic && !selectedTag) {
            setSelectedTopic('Geometry')
            setSelectedTag('Incenter')
            setConcepts(demoConcepts)
            setExamples(demoExamples)
            setCurrentExampleIndex(0)
            setCurrentConceptIndex(0)
            return
        }

        // Fetch from database when topic/tag is selected (and not in demo mode)
        if (selectedTopic && selectedTag && !useDemoData) {
            fetchConcepts(selectedTopic, selectedTag)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTopic, selectedTag, useDemoData])

    // Fetch examples when concept index changes
    useEffect(() => {
        if (!useDemoData && concepts.length > 0 && currentConceptIndex >= 0 && currentConceptIndex < concepts.length) {
            const currentConcept = concepts[currentConceptIndex]
            if (currentConcept && currentConcept.id) {
                fetchExamples(currentConcept.id)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConceptIndex, concepts, useDemoData])

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
            if (conceptsData && conceptsData.length > 0 && conceptsData[0].id) {
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
        setCurrentConceptIndex(newIndex)
        setCurrentExampleIndex(0) // Reset to first example when concept changes
    }

    const handleExamplePrevious = () => {
        setCurrentExampleIndex((prev) => (prev > 0 ? prev - 1 : examples.length - 1))
    }

    const handleExampleNext = () => {
        setCurrentExampleIndex((prev) => (prev < examples.length - 1 ? prev + 1 : 0))
    }

    const handleTopicTagSelect = (topic, tag) => {
        setUseDemoData(false) // Disable demo mode when selecting from sidebar
        setSelectedTopic(topic)
        setSelectedTag(tag)
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <MenuOpen /> : <Menu />}
                </IconButton>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    variant="outlined"
                >
                    Back to Home
                </Button>
                <Box sx={{ flex: 1 }} />
                {selectedTopic && selectedTag && (
                    <Box sx={{
                        px: 3,
                        py: 2,
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        display: 'inline-block'
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {selectedTopic} &gt; {selectedTag}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 3 }}>
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
                <Box sx={{ flex: 1, minWidth: 0 }}>
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

                            {examples.length > 0 && (
                                <Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 3,
                                        p: 2,
                                        backgroundColor: 'background.paper',
                                        borderRadius: 1,
                                        boxShadow: 1
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MenuBook sx={{ fontSize: 28, color: 'primary.main' }} />
                                            <Typography variant="h6" component="h2">
                                                <Typography component="span" variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                                                    ({currentExampleIndex + 1} of {examples.length})
                                                </Typography>
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <IconButton
                                                onClick={handleExamplePrevious}
                                                disabled={loading}
                                                aria-label="Previous Example"
                                                color="primary"
                                                size="medium"
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
                                            <Typography variant="body1" color="text.primary" sx={{ minWidth: '60px', textAlign: 'center' }}>
                                                {currentExampleIndex + 1} / {examples.length}
                                            </Typography>
                                            <IconButton
                                                onClick={handleExampleNext}
                                                disabled={loading}
                                                aria-label="Next Example"
                                                color="primary"
                                                size="medium"
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
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No examples found for this key concept.
                                </Alert>
                            )}

                            {concepts.length === 0 && (
                                <Alert severity="info">
                                    No concepts found for {selectedTopic} &gt; {selectedTag}
                                </Alert>
                            )}
                        </>
                    )}

                    {!loading && !error && !selectedTopic && !selectedTag && (
                        <Alert severity="info">
                            Please select a topic and tag from the sidebar to view examples.
                        </Alert>
                    )}

                    {useDemoData && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <strong>Demo Mode:</strong> Showing sample data. Select a topic from the sidebar to fetch from database.
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    )
}

export default ExampleModule

