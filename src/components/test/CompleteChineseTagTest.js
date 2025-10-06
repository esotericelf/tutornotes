import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Chip, TextField, Alert, Autocomplete } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';
import { useMathPaper } from '../../store/hooks';
import { UnifiedTagService } from '../../services/mathpaper';

const CompleteChineseTagTest = () => {
    const { t, isChinese, changeLanguage } = useTranslation();
    const {
        popularTagsChinese,
        availableTags,
        dispatch
    } = useMathPaper();

    const [searchInput, setSearchInput] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState([]);
    const [testResults, setTestResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLanguageChange = async (language) => {
        await changeLanguage(language);
        setTestResults(null);
        setAutocompleteResults([]);
    };

    const testChineseAutocomplete = async () => {
        if (!searchInput.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Testing Chinese autocomplete with:', searchInput);

            const result = await UnifiedTagService.searchChineseTagsAutocomplete(searchInput, 10);

            if (result.error) {
                setError(`Chinese autocomplete failed: ${result.error.message}`);
                return;
            }

            setAutocompleteResults(result.data || []);
            console.log('✅ Chinese autocomplete successful:', result.data);
        } catch (err) {
            console.error('❌ Chinese autocomplete test failed:', err);
            setError(`Autocomplete test failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testQuestionTagsDisplay = () => {
        // Simulate a question with both English and Chinese tags
        const mockQuestion = {
            id: 1,
            year: 2024,
            paper: 'I',
            question_no: 8,
            tags: ['angle properties', 'triangle area formula', 'area calculation', 'sine cosine tangent', 'nth root concept'],
            tags_ch: ['角度性質', '三角形面積公式', '面積計算', '正弦餘弦正切', 'n次方根概念']
        };

        setTestResults({
            question: mockQuestion,
            currentLanguage: isChinese() ? 'Chinese' : 'English',
            expectedTags: isChinese() ? mockQuestion.tags_ch : mockQuestion.tags,
            actualTags: isChinese() ? mockQuestion.tags_ch : mockQuestion.tags
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Complete Chinese Tag Functionality Test
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Language Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Current Language: {isChinese() ? 'Chinese (中文)' : 'English'}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item>
                        <Button
                            variant={!isChinese() ? 'contained' : 'outlined'}
                            onClick={() => handleLanguageChange('en')}
                        >
                            English
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant={isChinese() ? 'contained' : 'outlined'}
                            onClick={() => handleLanguageChange('zh')}
                        >
                            中文
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Chinese Popular Tags Test
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Chinese Popular Tags Count: {popularTagsChinese.length}
                </Typography>

                {popularTagsChinese.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Popular Chinese Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {popularTagsChinese.slice(0, 10).map((tagData, index) => (
                                <Chip
                                    key={index}
                                    label={`${tagData.tag} (${tagData.count})`}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Chinese Autocomplete Test
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Search Chinese Tags"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Enter Chinese tag search term..."
                        size="small"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={testChineseAutocomplete}
                        disabled={loading || !searchInput.trim()}
                    >
                        {loading ? 'Searching...' : 'Test Autocomplete'}
                    </Button>
                </Box>

                {autocompleteResults.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Autocomplete Results ({autocompleteResults.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {autocompleteResults.map((tagData, index) => (
                                <Chip
                                    key={index}
                                    label={`${tagData.tag} (${tagData.count})`}
                                    color="secondary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Question Tags Display Test
                </Typography>
                <Button
                    variant="contained"
                    onClick={testQuestionTagsDisplay}
                    sx={{ mb: 2 }}
                >
                    Test Question Tags Display
                </Button>

                {testResults && (
                    <Box>
                        <Typography variant="body1" gutterBottom>
                            <strong>Current Language:</strong> {testResults.currentLanguage}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Expected Tags:</strong> {testResults.expectedTags.join(', ')}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Actual Tags:</strong> {testResults.actualTags.join(', ')}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Question Tags Display:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {testResults.actualTags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Available Tags Test
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Available Tags Count: {availableTags.length}
                </Typography>

                {availableTags.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Available Tags (first 10):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {availableTags.slice(0, 10).map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    color="default"
                                    variant="outlined"
                                    size="small"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Test Instructions
                </Typography>
                <Typography variant="body1" gutterBottom>
                    1. <strong>Language Test:</strong> Switch between English and Chinese to see language changes
                </Typography>
                <Typography variant="body1" gutterBottom>
                    2. <strong>Popular Tags Test:</strong> Verify Chinese popular tags are loaded when in Chinese mode
                </Typography>
                <Typography variant="body1" gutterBottom>
                    3. <strong>Autocomplete Test:</strong> Enter a Chinese search term and test autocomplete functionality
                </Typography>
                <Typography variant="body1" gutterBottom>
                    4. <strong>Question Tags Test:</strong> Test how question tags are displayed based on language
                </Typography>
                <Typography variant="body1" gutterBottom>
                    5. <strong>Available Tags Test:</strong> Check if available tags change based on language
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Expected Behavior:</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                    • Chinese mode: Shows Chinese tags (tags_ch), Chinese popular tags, Chinese autocomplete
                </Typography>
                <Typography variant="body2" gutterBottom>
                    • English mode: Shows English tags (tags), English popular tags, English autocomplete
                </Typography>
            </Paper>
        </Box>
    );
};

export default CompleteChineseTagTest;
