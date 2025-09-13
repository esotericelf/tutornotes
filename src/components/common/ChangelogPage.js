import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Card,
    CardContent,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    useTheme
} from '@mui/material';
import {
    ArrowBack,
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
import { useNavigate } from 'react-router-dom';
import SEOHead from './SEOHead';

const ChangelogPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const changelogEntries = [
        {
            version: "v2.1.0",
            date: "December 2024",
            type: "major",
            title: "Direct Question URL System",
            description: "Revolutionary URL system for direct question access and seamless navigation",
            features: [
                {
                    icon: <Link color="primary" />,
                    title: "Direct Question URLs",
                    description: "Access any question directly via URLs like /DSE_Math/2023/I/15",
                    type: "feature"
                },
                {
                    icon: <Search color="primary" />,
                    title: "Smart Search Integration",
                    description: "Search functionality works perfectly from any direct question URL",
                    type: "feature"
                },
                {
                    icon: <Navigation color="primary" />,
                    title: "Intelligent Navigation",
                    description: "Seamless navigation between questions with proper URL updates",
                    type: "feature"
                },
                {
                    icon: <Speed color="primary" />,
                    title: "Performance Optimized",
                    description: "Fixed infinite loop issues and optimized rendering performance",
                    type: "improvement"
                },
                {
                    icon: <MobileFriendly color="primary" />,
                    title: "Mobile Responsive",
                    description: "Fully responsive design that works perfectly on all devices",
                    type: "feature"
                }
            ],
            technical: [
                "Added QuestionURLService for URL generation and parsing",
                "Implemented QuestionLoaderService for database interactions",
                "Enhanced MathPaperPage with direct URL parameter handling",
                "Fixed React Router integration for seamless navigation",
                "Optimized useCallback dependencies to prevent re-renders"
            ]
        },
        {
            version: "v2.0.0",
            date: "November 2024",
            type: "major",
            title: "Enhanced User Experience",
            description: "Major improvements to user interface and functionality",
            features: [
                {
                    icon: <School color="primary" />,
                    title: "Improved Question Display",
                    description: "Better formatting and readability for math questions",
                    type: "improvement"
                },
                {
                    icon: <BugReport color="primary" />,
                    title: "Bug Fixes",
                    description: "Resolved various UI and functionality issues",
                    type: "fix"
                }
            ],
            technical: [
                "Updated Material-UI components",
                "Improved error handling",
                "Enhanced loading states"
            ]
        }
    ];

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

            {/* Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <School sx={{ mr: 2 }} />
                    <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                        Changelog
                    </Typography>
                </Toolbar>
            </AppBar>

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
                        Stay updated with the latest features, improvements, and fixes in TutorNote
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
                                    Key Features & Improvements
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
                                                            label={feature.type}
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

                            <Divider sx={{ my: 2 }} />

                            {/* Technical Details */}
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Technical Improvements
                                </Typography>
                                <List dense>
                                    {entry.technical.map((tech, techIndex) => (
                                        <ListItem key={techIndex} sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Code color="action" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={tech}
                                                primaryTypographyProps={{ variant: 'body2' }}
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
                        Ready to Explore?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                        Try out the new direct question URL system and enhanced search functionality
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/DSE_Math')}
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'grey.100' }
                            }}
                        >
                            Explore Math Papers
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/DSE_Math/2023/I/15')}
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Try Direct URL
                        </Button>
                    </Box>
                </Paper>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Built with ❤️ for Hong Kong DSE students
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default ChangelogPage;
