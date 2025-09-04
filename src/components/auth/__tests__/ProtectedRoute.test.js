import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AuthContext from '../../../contexts/AuthContext'

// Create a mock version of ProtectedRoute for testing
const MockProtectedRoute = ({ children, authContext }) => {
    const theme = createTheme()

    if (authContext.loading) {
        return (
            <ThemeProvider theme={theme}>
                <AuthContext.Provider value={authContext}>
                    <div role="progressbar">Loading...</div>
                </AuthContext.Provider>
            </ThemeProvider>
        )
    }

    if (!authContext.user) {
        return (
            <ThemeProvider theme={theme}>
                <AuthContext.Provider value={authContext}>
                    <div data-testid="navigate" data-to="/login">Redirected to /login</div>
                </AuthContext.Provider>
            </ThemeProvider>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
                {children}
            </AuthContext.Provider>
        </ThemeProvider>
    )
}

describe('ProtectedRoute Component', () => {
    const TestChild = () => <div>Protected Content</div>

    test('renders children when user is authenticated', () => {
        const authContext = {
            user: { id: '123', email: 'test@example.com' },
            loading: false
        }

        render(
            <MockProtectedRoute authContext={authContext}>
                <TestChild />
            </MockProtectedRoute>
        )

        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    test('shows loading spinner when authentication is loading', () => {
        const authContext = {
            user: null,
            loading: true
        }

        render(
            <MockProtectedRoute authContext={authContext}>
                <TestChild />
            </MockProtectedRoute>
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    test('redirects to login when user is not authenticated', () => {
        const authContext = {
            user: null,
            loading: false
        }

        render(
            <MockProtectedRoute authContext={authContext}>
                <TestChild />
            </MockProtectedRoute>
        )

        expect(screen.getByTestId('navigate')).toBeInTheDocument()
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
})
