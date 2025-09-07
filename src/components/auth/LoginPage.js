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
import AuthContext from '../../contexts/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { supabase } from '../../services/supabase'

// Custom Discord icon component
const DiscordIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
)

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

    const { signIn, signUp, signInWithGoogle, signInWithDiscord, user, loading: authLoading } = useContext(AuthContext)
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

    // Navigation effect when user is authenticated
    useEffect(() => {
        if (user && !authLoading) {
            navigate('/dashboard')
        }
    }, [user, authLoading, navigate])

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
                // Navigation will be handled automatically by AuthContext
            }
        } catch (err) {
            console.error('Google login error:', err)
            setError('Google login failed. Please try again.')
        } finally {
            setGoogleLoading(false)
        }
    }

    const handleDiscordLogin = async () => {
        setGoogleLoading(true) // Reuse the same loading state
        setError('')
        setSuccess('')

        try {
            const result = await signInWithDiscord()

            if (result.error) {
                console.error('Discord login error:', result.error)
                setError(result.error.message || 'Discord login failed. Please try again.')
            } else {
                setSuccess('Successfully signed in with Discord!')
                // Navigation will be handled automatically by AuthContext
            }
        } catch (err) {
            console.error('Discord login error:', err)
            setError('Discord login failed. Please try again.')
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
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 3
                    }}>
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
                                py: { xs: 1.5, sm: 1.5 },
                                borderColor: '#4285f4',
                                color: '#4285f4',
                                minHeight: { xs: 48, sm: 56 },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                '&:hover': {
                                    borderColor: '#3367d6',
                                    backgroundColor: 'rgba(66, 133, 244, 0.04)'
                                }
                            }}
                        >
                            {googleLoading ? 'Signing in...' : 'Google'}
                        </Button>

                        {/* Discord Login Button */}
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            id="discord-login"
                            startIcon={googleLoading ? <CircularProgress size={20} /> : <DiscordIcon />}
                            onClick={handleDiscordLogin}
                            disabled={googleLoading}
                            aria-label="Sign in with Discord"
                            sx={{
                                py: { xs: 1.5, sm: 1.5 },
                                borderColor: '#5865F2',
                                color: '#5865F2',
                                minHeight: { xs: 48, sm: 56 },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                '&:hover': {
                                    borderColor: '#4752C4',
                                    backgroundColor: 'rgba(88, 101, 242, 0.04)'
                                }
                            }}
                        >
                            {googleLoading ? 'Signing in...' : 'Discord'}
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