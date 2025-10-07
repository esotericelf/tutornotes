import React from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions
} from '@mui/material'
import {
    School,
    Book,
    Forum,
    Favorite,
    ArrowForward,
    People,
    PlayCircleOutline
} from '@mui/icons-material'
import { useAuth } from '../../store/hooks'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../common/SEOHead'
import { createWebsiteStructuredData, createOrganizationStructuredData } from '../../utils/structuredData'
import { useTranslation } from '../../hooks/useTranslation'

const HomePage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()

    // const handleLogout = async () => {
    //     // Function removed to fix build errors
    // }

    const features = [
        {
            icon: <PlayCircleOutline sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: t('features.practiceQuizzes.title'),
            description: t('features.practiceQuizzes.description'),
            color: '#e3f2fd'
        },
        {
            icon: <Forum sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: t('features.discussions.title'),
            description: t('features.discussions.description'),
            color: '#e8f5e8'
        },
        {
            icon: <Favorite sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: t('features.favorites.title'),
            description: t('features.favorites.description'),
            color: '#fff3e0'
        }
    ]

    const stats = [
        { number: '150+', label: t('stats.pastPapers'), icon: <Book /> },
        { number: '30+', label: t('stats.practiceQuizzes'), icon: <PlayCircleOutline /> },
        { number: '25+', label: t('stats.activeDiscussions'), icon: <Forum /> },
        { number: '1000+', label: t('stats.students'), icon: <People /> }
    ]

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard')
        } else {
            navigate('/login')
        }
    }

    return (
        <>
            <SEOHead
                title={t('seo.title')}
                description={t('seo.description')}
                keywords={t('seo.keywords')}
                url="/"
                structuredData={[createWebsiteStructuredData(), createOrganizationStructuredData()]}
            />
            <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>

                {/* Hero Section */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        color: '#495057',
                        py: 12,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Container maxWidth="lg">
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            <Typography
                                variant="h2"
                                component="h1"
                                fontWeight="bold"
                                sx={{ mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
                            >
                                {t('hero.title')}
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    maxWidth: 600,
                                    opacity: 0.9,
                                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                                }}
                            >
                                {t('hero.subtitle')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    onClick={handleGetStarted}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.2rem',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#495057'
                                        }
                                    }}
                                >
                                    {user ? t('hero.continueLearning') : t('hero.getStarted')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/changelog')}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.2rem',
                                        borderColor: '#495057',
                                        color: '#495057',
                                        '&:hover': {
                                            borderColor: '#495057',
                                            backgroundColor: 'rgba(73, 80, 87, 0.1)'
                                        }
                                    }}
                                >
                                    {t('hero.whatsNew')}
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                </Box>

                {/* Features Section */}
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Typography variant="h3" component="h2" align="center" gutterBottom>
                        {t('features.title')}
                    </Typography>
                    <Grid container spacing={4} sx={{ mt: 4 }}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <School sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        {t('features.mathPastPapers.title')}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" paragraph>
                                        {t('features.mathPastPapers.description')}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/DSE_Math')}
                                        endIcon={<ArrowForward />}
                                    >
                                        {t('features.mathPastPapers.browsePapers')}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<PlayCircleOutline />}
                                        onClick={() => navigate('/question-demo')}
                                    >
                                        {t('features.mathPastPapers.viewDemo')}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        {features.map((feature, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: 8
                                        }
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            flexGrow: 1,
                                            textAlign: 'center',
                                            p: 3
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mb: 2
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography gutterBottom variant="h6" component="h3" fontWeight="600">
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                                if (feature.title === 'Practice Quizzes') {
                                                    navigate('/dashboard')
                                                } else {
                                                    // Handle other features
                                                }
                                            }}
                                        >
                                            {feature.title === t('features.practiceQuizzes.title') ? t('features.practiceQuizzes.startQuiz') : t('features.discussions.learnMore')}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* Stats Section */}
                <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            {stats.map((stat, index) => (
                                <Grid size={{ xs: 6, md: 3 }} key={index}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                            {React.cloneElement(stat.icon, {
                                                sx: { fontSize: 32, color: 'primary.main' }
                                            })}
                                        </Box>
                                        <Typography variant="h3" component="div" fontWeight="bold" color="primary">
                                            {stat.number}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* Call to Action */}
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Paper
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            borderRadius: 3
                        }}
                    >
                        <Typography variant="h3" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
                            {t('cta.title')}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                            {t('cta.subtitle')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleGetStarted}
                                sx={{
                                    backgroundColor: 'white',
                                    color: 'primary.main',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                    }
                                }}
                            >
                                {user ? t('cta.accessDashboard') : t('cta.startFree')}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                {t('cta.learnMore')}
                            </Button>
                        </Box>
                    </Paper>
                </Container>

                {/* Footer */}
                <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: 4 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {t('footer.title')}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                {t('footer.copyright')}
                            </Typography>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    )
}

export default HomePage