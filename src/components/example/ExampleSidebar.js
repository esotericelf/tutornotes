import React, { useState, useEffect } from 'react'
import {
    Drawer,
    Box,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    InputAdornment
} from '@mui/material'
import {
    ExpandMore,
    Search
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { createTopicTagUrl } from '../../utils/urlHelpers'

const ExampleSidebar = ({ open, onClose, onTopicTagSelect, width = 280 }) => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [topicsData, setTopicsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedTopics, setExpandedTopics] = useState(new Set())

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('topic_tags')
                    .select('topic, tag')
                    .eq('is_active', true)
                    .order('topic')
                    .order('tag')

                if (error) throw error

                // Group by topic
                const grouped = {}
                data.forEach(({ topic, tag }) => {
                    if (!grouped[topic]) {
                        grouped[topic] = []
                    }
                    if (!grouped[topic].includes(tag)) {
                        grouped[topic].push(tag)
                    }
                })

                const topicsList = Object.keys(grouped).map(topic => ({
                    topic,
                    tags: grouped[topic].sort()
                }))

                setTopicsData(topicsList)
            } catch (err) {
                console.error('Error fetching topics:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchTopics()
    }, [])

    const filteredTopics = topicsData.map(({ topic, tags }) => {
        const filteredTags = tags.filter(tag =>
            topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return { topic, tags: filteredTags }
    }).filter(({ tags }) => tags.length > 0 || searchTerm === '')

    // Auto-expand matching topics when searching
    useEffect(() => {
        if (searchTerm) {
            const matchingTopics = new Set()
            topicsData.forEach(({ topic, tags }) => {
                const topicMatch = topic.toLowerCase().includes(searchTerm.toLowerCase())
                const tagMatch = tags.some(tag =>
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                )
                if (topicMatch || tagMatch) {
                    matchingTopics.add(topic)
                }
            })
            setExpandedTopics(matchingTopics)
        } else {
            // Clear all expansions when search is cleared
            setExpandedTopics(new Set())
        }
    }, [searchTerm, topicsData])

    const handleTagClick = (topic, tag) => {
        // Navigate directly to topic/tag URL
        const url = createTopicTagUrl(topic, tag)
        navigate(url)
        onTopicTagSelect(topic, tag)
        onClose()
    }

    const handleAccordionChange = (topic) => (event, isExpanded) => {
        const newExpanded = new Set(expandedTopics)
        if (isExpanded) {
            newExpanded.add(topic)
        } else {
            newExpanded.delete(topic)
        }
        setExpandedTopics(newExpanded)
    }

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            sx={{
                width: width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: width,
                    boxSizing: 'border-box',
                    mt: 8,
                    height: 'calc(100vh - 64px)'
                }
            }}
        >
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search topics and tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        )
                    }}
                    sx={{ mb: 2 }}
                />

                {loading && (
                    <Typography variant="body2" color="text.secondary">
                        Loading...
                    </Typography>
                )}

                {error && (
                    <Typography variant="body2" color="error">
                        Error: {error}
                    </Typography>
                )}

                {!loading && !error && filteredTopics.map(({ topic, tags }) => (
                    <Accordion
                        key={topic}
                        expanded={expandedTopics.has(topic)}
                        onChange={handleAccordionChange(topic)}
                    >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1" fontWeight="medium">
                                {topic}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List dense>
                                {tags.map((tag) => (
                                    <ListItem key={tag} disablePadding>
                                        <ListItemButton onClick={() => handleTagClick(topic, tag)}>
                                            <ListItemText primary={tag} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Drawer>
    )
}

export default ExampleSidebar

