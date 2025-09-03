import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ProtectedRoute from '../ProtectedRoute'
import AuthContext from '../../../contexts/AuthContext'

// Mock react-router-dom hooks
const mockNavigate = jest.fn()
const mockLocation = { pathname: '/dashboard' }

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Redirected to {to}</div>
}))

const renderWithProviders = (component, authContext) => {
    const theme = createTheme()
    return render(
        <ThemeProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
                {component}
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

        renderWithProviders(
            <ProtectedRoute>
                <TestChild />
            </ProtectedRoute>,
            authContext
        )

        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    test('shows loading spinner when authentication is loading', () => {
        const authContext = {
            user: null,
            loading: true
        }

        renderWithProviders(
            <ProtectedRoute>
                <TestChild />
            </ProtectedRoute>,
            authContext
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    test('redirects to login when user is not authenticated', () => {
        const authContext = {
            user: null,
            loading: false
        }

        renderWithProviders(
            <ProtectedRoute>
                <TestChild />
            </ProtectedRoute>,
            authContext
        )

        expect(screen.getByTestId('navigate')).toBeInTheDocument()
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    test('redirects to login with return location when user is not authenticated', () => {
        const authContext = {
            user: null,
            loading: false
        }

        renderWithProviders(
            <ProtectedRoute>
                <TestChild />
            </ProtectedRoute>,
            authContext
        )

        const navigateElement = screen.getByTestId('navigate')
        expect(navigateElement).toBeInTheDocument()
        expect(navigateElement).toHaveAttribute('data-to', '/login')
    })
})
