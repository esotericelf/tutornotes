import React from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';

const TranslationTest = () => {
    const { t, changeLanguage, getCurrentLanguage, isChinese, isEnglish, getAvailableLanguages } = useTranslation();

    const handleLanguageChange = async (language) => {
        await changeLanguage(language);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Translation Test Component
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Current Language: {getCurrentLanguage()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Is Chinese: {isChinese() ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Is English: {isEnglish() ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Available Languages: {getAvailableLanguages().join(', ')}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Language Toggle
                </Typography>
                <Grid container spacing={2}>
                    {getAvailableLanguages().map((language) => (
                        <Grid item key={language}>
                            <Button
                                variant={getCurrentLanguage() === language ? 'contained' : 'outlined'}
                                onClick={() => handleLanguageChange(language)}
                            >
                                {language === 'en' ? 'English' : language === 'zh' ? '中文' : language}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Translation Examples
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Page Title: {t('pageTitle.main')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Page Description: {t('pageTitle.description')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Filter Title: {t('filters.title')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Year Label: {t('filters.year.label')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Paper Label: {t('filters.paper.label')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Search Button: {t('filters.buttons.search')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Clear Button: {t('filters.buttons.clear')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Popular Tags: {t('popularTags.title')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Results: {t('results.title')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    View Button: {t('results.view')}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    String Interpolation Test
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Page Info: {t('results.pageInfo', { currentPage: 1, totalPages: 5 })}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Question Title: {t('seo.questionPage.title', { year: 2023, paper: 'I', questionNo: 5 })}
                </Typography>
            </Paper>
        </Box>
    );
};

export default TranslationTest;
