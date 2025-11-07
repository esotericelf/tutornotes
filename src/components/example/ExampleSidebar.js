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
import { useTranslation } from '../../hooks/useTranslation'

const ExampleSidebar = ({ open, onClose, onTopicTagSelect, width = 280 }) => {
    const navigate = useNavigate()
    const { t, isChinese, currentLanguage } = useTranslation()
    const [searchTerm, setSearchTerm] = useState('')
    const [topicsData, setTopicsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedTopics, setExpandedTopics] = useState(new Set())

    // Debug: Log language changes
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('ExampleSidebar - Language changed:', currentLanguage, 'isChinese:', isChinese())
        }
    }, [currentLanguage, isChinese])

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('topic_tags')
                    .select('topic, tag, topic_ch, tag_ch, content_type')
                    .eq('is_active', true)
                    .order('topic')
                    .order('tag')

                if (error) {
                    console.error('Supabase query error:', error)
                    throw error
                }

                // Debug: Check if we're getting Chinese translations
                if (process.env.NODE_ENV === 'development' && data && data.length > 0) {
                    const sample = data.slice(0, 3)
                    console.log('Sample raw data from Supabase:', sample)
                    const hasChinese = sample.some(item => item.topic_ch || item.tag_ch)
                    console.log('Has Chinese translations:', hasChinese)
                }

                // Group by topic
                const grouped = {}
                data.forEach(({ topic, tag, topic_ch, tag_ch }) => {
                    if (!grouped[topic]) {
                        grouped[topic] = {
                            topic,
                            topic_ch: (topic_ch && topic_ch.trim()) || topic,
                            tags: []
                        }
                    }
                    // Avoid duplicates
                    const tagEntry = {
                        tag,
                        tag_ch: (tag_ch && tag_ch.trim()) || tag
                    }
                    const exists = grouped[topic].tags.some(t => t.tag === tag)
                    if (!exists) {
                        grouped[topic].tags.push(tagEntry)
                    }
                })

                // Debug: Log first few entries to check translations
                if (process.env.NODE_ENV === 'development') {
                    const sample = Object.values(grouped).slice(0, 2)
                    console.log('Sample topic data:', sample)
                    console.log('Current language:', currentLanguage)
                    console.log('Is Chinese:', isChinese())
                }

                const topicsList = Object.values(grouped).map(({ topic, topic_ch, tags }) => ({
                    topic,
                    topic_ch: (topic_ch && topic_ch.trim()) || topic,
                    tags: tags.sort((a, b) => a.tag.localeCompare(b.tag))
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
    }, [currentLanguage, isChinese])

    const filteredTopics = topicsData.map(({ topic, topic_ch, tags }) => {
        const displayTopic = isChinese() ? topic_ch : topic
        const filteredTags = tags.filter(({ tag, tag_ch }) => {
            const displayTag = isChinese() ? tag_ch : tag
            const searchLower = searchTerm.toLowerCase()
            return (
                displayTopic.toLowerCase().includes(searchLower) ||
                displayTag.toLowerCase().includes(searchLower) ||
                topic.toLowerCase().includes(searchLower) ||
                tag.toLowerCase().includes(searchLower) ||
                (topic_ch && topic_ch.toLowerCase().includes(searchLower)) ||
                (tag_ch && tag_ch.toLowerCase().includes(searchLower))
            )
        })
        return { topic, topic_ch, tags: filteredTags }
    }).filter(({ tags }) => tags.length > 0 || searchTerm === '')

    // Auto-expand matching topics when searching
    useEffect(() => {
        if (searchTerm) {
            const matchingTopics = new Set()
            const searchLower = searchTerm.toLowerCase()
            topicsData.forEach(({ topic, topic_ch, tags }) => {
                const displayTopic = isChinese() ? topic_ch : topic
                const topicMatch =
                    displayTopic.toLowerCase().includes(searchLower) ||
                    topic.toLowerCase().includes(searchLower) ||
                    (topic_ch && topic_ch.toLowerCase().includes(searchLower))
                const tagMatch = tags.some(({ tag, tag_ch }) => {
                    const displayTag = isChinese() ? tag_ch : tag
                    return (
                        displayTag.toLowerCase().includes(searchLower) ||
                        tag.toLowerCase().includes(searchLower) ||
                        (tag_ch && tag_ch.toLowerCase().includes(searchLower))
                    )
                })
                if (topicMatch || tagMatch) {
                    matchingTopics.add(topic)
                }
            })
            setExpandedTopics(matchingTopics)
        } else {
            // Clear all expansions when search is cleared
            setExpandedTopics(new Set())
        }
    }, [searchTerm, topicsData, currentLanguage, isChinese])

    const handleTagClick = async (topic, tag) => {
        // Get Chinese translations for this topic/tag
        const topicData = topicsData.find(t => t.topic === topic)
        const tagData = topicData?.tags.find(t => t.tag === tag)
        const topicCh = topicData?.topic_ch && topicData.topic_ch !== topic ? topicData.topic_ch : null
        const tagCh = tagData?.tag_ch && tagData.tag_ch !== tag ? tagData.tag_ch : null

        // Create URL with Chinese translations if language is Chinese
        const url = createTopicTagUrl(topic, tag, topicCh, tagCh, currentLanguage)
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
                    placeholder={t('sidebar.searchPlaceholder', {}, 'Search topics and tags...')}
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
                        {t('sidebar.loading', {}, 'Loading...')}
                    </Typography>
                )}

                {error && (
                    <Typography variant="body2" color="error">
                        {t('sidebar.error', { error }, 'Error: {error}')}
                    </Typography>
                )}

                {!loading && !error && filteredTopics.map(({ topic, topic_ch, tags }) => {
                    // Use Chinese translation if available and language is Chinese
                    const displayTopic = (isChinese() && topic_ch && topic_ch !== topic) ? topic_ch : topic
                    return (
                        <Accordion
                            key={topic}
                            expanded={expandedTopics.has(topic)}
                            onChange={handleAccordionChange(topic)}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    {displayTopic}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    {tags.map(({ tag, tag_ch }) => {
                                        // Use Chinese translation if available and language is Chinese
                                        const displayTag = (isChinese() && tag_ch && tag_ch !== tag) ? tag_ch : tag
                                        return (
                                            <ListItem key={tag} disablePadding>
                                                <ListItemButton onClick={() => handleTagClick(topic, tag)}>
                                                    <ListItemText primary={displayTag} />
                                                </ListItemButton>
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
            </Box>
        </Drawer>
    )
}

export default ExampleSidebar

