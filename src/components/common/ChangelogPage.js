import React, { useEffect, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    useTheme
} from '@mui/material';
import {
    School,
    CheckCircle,
    BugReport,
    NewReleases,
    Security,
    Speed,
    Link,
    Search,
    Navigation,
    MobileFriendly,
    Code
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import translationService from '../../services/translation/translationService';
import SEOHead from './SEOHead';

const ChangelogPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { t, changeLanguage, getCurrentLanguage, currentLanguage } = useTranslation();

    // Detect language from URL (e.g., /changelog/zh)
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const langFromUrl = pathParts[pathParts.length - 1];

        if (langFromUrl === 'zh' || langFromUrl === 'en') {
            if (getCurrentLanguage() !== langFromUrl) {
                changeLanguage(langFromUrl);
            }
        }
    }, [location.pathname, getCurrentLanguage, changeLanguage]);

    // Helper function to get icon for feature type
    const getFeatureIcon = (index, entryIndex) => {
        const versionEntries = [
            { version: "v2.3.0", icons: [School, NewReleases, MobileFriendly, Speed, Code, Search] },
            { version: "v2.2.0", icons: [NewReleases, Search, Speed, MobileFriendly, Code] },
            { version: "v2.1.5", icons: [Code, Speed, Security, MobileFriendly] },
            { version: "v2.1.4", icons: [Navigation, Search, Speed, Code] },
            { version: "v2.1.3", icons: [Navigation, Speed, MobileFriendly, Search] },
            { version: "v2.1.2", icons: [Navigation, Search, Speed, MobileFriendly] },
            { version: "v2.1.1", icons: [BugReport, Search] },
            { version: "v2.1.0", icons: [Link, Search, Navigation, Speed, MobileFriendly] },
            { version: "v2.0.0", icons: [School, BugReport] }
        ];

        const entry = versionEntries[entryIndex];
        if (entry && entry.icons[index]) {
            const IconComponent = entry.icons[index];
            return <IconComponent color="primary" />;
        }
        return <CheckCircle color="primary" />;
    };

    // Rebuild changelog entries when language changes
    const changelogEntries = useMemo(() => {
        const versions = ["v2.3.0", "v2.2.0", "v2.1.5", "v2.1.4", "v2.1.3", "v2.1.2", "v2.1.1", "v2.1.0", "v2.0.0"];
        const dates = ["January 2025", "December 2024", "December 2024", "November 2024", "October 2024", "September 2024", "August 2024", "July 2024", "June 2024"];
        const types = ["major", "major", "patch", "patch", "patch", "patch", "patch", "major", "major"];
        const featureTypes = [
            ["feature", "feature", "improvement", "feature", "improvement", "improvement"],
            ["feature", "fix", "improvement", "improvement", "improvement"],
            ["feature", "improvement", "improvement", "improvement"],
            ["feature", "improvement", "improvement", "improvement"],
            ["feature", "improvement", "improvement", "feature"],
            ["fix", "improvement", "improvement", "improvement"],
            ["fix", "improvement"],
            ["feature", "feature", "feature", "improvement", "feature"],
            ["improvement", "fix"]
        ];

        return versions.map((version, index) => {
            const entries = translationService.getSection('entries');
            const entryData = entries && entries[version] ? entries[version] : null;

            if (!entryData || typeof entryData !== 'object') {
                return null;
            }

            const featuresList = entryData.features || [];

            return {
                version,
                date: dates[index],
                type: types[index],
                title: entryData.title || version,
                description: entryData.description || "",
                features: featuresList.map((feature, featureIndex) => ({
                    icon: getFeatureIcon(featureIndex, index),
                    title: feature.title || "",
                    description: feature.description || "",
                    type: featureTypes[index]?.[featureIndex] || "improvement"
                }))
            };
        }).filter(entry => entry !== null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLanguage]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'feature': return 'success';
            case 'improvement': return 'info';
            case 'fix': return 'warning';
            case 'security': return 'error';
            default: return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'feature': return <NewReleases />;
            case 'improvement': return <Speed />;
            case 'fix': return <BugReport />;
            case 'security': return <Security />;
            default: return <CheckCircle />;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <SEOHead
                title="Changelog - TutorNote Updates & New Features"
                description="Stay updated with the latest features, improvements, and fixes in TutorNote. See what's new in our DSE Math platform."
                keywords="changelog, updates, new features, DSE math, TutorNote, improvements"
            />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}
                    >
                        What's New
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.25rem' } }}
                    >
                        {t('subtitle', {}, 'Stay updated with the latest features, improvements, and fixes in TutorNote')}
                    </Typography>
                </Box>

                {/* Changelog Entries */}
                {changelogEntries.map((entry, index) => (
                    <Card
                        key={entry.version}
                        elevation={2}
                        sx={{
                            mb: 4,
                            border: `2px solid ${theme.palette.primary.main}`,
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            {/* Version Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                <Chip
                                    label={entry.version}
                                    color="primary"
                                    size="large"
                                    sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                />
                                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                                    {entry.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {entry.date}
                                </Typography>
                            </Box>

                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {entry.description}
                            </Typography>

                            {/* Features List */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                    {t('sections.keyFeatures', {}, 'Key Features & Improvements')}
                                </Typography>
                                <List dense>
                                    {entry.features.map((feature, featureIndex) => (
                                        <ListItem key={featureIndex} sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {feature.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            {feature.title}
                                                        </Typography>
                                                        <Chip
                                                            label={t(`types.${feature.type}`, {}, feature.type)}
                                                            color={getTypeColor(feature.type)}
                                                            size="small"
                                                            icon={getTypeIcon(feature.type)}
                                                        />
                                                    </Box>
                                                }
                                                secondary={feature.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                        </CardContent>
                    </Card>
                ))}

                {/* Call to Action */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {t('cta.title', {}, 'Ready to Explore?')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                        {t('cta.description', {}, 'Try out the new interactive examples module with step-by-step solutions and dynamic diagrams')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/quadratic-equations-in-one-unknown/real-roots')}
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'grey.100' }
                            }}
                        >
                            {t('cta.exploreExamples', {}, 'Explore Interactive Examples')}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/DSE_Math')}
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            {t('cta.browsePapers', {}, 'Browse Math Papers')}
                        </Button>
                    </Box>
                </Paper>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('footer', {}, 'Built with ❤️ for Hong Kong DSE students')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default ChangelogPage;
