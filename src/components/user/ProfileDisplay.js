import React, { useContext, useState, useEffect, useCallback } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Skeleton,
    Alert,
    Grid,
    Divider,
    Button
} from '@mui/material'
import { Person, Email, CalendarToday, Update, Quiz, TrendingUp, Visibility } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useProfile from '../../hooks/useProfile'
import AuthContext from '../../contexts/AuthContext'
import practiceQuizService from '../quiz/services/practiceQuizService'

const ProfileDisplay = ({ userId = null, showEmail = false, userEmail = null }) => {
    const { profile, loading, error, isOwnProfile } = useProfile(userId)
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    // State for practice quiz history
    const [recentTests, setRecentTests] = useState([])
    const [loadingTests, setLoadingTests] = useState(false)
    const [showAllTests, setShowAllTests] = useState(false)

    const loadPracticeQuizHistory = useCallback(async () => {
        try {
            setLoadingTests(true)
            const tests = await practiceQuizService.getPracticeQuizHistory(user.id, 10)
            setRecentTests(tests)
        } catch (err) {
            console.error('Error loading practice quiz history:', err)
        } finally {
            setLoadingTests(false)
        }
    }, [user?.id])

    // Load practice quiz history for the current user
    useEffect(() => {
        if (isOwnProfile && user?.id) {
            loadPracticeQuizHistory()
        }
    }, [isOwnProfile, user?.id, loadPracticeQuizHistory])

    const handleViewQuizResults = (test) => {
        // Navigate to quiz results if there's an attempt
        if (test.quiz_attempts?.[0]) {
            navigate('/quiz/results', {
                state: {
                    attemptId: test.quiz_attempts[0].id,
                    test: test
                }
            })
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Skeleton variant="circular" width={60} height={60} sx={{ mr: 2 }} />
                        <Box>
                            <Skeleton variant="text" width={200} height={32} />
                            <Skeleton variant="text" width={150} height={24} />
                        </Box>
                    </Box>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Alert severity="error">
                Failed to load profile: {error.message}
            </Alert>
        )
    }

    if (!profile) {
        return (
            <Alert severity="info">
                No profile found for this user.
            </Alert>
        )
    }

    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        sx={{ width: 60, height: 60, mr: 2 }}
                    >
                        {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" component="h2">
                            {profile.full_name || 'Unnamed User'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                                label={profile.role || 'user'}
                                color={profile.role === 'admin' ? 'error' : 'default'}
                                size="small"
                            />
                            {profile.username && (
                                <Chip
                                    label={`@${profile.username}`}
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                    {profile.website && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {profile.website}
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            Member since {(() => {
                                if (!profile.created_at) return 'Recently';
                                const date = new Date(profile.created_at);
                                return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
                            })()}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                        <Update fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            Last updated {(() => {
                                if (!profile.updated_at) return 'Recently';
                                const date = new Date(profile.updated_at);
                                return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
                            })()}
                        </Typography>
                    </Box>

                    {isOwnProfile && showEmail && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {profile.email || userEmail || user?.email || 'Email not available'}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Practice Quiz History - Only show for own profile */}
                {isOwnProfile && (
                    <Box sx={{ mt: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Quiz fontSize="small" color="primary" />
                            <Typography variant="subtitle2" fontWeight="600">
                                Practice Quiz History
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {loadingTests ? (
                            <Box>
                                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                                <Skeleton variant="rectangular" height={60} />
                            </Box>
                        ) : recentTests.length > 0 ? (
                            <Box>
                                <Grid container spacing={1}>
                                    {(showAllTests ? recentTests : recentTests.slice(0, 3)).map((test, index) => (
                                        <Grid item xs={12} key={test.id}>
                                            <Box sx={{
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                                                        {test.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(test.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={`${test.questions?.length || 0} Q`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    {test.quiz_attempts?.[0] && (
                                                        <Chip
                                                            icon={<TrendingUp />}
                                                            label={`${test.quiz_attempts[0].percentage}%`}
                                                            size="small"
                                                            color={test.quiz_attempts[0].percentage >= 70 ? 'success' : 'warning'}
                                                        />
                                                    )}
                                                    {test.quiz_attempts?.[0] && (
                                                        <Button
                                                            size="small"
                                                            startIcon={<Visibility />}
                                                            onClick={() => handleViewQuizResults(test)}
                                                            sx={{ minWidth: 'auto', px: 1 }}
                                                        >
                                                            View
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {recentTests.length > 3 && (
                                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                                        <Button
                                            size="small"
                                            onClick={() => setShowAllTests(!showAllTests)}
                                            variant="outlined"
                                        >
                                            {showAllTests ? 'Show Less' : `Show All (${recentTests.length})`}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No practice quizzes completed yet.
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

export default ProfileDisplay
