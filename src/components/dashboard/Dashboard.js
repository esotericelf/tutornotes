import React, { useEffect } from 'react'
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
    IconButton,
    CircularProgress,
    Alert,
    Skeleton
} from '@mui/material'
import {
    School,
    Book,
    Forum,
    Favorite,
    Logout,
    TrendingUp,
    Notifications,
    Refresh
} from '@mui/icons-material'
import { useAuth, useDashboardData, useDashboardStats, useDashboardActivity } from '../../store/hooks'
import { signOut } from '../../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import ProfileDisplay from '../user/ProfileDisplay'
import useProfile from '../../hooks/useProfile'
import PracticeQuizBlock from '../quiz/components/PracticeQuizBlock'

const Dashboard = () => {
    const { user, loading, dispatch } = useAuth()
    const navigate = useNavigate()
    const { profile } = useProfile()

    // Dashboard Redux hooks
    const { loadUserStats, loadDashboardData, refreshDashboard } = useDashboardData()
    const { userStats, quickStats, loading: statsLoading, errors: statsErrors } = useDashboardStats()
    const { recentActivity, popularTags, recommendedPapers, loading: activityLoading, errors: activityErrors } = useDashboardActivity()

    // Load dashboard data when component mounts
    useEffect(() => {
        if (user?.id) {
            console.log('🔄 Dashboard: Loading dashboard data for user:', user.id)
            loadUserStats(user.id)
            loadDashboardData(user.id)
        }
    }, [user?.id, loadUserStats, loadDashboardData])

    // Add a timeout to prevent infinite loading
    useEffect(() => {
        if (statsLoading.anyLoading || activityLoading.anyLoading) {
            const timeout = setTimeout(() => {
                console.log('⚠️ Dashboard: Loading timeout reached, forcing refresh')
                if (user?.id) {
                    refreshDashboard(user.id)
                }
            }, 15000) // 15 second timeout

            return () => clearTimeout(timeout)
        }
    }, [statsLoading.anyLoading, activityLoading.anyLoading, user?.id, refreshDashboard])

    // Auto-refresh dashboard data every 5 minutes
    useEffect(() => {
        if (!user?.id) return

        const interval = setInterval(() => {
            console.log('🔄 Dashboard: Auto-refreshing dashboard data')
            refreshDashboard(user.id)
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(interval)
    }, [user?.id, refreshDashboard])

    // Show loading while authentication is being determined
    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Checking authentication...
                </Typography>
            </Box>
        )
    }

    // Note: We don't block the Dashboard for profile loading
    // The profile will load in the background and update the UI when ready

    // Redirect if no user
    if (!user) {
        navigate('/login')
        return null
    }

    // Handle refresh button click
    const handleRefresh = () => {
        if (user?.id) {
            refreshDashboard(user.id)
        }
    }

    const handleLogout = async () => {
        try {
            console.log('🚪 Starting logout process...')

            // Try Redux logout first with shorter timeout
            const logoutPromise = dispatch(signOut())
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Logout timeout')), 3000)
            )

            const result = await Promise.race([logoutPromise, timeoutPromise])

            console.log('🚪 Logout result:', result)

            if (result.error) {
                console.error('Logout error:', result.error)
                // Still navigate to home even if there's an error
            }

            console.log('🚪 Navigating to home...')
            navigate('/')
        } catch (err) {
            console.error('Logout error:', err)
            console.log('🚪 Forcing direct logout due to timeout...')

            // Direct logout without Redux - clear everything locally
            try {
                // Clear Supabase auth state directly
                const { error } = await supabase.auth.signOut()
                if (error) {
                    console.warn('Direct Supabase logout failed:', error)
                }
            } catch (supabaseErr) {
                console.warn('Direct Supabase logout exception:', supabaseErr)
            }

            // Force clear any local storage/auth state
            try {
                localStorage.removeItem('sb-pjcjnmqoaajtotqqqsxs-auth-token')
                localStorage.removeItem('supabase.auth.token')
                sessionStorage.clear()
                // Clear any other auth-related storage
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('supabase') || key.includes('auth')) {
                        localStorage.removeItem(key)
                    }
                })
            } catch (storageErr) {
                console.warn('Could not clear storage:', storageErr)
            }

            console.log('🚪 Forcing navigation to home...')
            navigate('/')
        }
    }

    const dashboardItems = [
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
                        <Avatar
                            src={profile?.avatar_url}
                            alt={profile?.full_name || user?.email || 'User'}
                            sx={{
                                bgcolor: profile?.avatar_url ? 'transparent' : 'primary.main',
                                width: 40,
                                height: 40
                            }}
                        >
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() :
                                user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body2" color="text.secondary">
                                Welcome back,
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                                {profile?.full_name || user?.email || 'User'}
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
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 1 }}>
                            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Continue your learning journey with our comprehensive resources
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleRefresh}
                        disabled={statsLoading.anyLoading || activityLoading.anyLoading}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&:disabled': { bgcolor: 'grey.300' }
                        }}
                    >
                        <Refresh />
                    </IconButton>
                </Box>

                {/* Error Display */}
                {(statsErrors.anyError || activityErrors.anyError) && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Some dashboard data could not be loaded. Click the refresh button to try again.
                    </Alert>
                )}


                {/* Quick Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            {statsLoading.quickStats ? (
                                <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
                            ) : (
                                <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                                    {userStats?.progressScore || quickStats?.progressScore || 0}%
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                Progress Score
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Book sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            {statsLoading.quickStats ? (
                                <Skeleton variant="text" width="40%" height={40} sx={{ mx: 'auto' }} />
                            ) : (
                                <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
                                    {userStats?.papersCompleted || quickStats?.papersCompleted || 0}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                Papers Completed
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Forum sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            {statsLoading.quickStats ? (
                                <Skeleton variant="text" width="40%" height={40} sx={{ mx: 'auto' }} />
                            ) : (
                                <Typography variant="h4" component="div" fontWeight="bold" color="info.main">
                                    {quickStats?.discussionsParticipated || 0}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                Discussions Joined
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Favorite sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            {statsLoading.quickStats ? (
                                <Skeleton variant="text" width="40%" height={40} sx={{ mx: 'auto' }} />
                            ) : (
                                <Typography variant="h4" component="div" fontWeight="bold" color="error.main">
                                    {userStats?.favoriteTopics?.length || quickStats?.favoriteTopics || 0}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                Favorites Saved
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Main Dashboard Grid */}
                <Grid container spacing={4}>
                    {/* Feature Cards */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Card sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }} onClick={() => navigate('/DSE_Math')}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <School sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                                            <Typography variant="h6" component="h3">
                                                Math DSE Past Papers
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
                            {/* Practice Quiz Block */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <PracticeQuizBlock />
                            </Grid>

                            {dashboardItems.map((item, index) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={index}>
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
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            {/* User Profile */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2 }}>
                                    Your Profile
                                </Typography>
                                <ProfileDisplay showEmail={true} userEmail={user?.email} />
                            </Paper>



                            {/* Recent Activity */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2 }}>
                                    Recent Activity
                                </Typography>
                                <Box>
                                    {activityLoading.recentActivity ? (
                                        <Box>
                                            {[1, 2, 3].map((i) => (
                                                <Box key={i} sx={{ mb: 2 }}>
                                                    <Skeleton variant="text" width="80%" height={20} />
                                                    <Skeleton variant="text" width="60%" height={16} />
                                                    {i < 3 && <Divider sx={{ mt: 1 }} />}
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : recentActivity && recentActivity.length > 0 ? (
                                        recentActivity.map((activity, index) => (
                                            <Box key={activity.id || index} sx={{ mb: 2 }}>
                                                <Typography variant="body2" fontWeight="500">
                                                    {activity.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                                                </Typography>
                                                {activity.description && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {activity.description}
                                                    </Typography>
                                                )}
                                                {index < recentActivity.length - 1 && (
                                                    <Divider sx={{ mt: 2 }} />
                                                )}
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No recent activity to show
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>

                            {/* Popular Tags */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2 }}>
                                    Popular Topics
                                </Typography>
                                <Box>
                                    {activityLoading.popularTags ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Skeleton key={i} variant="rounded" width={80} height={32} />
                                            ))}
                                        </Box>
                                    ) : popularTags && popularTags.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {popularTags.slice(0, 8).map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag.tag}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    onClick={() => navigate(`/DSE_Math?tag=${encodeURIComponent(tag.tag)}`)}
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No popular topics available
                                        </Typography>
                                    )}
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