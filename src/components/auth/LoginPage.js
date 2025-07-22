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
    Link
} from '@mui/material'
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    School,
    Home,
    ArrowBack
} from '@mui/icons-material'
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
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [connectionError, setConnectionError] = useState('')

    const { signIn, signUp } = useContext(AuthContext)
    const navigate = useNavigate()

    // Check Supabase connection on component mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()
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
                    setSuccess('Login successful! Redirecting...')
                    setTimeout(() => navigate('/dashboard'), 1000)
                }
            } else {
                // Registration
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match')
                    setLoading(false)
                    return
                }

                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters long')
                    setLoading(false)
                    return
                }

                const result = await signUp(formData.email, formData.password)
                if (result.error) {
                    console.error('Registration error:', result.error)
                    let errorMessage = 'Registration failed. '

                    if (result.error.message) {
                        errorMessage += result.error.message
                    } else if (result.error.status === 422) {
                        errorMessage += 'Please check your email format and password strength.'
                    } else if (result.error.status === 429) {
                        errorMessage += 'Too many requests. Please try again later.'
                    } else {
                        errorMessage += 'Please try again or contact support.'
                    }

                    setError(errorMessage)
                } else {
                    setSuccess('Registration successful! Please check your email to verify your account.')
                    setFormData({
                        email: '',
                        password: '',
                        confirmPassword: ''
                    })
                }
            }
        } catch (err) {
            console.error('Unexpected error:', err)
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

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="primary"
                        onClick={() => navigate('/')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
                        <Link
                            component={RouterLink}
                            to="/"
                            color="inherit"
                            underline="hover"
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Home sx={{ mr: 0.5 }} fontSize="small" />
                            Home
                        </Link>
                        <Typography color="text.primary">Authentication</Typography>
                    </Breadcrumbs>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 'calc(100vh - 200px)'
                    }}
                >
                    {/* Logo Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 4
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2
                            }}
                        >
                            <School
                                sx={{
                                    fontSize: 48,
                                    color: 'primary.main',
                                    mr: 2
                                }}
                            />
                            <Typography
                                component="h1"
                                variant="h3"
                                color="primary"
                                fontWeight="bold"
                            >
                                Tutor Notes
                            </Typography>
                        </Box>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ maxWidth: 400 }}
                        >
                            Access your learning resources and join the community
                        </Typography>
                    </Box>

                    {/* Authentication Card */}
                    <Paper
                        elevation={8}
                        sx={{
                            width: '100%',
                            maxWidth: 450,
                            borderRadius: 3,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="fullWidth"
                                sx={{
                                    '& .MuiTab-root': {
                                        py: 2,
                                        fontSize: '1rem',
                                        fontWeight: 500
                                    }
                                }}
                            >
                                <Tab label="Sign In" />
                                <Tab label="Create Account" />
                            </Tabs>
                        </Box>

                        {/* Form Content */}
                        <Box sx={{ p: 4 }}>
                            {/* Error/Success Messages */}
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}
                            {success && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2
                                    }}
                                >
                                    {success}
                                </Alert>
                            )}
                            {connectionError && (
                                <Alert
                                    severity="warning"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2
                                    }}
                                >
                                    {connectionError}
                                </Alert>
                            )}

                            {/* Form */}
                            <Box component="form" onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Password Field */}
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete={activeTab === 0 ? 'current-password' : 'new-password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Confirm Password Field (Registration only) */}
                                {activeTab === 1 && (
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        sx={{ mb: 3 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle confirm password visibility"
                                                        onClick={handleToggleConfirmPasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        mt: activeTab === 0 ? 2 : 0,
                                        mb: 3,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: 2
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        activeTab === 0 ? 'Sign In' : 'Create Account'
                                    )}
                                </Button>

                                {/* Additional Info */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {activeTab === 0 ? (
                                            "Don't have an account? "
                                        ) : (
                                            "Already have an account? "
                                        )}
                                        <Button
                                            variant="text"
                                            onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                p: 0,
                                                minWidth: 'auto'
                                            }}
                                        >
                                            {activeTab === 0 ? 'Sign Up' : 'Sign In'}
                                        </Button>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Footer */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default LoginPage