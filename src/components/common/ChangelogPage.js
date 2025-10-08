import React from 'react';
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
            version: "v2.2.0",
            date: "December 2024",
            type: "major",
            title: "🌐 Bilingual Tag Translation & Enhanced Search",
            description: "Revolutionary translation system that automatically translates search tags between English and Chinese, plus major improvements to search functionality",
            features: [
                {
                    icon: <NewReleases color="primary" />,
                    title: "Bidirectional Tag Translation",
                    description: "Search tags automatically translate when switching languages - English tags become Chinese and vice versa",
                    type: "feature"
                },
                {
                    icon: <Search color="primary" />,
                    title: "Smart Pagination with Tag Preservation",
                    description: "Fixed pagination to preserve search tags in URLs - no more losing your search when clicking page 2",
                    type: "fix"
                },
                {
                    icon: <Speed color="primary" />,
                    title: "Enhanced Search Field Experience",
                    description: "Eliminated flickering and disappearing text in the tag search field for smooth tag selection",
                    type: "improvement"
                },
                {
                    icon: <MobileFriendly color="primary" />,
                    title: "Improved Tag Selection Display",
                    description: "Selected tags now display properly in the search box with automatic focus management",
                    type: "improvement"
                },
                {
                    icon: <Code color="primary" />,
                    title: "Robust URL Parameter Handling",
                    description: "Enhanced URL parsing to handle both single tags with spaces and comma-separated multiple tags",
                    type: "improvement"
                }
            ]
        },
        {
            version: "v2.1.5",
            date: "January 2025",
            type: "patch",
            title: "Redux Integration & Build Optimization",
            description: "Successfully merged Redux state management and resolved all build issues for smooth deployment",
            features: [
                {
                    icon: <Code color="primary" />,
                    title: "Redux State Management",
                    description: "Integrated Redux Toolkit for centralized state management across the application",
                    type: "feature"
                },
                {
                    icon: <Speed color="primary" />,
                    title: "Build Process Optimization",
                    description: "Fixed all ESLint warnings and build errors to ensure successful Netlify deployment",
                    type: "improvement"
                },
                {
                    icon: <Security color="primary" />,
                    title: "Code Quality Improvements",
                    description: "Cleaned up unused imports and functions for better maintainability and performance",
                    type: "improvement"
                },
                {
                    icon: <MobileFriendly color="primary" />,
                    title: "Deployment Ready",
                    description: "Application now builds successfully without warnings, ready for production deployment",
                    type: "improvement"
                }
            ]
        },
        {
            version: "v2.1.4",
            date: "September 2025",
            type: "patch",
            title: "Robust Back Button for Tag Search Navigation",
            description: "Fixed navigation issue where users couldn't return to tag search results after clicking on specific questions",
            features: [
                {
                    icon: <Navigation color="primary" />,
                    title: "Smart Back Button Detection",
                    description: "Back button now appears when navigating from tag search results to question pages, showing the correct search context",
                    type: "feature"
                },
                {
                    icon: <Search color="primary" />,
                    title: "Triple-Layer Navigation State",
                    description: "Uses URL parameters, sessionStorage, and document referrer for reliable navigation state detection",
                    type: "improvement"
                },
                {
                    icon: <Speed color="primary" />,
                    title: "Enhanced User Experience",
                    description: "Users can now easily return to their original tag search results with a single click",
                    type: "improvement"
                },
                {
                    icon: <Code color="primary" />,
                    title: "Robust State Management",
                    description: "Navigation state is embedded in URLs and automatically cleaned up to prevent conflicts",
                    type: "improvement"
                }
            ]
        },
        {
            version: "v2.1.3",
            date: "September 2025",
            type: "patch",
            title: "Enhanced Question Navigation",
            description: "Improved navigation between DSE Math questions with larger, more intuitive controls and better visual design",
            features: [
                {
                    icon: <Navigation color="primary" />,
                    title: "Sequential Question Navigation",
                    description: "Navigate through questions in logical order: earlier years → later years, Paper I → Paper II, ascending question numbers",
                    type: "feature"
                },
                {
                    icon: <Speed color="primary" />,
                    title: "Smart Question Skipping",
                    description: "Automatically skips missing questions (e.g., if Q6 doesn't exist, goes to Q30) for seamless navigation",
                    type: "improvement"
                },
                {
                    icon: <MobileFriendly color="primary" />,
                    title: "Enhanced Visual Design",
                    description: "Larger navigation arrows with professional styling, smooth hover effects, and better integration with the UI",
                    type: "improvement"
                },
                {
                    icon: <Search color="primary" />,
                    title: "Intelligent Tooltips",
                    description: "Hover over navigation buttons to see exactly which question you'll navigate to next",
                    type: "feature"
                }
            ]
        },
        {
            version: "v2.1.2",
            date: "September 2025",
            type: "patch",
            title: "Smarter Search Experience",
            description: "Made searching for math questions more intuitive and reliable with better navigation and cleaner interface",
            features: [
                {
                    icon: <Navigation color="primary" />,
                    title: "No More Confusing URLs",
                    description: "When you click on topic tags, you'll always land on the right search page instead of getting stuck on weird mixed URLs",
                    type: "fix"
                },
                {
                    icon: <Search color="primary" />,
                    title: "One Search Method at a Time",
                    description: "The system now automatically clears conflicting search options - no more accidentally mixing year filters with topic tags",
                    type: "improvement"
                },
                {
                    icon: <Speed color="primary" />,
                    title: "Faster Page Loading",
                    description: "Improved backend performance means search results load quicker, especially when browsing through multiple pages",
                    type: "improvement"
                },
                {
                    icon: <MobileFriendly color="primary" />,
                    title: "Cleaner Mobile Experience",
                    description: "Search interface is now more streamlined on phones and tablets, making it easier to find questions on the go",
                    type: "improvement"
                }
            ]
        },
        {
            version: "v2.1.1",
            date: "September 2025",
            type: "patch",
            title: "Popular Tags Count Fix",
            description: "Fixed inaccurate tag counts in the popular tags section",
            features: [
                {
                    icon: <BugReport color="primary" />,
                    title: "Accurate Tag Counts",
                    description: "Popular tags now show correct counts from the entire database instead of just the first 100 questions",
                    type: "fix"
                },
                {
                    icon: <Search color="primary" />,
                    title: "Improved Data Accuracy",
                    description: "Tag popularity statistics now reflect the true distribution across all questions",
                    type: "improvement"
                }
            ]
        },
        {
            version: "v2.1.0",
            date: "September 2025",
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
            ]
        },
        {
            version: "v2.0.0",
            date: "September 2025",
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
                        Try out the new bilingual tag translation system and enhanced search functionality
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
