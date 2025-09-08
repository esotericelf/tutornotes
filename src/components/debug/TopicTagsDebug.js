import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../../services/supabase';

/**
 * TopicTagsDebug - Debug component to check topic_tags data
 */
const TopicTagsDebug = () => {
    const [loading, setLoading] = useState(false);
    const [topics, setTopics] = useState([]);
    const [allTopicTags, setAllTopicTags] = useState([]);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get all topic_tags data
            const { data, error } = await supabase
                .from('topic_tags')
                .select('*')
                .eq('content_type', 'master_tag')
                .eq('is_active', true)
                .order('topic', { ascending: true });

            if (error) throw error;

            setAllTopicTags(data || []);

            // Group by topic
            const topicsMap = {};
            data.forEach(item => {
                if (!topicsMap[item.topic]) {
                    topicsMap[item.topic] = [];
                }
                topicsMap[item.topic].push(item.tag);
            });

            const topicsData = Object.keys(topicsMap).map(topic => ({
                topic,
                tags: [...new Set(topicsMap[topic])].sort()
            }));

            setTopics(topicsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Topic Tags Debug
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Topic Tags Data
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={loadData}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={20} /> : 'Reload Data'}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error: {error}
                        </Alert>
                    )}

                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading topic tags...</Typography>
                        </Box>
                    )}

                    {!loading && topics.length === 0 && !error && (
                        <Alert severity="info">
                            No topic tags found in the database.
                        </Alert>
                    )}

                    {!loading && topics.length > 0 && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Found {topics.length} topics with tags:
                            </Typography>

                            {topics.map((topicData, index) => (
                                <Accordion key={index} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Typography variant="subtitle1">
                                                {topicData.topic}
                                            </Typography>
                                            <Chip
                                                label={`${topicData.tags.length} tags`}
                                                size="small"
                                                color="primary"
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {topicData.tags.map((tag, tagIndex) => (
                                                <Chip
                                                    key={tagIndex}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Raw Database Data
                    </Typography>
                    {allTopicTags.length > 0 && (
                        <Box component="pre" sx={{
                            bgcolor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                            maxHeight: '400px'
                        }}>
                            {JSON.stringify(allTopicTags, null, 2)}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default TopicTagsDebug;
