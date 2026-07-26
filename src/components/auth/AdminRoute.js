import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import { useAuth } from '../../store/hooks'
import { ProfileService } from '../../services/user/profileService'

function getAdminEmails() {
    // CRA embeds REACT_APP_*; NEXT_PUBLIC_* supported if set via custom tooling / Netlify inject.
    const raw =
        process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
        process.env.REACT_APP_ADMIN_EMAILS ||
        ''
    return raw
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
}

function isEmailAllowlisted(email) {
    if (!email) return false
    return getAdminEmails().includes(String(email).trim().toLowerCase())
}

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()
    const [profileLoading, setProfileLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [profileError, setProfileError] = useState(null)

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user) {
                setIsAdmin(false)
                setProfileError(null)
                setProfileLoading(false)
                return
            }

            // Email allowlist grants admin immediately
            if (isEmailAllowlisted(user.email)) {
                setIsAdmin(true)
                setProfileError(null)
                setProfileLoading(false)
                return
            }

            try {
                const { data: profile, error } = await ProfileService.getProfile(user.id)

                if (error) {
                    console.error('Error fetching profile:', error)
                    setProfileError('Failed to verify admin status')
                    setIsAdmin(false)
                } else if (profile && profile.role === 'admin') {
                    setIsAdmin(true)
                    setProfileError(null)
                } else {
                    setIsAdmin(false)
                    setProfileError(null)
                }
            } catch (error) {
                console.error('Error checking admin status:', error)
                setProfileError('Failed to verify admin status')
                setIsAdmin(false)
            } finally {
                setProfileLoading(false)
            }
        }

        checkAdminStatus()
    }, [user])

    // Show loading while checking authentication
    if (loading || profileLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                    Verifying admin access...
                </Typography>
            </Box>
        )
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Show error if profile check failed
    if (profileError) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    p: 3
                }}
            >
                <Alert severity="error" sx={{ maxWidth: 500 }}>
                    <Typography variant="h6" gutterBottom>
                        Access Verification Failed
                    </Typography>
                    <Typography variant="body2">
                        {profileError}. Please try refreshing the page or contact support if the issue persists.
                    </Typography>
                </Alert>
            </Box>
        )
    }

    // Show access denied if not admin
    if (!isAdmin) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    p: 3
                }}
            >
                <Alert severity="warning" sx={{ maxWidth: 500 }}>
                    <Typography variant="h6" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body2">
                        This page is only accessible to administrators. You don't have the required permissions to view this content.
                    </Typography>
                </Alert>
            </Box>
        )
    }

    // Render the protected content if user is admin
    return children
}

export default AdminRoute
