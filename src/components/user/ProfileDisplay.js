import React from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Skeleton,
    Alert
} from '@mui/material'
import { Person, Email, CalendarToday, Update } from '@mui/icons-material'
import useProfile from '../../hooks/useProfile'

const ProfileDisplay = ({ userId = null, showEmail = false }) => {
    const { profile, loading, error, isOwnProfile } = useProfile(userId)

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
                            Member since {new Date(profile.created_at).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                        <Update fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            Last updated {new Date(profile.updated_at).toLocaleDateString()}
                        </Typography>
                    </Box>

                    {isOwnProfile && showEmail && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {profile.email || 'Email not available'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

export default ProfileDisplay
