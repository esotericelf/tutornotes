/**
 * Practice Quiz Block Component
 * A dashboard component for creating and taking practice quizzes
 */

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Quiz,
    PlayArrow,
    Refresh,
    School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../contexts/AuthContext';
import practiceQuizService from '../services/practiceQuizService';

const PracticeQuizBlock = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // State management
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableQuestions, setAvailableQuestions] = useState(0);

    // Load topics on component mount
    useEffect(() => {
        loadTopics();
    }, []);

    // Load tags when topic changes
    useEffect(() => {
        if (selectedTopic) {
            loadTagsForTopic(selectedTopic);
            setSelectedTag(''); // Reset tag selection
        } else {
            setTags([]);
            setSelectedTag('');
        }
    }, [selectedTopic]);

    const checkAvailableQuestions = useCallback(async () => {
        try {
            const questionIds = await practiceQuizService.getQuestionsByTopicAndTag(
                selectedTopic,
                selectedTag || null,
                100
            );
            setAvailableQuestions(questionIds.length);
        } catch (err) {
            console.error('Error checking available questions:', err);
            setAvailableQuestions(0);
        }
    }, [selectedTopic, selectedTag]);

    // Check available questions when topic/tag changes
    useEffect(() => {
        if (selectedTopic) {
            checkAvailableQuestions();
        } else {
            setAvailableQuestions(0);
        }
    }, [selectedTopic, selectedTag, checkAvailableQuestions]);

    const loadTopics = async () => {
        try {
            setLoading(true);
            const topicsData = await practiceQuizService.getDistinctTopics();
            console.log('Loaded topics:', topicsData); // Debug log
            setTopics(topicsData);
        } catch (err) {
            setError('Failed to load topics');
            console.error('Error loading topics:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadTagsForTopic = async (topic) => {
        try {
            const tagsData = await practiceQuizService.getTagsForTopic(topic);
            console.log('Loaded tags for topic', topic, ':', tagsData); // Debug log
            setTags(tagsData);
        } catch (err) {
            console.error('Error loading tags:', err);
        }
    };

    const handleStartQuiz = async () => {
        if (!selectedTopic) {
            setError('Please select a topic');
            return;
        }

        if (availableQuestions === 0) {
            setError(`No questions available for topic: ${selectedTopic}${selectedTag ? ` and tag: ${selectedTag}` : ''}`);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Generate practice quiz
            const test = await practiceQuizService.generatePracticeQuiz(
                selectedTopic,
                selectedTag || null,
                user?.id
            );

            // Save test to database and get the saved test with ID
            let savedTest = test;
            if (user) {
                savedTest = await practiceQuizService.savePracticeTest(test, user.id);
            }

            // Navigate to quiz taking page
            navigate('/quiz/take', {
                state: {
                    test: savedTest,
                    isPractice: true
                }
            });

        } catch (err) {
            setError(err.message || 'Failed to start quiz');
            console.error('Error starting quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadTopics();
    };


    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Quiz sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                    <Box>
                        <Typography variant="h6" component="h3" fontWeight="600">
                            Practice Quiz
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Test your knowledge with randomized questions
                        </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <Tooltip title="Refresh">
                            <IconButton onClick={handleRefresh} size="small">
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Error Display */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Topic Selection */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Topic</InputLabel>
                    <Select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        label="Select Topic"
                        disabled={loading}
                    >
                        {topics.map((topic) => (
                            <MenuItem key={topic} value={topic}>
                                {topic}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Tag Selection */}
                {selectedTopic && tags.length > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Tag (Optional)</InputLabel>
                        <Select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            label="Select Tag (Optional)"
                            disabled={loading}
                        >
                            <MenuItem value="">
                                <em>All tags</em>
                            </MenuItem>
                            {tags.map((tag) => (
                                <MenuItem key={tag} value={tag}>
                                    {tag}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Available Questions Info */}
                {selectedTopic && (
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            icon={<School />}
                            label={`${availableQuestions} questions available`}
                            color={availableQuestions > 0 ? 'success' : 'error'}
                            variant="outlined"
                        />
                        {availableQuestions > 0 && availableQuestions < 10 && (
                            <Typography variant="caption" color="info.main" sx={{ ml: 1 }}>
                                Quiz will include all {availableQuestions} available questions
                            </Typography>
                        )}
                        {availableQuestions === 0 && (
                            <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                                No questions available for this topic
                            </Typography>
                        )}
                    </Box>
                )}

            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                    onClick={handleStartQuiz}
                    disabled={!selectedTopic || availableQuestions === 0 || loading}
                    sx={{ borderRadius: 2 }}
                >
                    {loading ? 'Generating Quiz...' : `Start Practice Quiz (${availableQuestions} questions)`}
                </Button>
            </CardActions>
        </Card>
    );
};

export default PracticeQuizBlock;
