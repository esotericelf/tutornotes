import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Chip, TextField, Alert } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';
import { UnifiedTagService } from '../../services/mathpaper';

const ChineseTagSearchTest = () => {
    const { t, isChinese, changeLanguage } = useTranslation();
    const [searchTags, setSearchTags] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLanguageChange = async (language) => {
        await changeLanguage(language);
    };

    const handleTagSearch = async () => {
        if (searchTags.length === 0) {
            setError('Please enter at least one tag');
            return;
        }

        setLoading(true);
        setError(null);
        setSearchResults(null);

        try {
            console.log('🔍 Testing Chinese tag search with tags:', searchTags);

            if (isChinese()) {
                // Test Chinese tag search
                const result = await UnifiedTagService.searchByChineseTagsPaginated(searchTags, 1, 10);

                if (result.error) {
                    setError(`Chinese tag search failed: ${result.error.message}`);
                    return;
                }

                setSearchResults(result.data);
                console.log('✅ Chinese tag search successful:', result.data);
            } else {
                // Test English tag search for comparison
                const result = await UnifiedTagService.searchByChineseTagsPaginated(searchTags, 1, 10);

                if (result.error) {
                    setError(`Tag search failed: ${result.error.message}`);
                    return;
                }

                setSearchResults(result.data);
                console.log('✅ Tag search successful:', result.data);
            }
        } catch (err) {
            console.error('❌ Tag search test failed:', err);
            setError(`Search failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        if (searchInput.trim() && !searchTags.includes(searchInput.trim())) {
            setSearchTags([...searchTags, searchInput.trim()]);
            setSearchInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Chinese Tag Search Test
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
                    Tag Search Test
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Search Tags: {searchTags.length > 0 ? searchTags.join(', ') : 'None'}
                    </Typography>
                    {searchTags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {searchTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Add Tag"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter tag name..."
                        size="small"
                    />
                    <Button
                        variant="outlined"
                        onClick={handleAddTag}
                        disabled={!searchInput.trim()}
                    >
                        Add Tag
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    onClick={handleTagSearch}
                    disabled={loading || searchTags.length === 0}
                    sx={{ mb: 2 }}
                >
                    {loading ? 'Searching...' : 'Search Tags'}
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {searchResults && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Search Results
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Total Questions: {searchResults.total_count || 0}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Current Page: {searchResults.current_page || 1}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Total Pages: {searchResults.total_pages || 0}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Has Next: {searchResults.has_next ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Has Previous: {searchResults.has_prev ? 'Yes' : 'No'}
                        </Typography>

                        {searchResults.questions && searchResults.questions.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Questions ({searchResults.questions.length}):
                                </Typography>
                                {searchResults.questions.slice(0, 3).map((question, index) => (
                                    <Paper key={index} sx={{ p: 2, mb: 1 }}>
                                        <Typography variant="body2">
                                            ID: {question.id}, Year: {question.year}, Paper: {question.paper}, Question: {question.question_no}
                                        </Typography>
                                        {question.tags_ch && question.tags_ch.length > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                                Chinese Tags: {question.tags_ch.join(', ')}
                                            </Typography>
                                        )}
                                    </Paper>
                                ))}
                                {searchResults.questions.length > 3 && (
                                    <Typography variant="body2" color="text.secondary">
                                        ... and {searchResults.questions.length - 3} more questions
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Test Instructions
                </Typography>
                <Typography variant="body1" gutterBottom>
                    1. Switch to Chinese language using the language toggle
                </Typography>
                <Typography variant="body1" gutterBottom>
                    2. Add some Chinese tags (e.g., "代數", "幾何", "三角函數")
                </Typography>
                <Typography variant="body1" gutterBottom>
                    3. Click "Search Tags" to test the Chinese tag search functionality
                </Typography>
                <Typography variant="body1" gutterBottom>
                    4. The search should use the `search_math_papers_by_tags_paginated_zh` Supabase function
                </Typography>
                <Typography variant="body1" gutterBottom>
                    5. Results should show questions that have matching Chinese tags in the `tags_ch` column
                </Typography>
            </Paper>
        </Box>
    );
};

export default ChineseTagSearchTest;
