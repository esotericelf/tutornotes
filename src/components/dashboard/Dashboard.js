import React, { useContext } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    AppBar,
    Toolbar,
    Avatar,
    Divider,
    Chip,
    IconButton
} from '@mui/material'
import {
    School,
    Book,
    Forum,
    Favorite,
    Logout,
    TrendingUp,
    Person,
    Notifications
} from '@mui/icons-material'
import AuthContext from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const { user, signOut } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const dashboardItems = [
        {
            title: 'Math Past Papers',
            description: 'Access and practice with past exam questions',
            icon: <Book sx={{ fontSize: 48, color: 'primary.main' }} />,
            action: 'View Papers',
            color: '#e3f2fd',
            count: '150+'
        },
        {
            title: 'Tutor Notes',
            description: 'Browse educational notes and resources',
            icon: <School sx={{ fontSize: 48, color: 'primary.main' }} />,
            action: 'Browse Notes',
            color: '#f3e5f5',
            count: '50+'
        },
        {
            title: 'Discussions',
            description: 'Join discussions and ask questions',
            icon: <Forum sx={{ fontSize: 48, color: 'primary.main' }} />,
            action: 'Join Discussions',
            color: '#e8f5e8',
            count: '25+'
        },
        {
            title: 'Favorites',
            description: 'Your saved notes and papers',
            icon: <Favorite sx={{ fontSize: 48, color: 'primary.main' }} />,
            action: 'View Favorites',
            color: '#fff3e0',
            count: '12'
        }
    ]

    const recentActivity = [
        { action: 'Viewed Math Paper 2023 Q5', time: '2 hours ago' },
        { action: 'Added note to favorites', time: '1 day ago' },
        { action: 'Joined discussion on Calculus', time: '2 days ago' },
        { action: 'Completed practice quiz', time: '3 days ago' }
    ]

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <School sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                            Tutor Notes
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton color="primary">
                            <Notifications />
                        </IconButton>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body2" color="text.secondary">
                                Welcome back,
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                                {user?.email || 'User'}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<Logout />}
                            onClick={handleLogout}
                            sx={{ ml: 2 }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 1 }}>
                        Welcome to Your Dashboard
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Continue your learning journey with our comprehensive resources
                    </Typography>
                </Box>

                {/* Quick Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                                85%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Progress Score
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Book sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
                                24
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Papers Completed
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Forum sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" component="div" fontWeight="bold" color="info.main">
                                8
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Discussions Joined
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Favorite sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="h4" component="div" fontWeight="bold" color="error.main">
                                12
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Favorites Saved
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Main Dashboard Grid */}
                <Grid container spacing={4}>
                    {/* Feature Cards */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }} onClick={() => navigate('/mathpaper')}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <School sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                                            <Typography variant="h6" component="h3">
                                                Math Past Papers
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Browse and search through past mathematics examination papers
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip label="Filter & Search" size="small" color="primary" variant="outlined" />
                                            <Typography variant="caption" color="text.secondary">
                                                Advanced filtering
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {dashboardItems.map((item, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                {item.icon}
                                                <Chip
                                                    label={item.count}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ ml: 'auto' }}
                                                />
                                            </Box>
                                            <Typography gutterBottom variant="h6" component="h4" fontWeight="600">
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {item.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 3, pt: 0 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                sx={{ borderRadius: 2 }}
                                            >
                                                {item.action}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            {/* Recent Activity */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2 }}>
                                    Recent Activity
                                </Typography>
                                <Box>
                                    {recentActivity.map((activity, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Typography variant="body2" fontWeight="500">
                                                {activity.action}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {activity.time}
                                            </Typography>
                                            {index < recentActivity.length - 1 && (
                                                <Divider sx={{ mt: 2 }} />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>

                            {/* Quick Actions */}
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2 }}>
                                    Quick Actions
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                                        Continue Last Paper
                                    </Button>
                                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                                        Start New Discussion
                                    </Button>
                                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                                        View Progress Report
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default Dashboard