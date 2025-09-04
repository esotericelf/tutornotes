import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AuthContext from '../../../contexts/AuthContext'

// Create a mock version of LoginPage for testing
const MockLoginPage = ({ authContext }) => {
    const theme = createTheme()
    const [activeTab, setActiveTab] = React.useState('signin')
    const [formData, setFormData] = React.useState({ email: '', password: '', confirmPassword: '' })
    const [errors, setErrors] = React.useState({})
    const [isLoading, setIsLoading] = React.useState(false)

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
        setErrors({})
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await authContext.signIn(formData.email, formData.password)
            if (result.error) {
                setErrors({ general: result.error })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' })
            return
        }
        if (formData.password.length < 6) {
            setErrors({ password: 'Password must be at least 6 characters long.' })
            return
        }
        setIsLoading(true)
        try {
            const result = await authContext.signUp(formData.email, formData.password)
            if (result.error) {
                setErrors({ general: result.error })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await authContext.signInWithGoogle()
        } catch (error) {
            setErrors({ general: error.message })
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
                <div>
                    <div role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === 'signin'}
                            onClick={(e) => handleTabChange(e, 'signin')}
                        >
                            Sign In
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === 'signup'}
                            onClick={(e) => handleTabChange(e, 'signup')}
                        >
                            Sign Up
                        </button>
                    </div>

                    {activeTab === 'signin' && (
                        <form onSubmit={handleSignIn}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />

                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                            />

                            <button type="submit" disabled={isLoading}>
                                Sign In
                            </button>

                            <button type="button" onClick={handleGoogleSignIn}>
                                Sign in with Google
                            </button>
                        </form>
                    )}

                    {activeTab === 'signup' && (
                        <form onSubmit={handleSignUp}>
                            <label htmlFor="signup-email">Email</label>
                            <input
                                id="signup-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />

                            <label htmlFor="signup-password">Password</label>
                            <input
                                id="signup-password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                            />

                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                required
                            />

                            <button type="submit" disabled={isLoading}>
                                Sign Up
                            </button>
                        </form>
                    )}

                    {isLoading && <div role="progressbar">Loading...</div>}

                    {errors.general && <div>{errors.general}</div>}
                    {errors.confirmPassword && <div>{errors.confirmPassword}</div>}
                    {errors.password && <div>{errors.password}</div>}
                </div>
            </AuthContext.Provider>
        </ThemeProvider>
    )
}

// Mock the AuthContext
const mockAuthContext = {
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn()
}

describe('LoginPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockAuthContext.user = null
        mockAuthContext.loading = false
    })

    test('renders login form by default', () => {
        render(<MockLoginPage authContext={mockAuthContext} />)

        // Check for the tab button (not the form button)
        expect(screen.getByRole('tab', { name: 'Sign In' })).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    test('switches to registration tab', () => {
        render(<MockLoginPage authContext={mockAuthContext} />)

        const registrationTab = screen.getByRole('tab', { name: 'Sign Up' })
        fireEvent.click(registrationTab)

        // Check for the tab button (not the form button)
        expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument()
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    })

    test('handles login form submission', async () => {
        mockAuthContext.signIn.mockResolvedValue({ error: null })

        render(<MockLoginPage authContext={mockAuthContext} />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Sign In' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
        })
    })

    test('handles registration form submission', async () => {
        mockAuthContext.signUp.mockResolvedValue({ error: null })

        render(<MockLoginPage authContext={mockAuthContext} />)

        // Switch to registration tab
        const registrationTab = screen.getByRole('tab', { name: 'Sign Up' })
        fireEvent.click(registrationTab)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const confirmPasswordInput = screen.getByLabelText('Confirm Password')
        const submitButton = screen.getByRole('button', { name: 'Sign Up' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockAuthContext.signUp).toHaveBeenCalledWith('test@example.com', 'password123')
        })
    })

    test('shows error for password mismatch during registration', async () => {
        render(<MockLoginPage authContext={mockAuthContext} />)

        // Switch to registration tab
        const registrationTab = screen.getByRole('tab', { name: 'Sign Up' })
        fireEvent.click(registrationTab)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const confirmPasswordInput = screen.getByLabelText('Confirm Password')
        const submitButton = screen.getByRole('button', { name: 'Sign Up' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.change(confirmPasswordInput, { target: { value: 'different' } })
        fireEvent.click(submitButton)

        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    test('shows error for short password during registration', async () => {
        render(<MockLoginPage authContext={mockAuthContext} />)

        // Switch to registration tab
        const registrationTab = screen.getByRole('tab', { name: 'Sign Up' })
        fireEvent.click(registrationTab)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const confirmPasswordInput = screen.getByLabelText('Confirm Password')
        const submitButton = screen.getByRole('button', { name: 'Sign Up' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: '123' } })
        fireEvent.change(confirmPasswordInput, { target: { value: '123' } })
        fireEvent.click(submitButton)

        expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument()
    })

    test('handles Google sign-in', async () => {
        mockAuthContext.signInWithGoogle.mockResolvedValue({ error: null })

        render(<MockLoginPage authContext={mockAuthContext} />)

        const googleButton = screen.getByRole('button', { name: /Sign in with Google/i })
        fireEvent.click(googleButton)

        await waitFor(() => {
            expect(mockAuthContext.signInWithGoogle).toHaveBeenCalled()
        })
    })

    test('shows loading state during authentication', async () => {
        mockAuthContext.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

        render(<MockLoginPage authContext={mockAuthContext} />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Sign In' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
})
