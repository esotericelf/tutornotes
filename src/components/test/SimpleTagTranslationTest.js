import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, Alert } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';
import { UnifiedTagService } from '../../services/mathpaper';

const SimpleTagTranslationTest = () => {
    const { isChinese, changeLanguage } = useTranslation();
    const [testTag, setTestTag] = useState('三角形面積公式');
    const [translationResult, setTranslationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testTranslation = async () => {
        if (!testTag.trim()) {
            setError('Please enter a tag to translate');
            return;
        }

        setLoading(true);
        setError(null);
        setTranslationResult(null);

        try {
            const currentLanguage = isChinese() ? 'zh' : 'en';
            const targetLanguage = isChinese() ? 'en' : 'zh';

            console.log('🔍 Testing translation:', {
                tag: testTag,
                from: currentLanguage,
                to: targetLanguage
            });

            const result = await UnifiedTagService.translateTags([testTag], currentLanguage, targetLanguage);

            if (result.error) {
                setError(`Translation failed: ${result.error.message}`);
                return;
            }

            setTranslationResult({
                original: testTag,
                translated: result.data[0],
                fromLanguage: currentLanguage,
                toLanguage: targetLanguage
            });

            console.log('✅ Translation successful:', result.data);
        } catch (err) {
            console.error('❌ Translation test failed:', err);
            setError(`Translation failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageToggle = async () => {
        const newLanguage = isChinese() ? 'en' : 'zh';
        await changeLanguage(newLanguage);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Simple Tag Translation Test
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Current Language: {isChinese() ? 'Chinese (中文)' : 'English'}
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleLanguageToggle}
                    sx={{ mb: 2 }}
                >
                    Toggle Language
                </Button>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Test Tag Translation
                </Typography>

                <TextField
                    label="Test Tag"
                    value={testTag}
                    onChange={(e) => setTestTag(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="Enter a tag to translate (e.g., 三角形面積公式)"
                />

                <Button
                    variant="contained"
                    onClick={testTranslation}
                    disabled={loading || !testTag.trim()}
                >
                    {loading ? 'Translating...' : 'Test Translation'}
                </Button>
            </Paper>

            {translationResult && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Translation Result
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Original ({translationResult.fromLanguage}):</strong> {translationResult.original}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Translated ({translationResult.toLanguage}):</strong> {translationResult.translated}
                    </Typography>
                </Paper>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Instructions
                </Typography>
                <Typography variant="body1" gutterBottom>
                    1. Enter a Chinese tag (e.g., "三角形面積公式") or English tag (e.g., "triangle area formula")
                </Typography>
                <Typography variant="body1" gutterBottom>
                    2. Click "Test Translation" to see if it translates correctly
                </Typography>
                <Typography variant="body1" gutterBottom>
                    3. Toggle language and test again
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Expected:</strong> Chinese tags should translate to English equivalents and vice versa
                </Typography>
            </Paper>
        </Box>
    );
};

export default SimpleTagTranslationTest;
