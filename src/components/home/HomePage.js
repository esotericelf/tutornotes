import React, { useContext } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    AppBar,
    Toolbar,
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
    People
} from '@mui/icons-material'
import AuthContext from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const features = [
        {
            icon: <Book sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: 'Math Past Papers',
            description: 'Access a comprehensive collection of past exam papers with detailed solutions and step-by-step explanations.',
            color: '#e3f2fd'
        },
        {
            icon: <School sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: 'Tutor Notes',
            description: 'Browse educational notes and resources created by experienced tutors and educators.',
            color: '#f3e5f5'
        },
        {
            icon: <Forum sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: 'Discussions',
            description: 'Join discussions with other students, ask questions, and get help with difficult topics.',
            color: '#e8f5e8'
        },
        {
            icon: <Favorite sx={{ fontSize: 48, color: 'primary.main' }} />,
            title: 'Favorites',
            description: 'Save your favorite notes and papers for quick access and personalized learning.',
            color: '#fff3e0'
        }
    ]

    const stats = [
        { number: '150+', label: 'Past Papers', icon: <Book /> },
        { number: '50+', label: 'Tutor Notes', icon: <School /> },
        { number: '25+', label: 'Active Discussions', icon: <Forum /> },
        { number: '1000+', label: 'Students', icon: <People /> }
    ]

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard')
        } else {
            navigate('/login')
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid', borderColor: '#dee2e6' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <School sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                            Tutor Notes
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {user ? (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Continue Learning
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/login')}
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

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
                            Your Learning Journey
                            <br />
                            Starts Here
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
                            Access comprehensive math past papers, expert tutor notes, and join a community of learners
                        </Typography>
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
                            {user ? 'Continue Learning' : 'Start Learning Now'}
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" component="h2" align="center" gutterBottom>
                    Features
                </Typography>
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <School sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h5" component="h3" gutterBottom>
                                    Math Past Papers
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Access comprehensive collection of past mathematics examination papers with advanced filtering and search capabilities.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/mathpaper')}
                                    endIcon={<ArrowForward />}
                                >
                                    Browse Papers
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
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
                                    <Button size="small" variant="outlined">
                                        Learn More
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
                            <Grid item xs={6} md={3} key={index}>
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
                        Ready to Transform Your Learning?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                        Join thousands of students who are already using Tutor Notes to improve their academic performance and achieve their goals.
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
                            {user ? 'Access Dashboard' : 'Start Free Today'}
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
                            Learn More
                        </Button>
                    </Box>
                </Paper>
            </Container>

            {/* Footer */}
            <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: 4 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Tutor Notes
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            © 2024 Tutor Notes. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    )
}

export default HomePage