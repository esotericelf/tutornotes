import React, { useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Chip } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';
import { useMathPaper } from '../../store/hooks';
import { loadPopularTagsChinese as loadPopularTagsChineseThunk } from '../../store/slices/mathPaperSlice';

const ChinesePopularTagsTest = () => {
    const { t, isChinese, changeLanguage } = useTranslation();
    const { popularTagsChinese, dispatch } = useMathPaper();

    const handleLanguageChange = async (language) => {
        await changeLanguage(language);
    };

    const handleLoadChineseTags = () => {
        dispatch(loadPopularTagsChineseThunk(10));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Chinese Popular Tags Test
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
                <Button
                    variant="contained"
                    onClick={handleLoadChineseTags}
                    sx={{ mb: 2 }}
                >
                    Load Chinese Popular Tags
                </Button>

                <Typography variant="body1" gutterBottom>
                    Chinese Popular Tags Count: {popularTagsChinese.length}
                </Typography>

                {popularTagsChinese.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Popular Chinese Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {popularTagsChinese.map((tagData, index) => (
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

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Translation Test
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Popular Tags Title: {t('popularTags.title')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Popular Tags Description: {t('popularTags.description')}
                </Typography>
            </Paper>
        </Box>
    );
};

export default ChinesePopularTagsTest;
