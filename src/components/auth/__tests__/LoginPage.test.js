import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import LoginPage from '../LoginPage'
import AuthContext from '../../../contexts/AuthContext'

// Mock the AuthContext
const mockAuthContext = {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInWithGoogle: jest.fn(),

    user: null,
    loading: false
}

// Mock the supabase service
jest.mock('../../../services/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn()
        }
    }
}))

// Mock useNavigate hook
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}))

const renderWithProviders = (component) => {
    const theme = createTheme()
    return render(
        <ThemeProvider theme={theme}>
            <AuthContext.Provider value={mockAuthContext}>
                {component}
            </AuthContext.Provider>
        </ThemeProvider>
    )
}

describe('LoginPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockAuthContext.user = null
        mockAuthContext.loading = false
    })

    test('renders login form by default', () => {
        renderWithProviders(<LoginPage />)

        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    test('switches to registration tab', () => {
        renderWithProviders(<LoginPage />)

        const registrationTab = screen.getByRole('tab', { name: 'Sign Up' })
        fireEvent.click(registrationTab)

        expect(screen.getByText('Sign Up')).toBeInTheDocument()
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    })

    test('handles login form submission', async () => {
        mockAuthContext.signIn.mockResolvedValue({ error: null })

        renderWithProviders(<LoginPage />)

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

        renderWithProviders(<LoginPage />)

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
        renderWithProviders(<LoginPage />)

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

        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })

    test('shows error for short password during registration', async () => {
        renderWithProviders(<LoginPage />)

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

        renderWithProviders(<LoginPage />)

        const googleButton = screen.getByRole('button', { name: /Sign in with Google/i })
        fireEvent.click(googleButton)

        await waitFor(() => {
            expect(mockAuthContext.signInWithGoogle).toHaveBeenCalled()
        })
    })



    test('shows loading state during authentication', async () => {
        mockAuthContext.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

        renderWithProviders(<LoginPage />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Sign In' })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('redirects to dashboard when user is authenticated', () => {
        mockAuthContext.user = { id: '123', email: 'test@example.com' }

        renderWithProviders(<LoginPage />)

        // Should show loading while checking authentication
        expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    })
})
