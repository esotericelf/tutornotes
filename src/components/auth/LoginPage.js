import React, { useState, useContext, useEffect } from 'react'
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    InputAdornment,
    IconButton,
    AppBar,
    Toolbar,
    Breadcrumbs,
    Link,
    Divider
} from '@mui/material'
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    School,
    Home,
    ArrowBack,
    Google
} from '@mui/icons-material'
import AppleIcon from '@mui/icons-material/Apple'
import AuthContext from '../../contexts/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { supabase } from '../../services/supabase'

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState(0)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [connectionError, setConnectionError] = useState('')

    const { signIn, signUp, signInWithGoogle, signInWithApple, user, loading: authLoading } = useContext(AuthContext)
    const navigate = useNavigate()

    // Redirect if already authenticated
    useEffect(() => {
        if (user && !authLoading) {
            navigate('/dashboard')
        }
    }, [user, authLoading, navigate])

    // Check Supabase connection on component mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Supabase connection error:', error)
                    setConnectionError('Unable to connect to authentication service. Please check your internet connection.')
                }
            } catch (err) {
                console.error('Connection test failed:', err)
                setConnectionError('Failed to connect to authentication service. Please try again later.')
            }
        }

        checkConnection()
    }, [])

    // Handle OAuth callbacks and redirects
    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Check if we're returning from an OAuth flow
                const { data: { session }, error } = await supabase.auth.getSession()

                if (session && !error) {
                    // User is authenticated, redirect to dashboard
                    console.log('OAuth callback: User authenticated, redirecting to dashboard')
                    navigate('/dashboard')
                }
            } catch (err) {
                console.error('OAuth callback error:', err)
            }
        }

        // Check for OAuth callback on mount
        handleOAuthCallback()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session ? 'User authenticated' : 'No user')

            if (event === 'SIGNED_IN' && session) {
                // User signed in via OAuth, redirect to dashboard
                console.log('OAuth sign-in detected, redirecting to dashboard')

                // Profile creation is now handled centrally in AuthContext
                console.log('OAuth sign-in detected, profile creation will be handled automatically')

                navigate('/dashboard')
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
        setError('')
        setSuccess('')
        setFormData({
            email: '',
            password: '',
            confirmPassword: ''
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setError('')
        setSuccess('')

        try {
            const result = await signInWithGoogle()

            if (result.error) {
                console.error('Google login error:', result.error)
                setError(result.error.message || 'Google login failed. Please try again.')
            } else {
                setSuccess('Successfully signed in with Google!')
                // Profile creation will be handled by the auth state change listener
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            }
        } catch (err) {
            console.error('Google login error:', err)
            setError('Google login failed. Please try again.')
        } finally {
            setGoogleLoading(false)
        }
    }

    const handleAppleLogin = async () => {
        setGoogleLoading(true) // Reuse the same loading state
        setError('')
        setSuccess('')

        try {
            const result = await signInWithApple()

            if (result.error) {
                console.error('Apple login error:', result.error)
                setError(result.error.message || 'Apple login failed. Please try again.')
            } else {
                setSuccess('Successfully signed in with Apple!')
                // Profile creation will be handled by the auth state change listener
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            }
        } catch (err) {
            console.error('Apple login error:', err)
            setError('Apple login failed. Please try again.')
        } finally {
            setGoogleLoading(false)
        }
    }



    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (activeTab === 0) {
                // Login
                const result = await signIn(formData.email, formData.password)

                if (result.error) {
                    console.error('Login error:', result.error)
                    setError(result.error.message || 'Login failed. Please check your credentials.')
                } else {
                    setSuccess('Successfully logged in!')
                    setTimeout(() => {
                        navigate('/dashboard')
                    }, 1000)
                }
            } else {
                // Registration
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match.')
                    setLoading(false)
                    return
                }

                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters long.')
                    setLoading(false)
                    return
                }

                const result = await signUp(formData.email, formData.password)

                if (result.error) {
                    console.error('Registration error:', result.error)
                    setError(result.error.message || 'Registration failed. Please try again.')
                } else {
                    setSuccess('Registration successful! Please check your email to verify your account.')
                }
            }
        } catch (err) {
            console.error('Authentication error:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    // Show loading while authentication is being determined
    if (authLoading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Checking authentication...
                </Typography>
            </Container>
        )
    }

    if (connectionError) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {connectionError}
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                    fullWidth
                >
                    Retry Connection
                </Button>
            </Container>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="sm">
                {/* Navigation */}
                <AppBar position="static" sx={{ mb: 3, borderRadius: 2 }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            sx={{ mr: 2 }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'white' }}>
                            <Link
                                component={RouterLink}
                                to="/"
                                color="inherit"
                                underline="hover"
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Home sx={{ mr: 0.5 }} />
                                Home
                            </Link>
                            <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
                                <School sx={{ mr: 0.5 }} />
                                {activeTab === 0 ? 'Login' : 'Register'}
                            </Typography>
                        </Breadcrumbs>
                    </Toolbar>
                </AppBar>

                {/* Main Content */}
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
                        <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Tutor Notes
                    </Typography>

                    {/* OAuth Login Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        {/* Google Login Button */}
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            id="google-login"
                            startIcon={googleLoading ? <CircularProgress size={20} /> : <Google />}
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            aria-label="Sign in with Google"
                            sx={{
                                py: 1.5,
                                borderColor: '#4285f4',
                                color: '#4285f4',
                                '&:hover': {
                                    borderColor: '#3367d6',
                                    backgroundColor: 'rgba(66, 133, 244, 0.04)'
                                }
                            }}
                        >
                            {googleLoading ? 'Signing in...' : 'Google'}
                        </Button>

                        {/* Apple Login Button */}
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            id="apple-login"
                            startIcon={googleLoading ? <CircularProgress size={20} /> : <AppleIcon />}
                            onClick={handleAppleLogin}
                            disabled={googleLoading}
                            aria-label="Sign in with Apple"
                            sx={{
                                py: 1.5,
                                borderColor: '#000000',
                                color: '#000000',
                                '&:hover': {
                                    borderColor: '#333333',
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            {googleLoading ? 'Signing in...' : 'Apple'}
                        </Button>
                    </Box>



                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            centered
                            aria-label="Authentication tabs"
                        >
                            <Tab
                                label="Login"
                                id="login-tab"
                                aria-controls="login-panel"
                            />
                            <Tab
                                label="Register"
                                id="register-tab"
                                aria-controls="register-panel"
                            />
                        </Tabs>
                    </Box>

                    {/* Error/Success Messages */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {/* Form */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        role="tabpanel"
                        id={activeTab === 0 ? "login-panel" : "register-panel"}
                        aria-labelledby={activeTab === 0 ? "login-tab" : "register-tab"}
                    >
                        <TextField
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            autoComplete="email"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            id="password"
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            autoComplete="current-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {activeTab === 1 && (
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                margin="normal"
                                required
                                autoComplete="new-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleToggleConfirmPasswordVisibility}
                                                edge="end"
                                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            id="submit-button"
                            disabled={loading}
                            aria-label={activeTab === 0 ? 'Sign in to account' : 'Create new account'}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                activeTab === 0 ? 'Login' : 'Register'
                            )}
                        </Button>
                    </Box>

                    {/* Additional Info */}
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        {activeTab === 0 ? (
                            "Don't have an account? "
                        ) : (
                            "Already have an account? "
                        )}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                            sx={{ cursor: 'pointer' }}
                        >
                            {activeTab === 0 ? 'Register here' : 'Login here'}
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    )
}

export default LoginPage