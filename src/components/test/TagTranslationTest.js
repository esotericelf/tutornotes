import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Chip, TextField, Alert, Autocomplete } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';
import { useMathPaper } from '../../store/hooks';
import { UnifiedTagService } from '../../services/mathpaper';

const TagTranslationTest = () => {
    const { t, isChinese, changeLanguage } = useTranslation();
    const { dispatch } = useMathPaper();

    const [testTags, setTestTags] = useState(['三角形面積公式']);
    const [translationResults, setTranslationResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLanguageChange = async (language) => {
        await changeLanguage(language);
        setTranslationResults(null);
    };

    const testTagTranslation = async () => {
        if (testTags.length === 0) {
            setError('Please enter at least one tag');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const currentLanguage = isChinese() ? 'zh' : 'en';
            const targetLanguage = isChinese() ? 'en' : 'zh';

            console.log('🔍 Testing tag translation:', {
                tags: testTags,
                from: currentLanguage,
                to: targetLanguage
            });

            const result = await UnifiedTagService.translateTags(testTags, currentLanguage, targetLanguage);

            if (result.error) {
                setError(`Tag translation failed: ${result.error.message}`);
                return;
            }

            setTranslationResults({
                originalTags: testTags,
                translatedTags: result.data,
                fromLanguage: currentLanguage,
                toLanguage: targetLanguage
            });

            console.log('✅ Tag translation successful:', result.data);
        } catch (err) {
            console.error('❌ Tag translation test failed:', err);
            setError(`Translation test failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testReduxTranslation = async () => {
        if (testTags.length === 0) {
            setError('Please enter at least one tag');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const currentLanguage = isChinese() ? 'zh' : 'en';
            const targetLanguage = isChinese() ? 'en' : 'zh';

            console.log('🔍 Testing Redux tag translation:', {
                tags: testTags,
                from: currentLanguage,
                to: targetLanguage
            });

            const result = await dispatch({
                type: 'mathPaper/translateTags',
                payload: {
                    tags: testTags,
                    fromLanguage: currentLanguage,
                    toLanguage: targetLanguage
                }
            });

            if (result.error) {
                setError(`Redux translation failed: ${result.error}`);
                return;
            }

            setTranslationResults({
                originalTags: testTags,
                translatedTags: result.payload,
                fromLanguage: currentLanguage,
                toLanguage: targetLanguage,
                method: 'Redux'
            });

            console.log('✅ Redux tag translation successful:', result.payload);
        } catch (err) {
            console.error('❌ Redux translation test failed:', err);
            setError(`Redux translation test failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addTestTag = (tag) => {
        if (tag && !testTags.includes(tag)) {
            setTestTags([...testTags, tag]);
        }
    };

    const removeTestTag = (tagToRemove) => {
        setTestTags(testTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tag Translation Test
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
                    Test Tags
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Test Tags: {testTags.length > 0 ? testTags.join(', ') : 'None'}
                    </Typography>
                    {testTags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {testTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => removeTestTag(tag)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Add Test Tag"
                        placeholder="Enter tag name..."
                        size="small"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                addTestTag(e.target.value);
                                e.target.value = '';
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => {
                            const input = document.querySelector('input[placeholder="Enter tag name..."]');
                            if (input && input.value) {
                                addTestTag(input.value);
                                input.value = '';
                            }
                        }}
                    >
                        Add Tag
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={testTagTranslation}
                        disabled={loading || testTags.length === 0}
                    >
                        {loading ? 'Translating...' : 'Test Direct Translation'}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={testReduxTranslation}
                        disabled={loading || testTags.length === 0}
                    >
                        {loading ? 'Translating...' : 'Test Redux Translation'}
                    </Button>
                </Box>
            </Paper>

            {translationResults && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Translation Results
                    </Typography>

                    <Typography variant="body1" gutterBottom>
                        <strong>From Language:</strong> {translationResults.fromLanguage}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>To Language:</strong> {translationResults.toLanguage}
                    </Typography>
                    {translationResults.method && (
                        <Typography variant="body1" gutterBottom>
                            <strong>Method:</strong> {translationResults.method}
                        </Typography>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Original Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {translationResults.originalTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Translated Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {translationResults.translatedTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    color="secondary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                </Paper>
            )}

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
                    1. <strong>Add Test Tags:</strong> Add some Chinese or English tags to test translation
                </Typography>
                <Typography variant="body1" gutterBottom>
                    2. <strong>Test Direct Translation:</strong> Test the UnifiedTagService.translateTags method
                </Typography>
                <Typography variant="body1" gutterBottom>
                    3. <strong>Test Redux Translation:</strong> Test the Redux thunk for tag translation
                </Typography>
                <Typography variant="body1" gutterBottom>
                    4. <strong>Language Switching:</strong> Switch languages and test translation in both directions
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Expected Behavior:</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                    • Chinese tags (e.g., "三角形面積公式") should translate to English equivalents (e.g., "triangle area formula")
                </Typography>
                <Typography variant="body2" gutterBottom>
                    • English tags should translate to Chinese equivalents
                </Typography>
                <Typography variant="body2" gutterBottom>
                    • If no translation is found, the original tag should be kept
                </Typography>
            </Paper>
        </Box>
    );
};

export default TagTranslationTest;
