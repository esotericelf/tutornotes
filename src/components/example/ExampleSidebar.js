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
import { supabase } from '../../services/supabase'

const ExampleSidebar = ({ open, onClose, onTopicTagSelect, width = 280 }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [topicsData, setTopicsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('topic_tags')
                    .select('topic, tag')
                    .eq('is_active', true)
                    .eq('content_type', 'master_tag')
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

    const handleTagClick = (topic, tag) => {
        onTopicTagSelect(topic, tag)
        onClose()
    }

    const shouldExpandAccordion = (topic, tags) => {
        if (searchTerm === '') return false
        return tags.some(tag =>
            topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
                        defaultExpanded={shouldExpandAccordion(topic, tags)}
                        disabled={searchTerm !== ''}
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

