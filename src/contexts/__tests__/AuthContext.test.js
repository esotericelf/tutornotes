import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '../../services/supabase'

// Mock the supabase client
jest.mock('../../services/supabase')

// Test component to access auth context
const TestComponent = () => {
    const { user, loading, isAuthenticated } = useAuth()
    return (
        <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user">{user ? user.email : 'no-user'}</div>
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should provide authentication context', async () => {
        const mockSession = { user: { id: '123', email: 'test@example.com' } }
        const mockGetSession = jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
        })

        const mockOnAuthStateChange = jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
        }))

        supabase.auth.getSession = mockGetSession
        supabase.auth.onAuthStateChange = mockOnAuthStateChange

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        // Initially should be loading
        expect(screen.getByTestId('loading')).toHaveTextContent('true')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false')
        })

        // Should show authenticated user
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true')
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    test('should handle no session', async () => {
        const mockGetSession = jest.fn().mockResolvedValue({
            data: { session: null },
            error: null
        })

        const mockOnAuthStateChange = jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
        }))

        supabase.auth.getSession = mockGetSession
        supabase.auth.onAuthStateChange = mockOnAuthStateChange

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false')
        })

        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })

    test('should handle session error', async () => {
        const mockGetSession = jest.fn().mockResolvedValue({
            data: { session: null },
            error: new Error('Session error')
        })

        const mockOnAuthStateChange = jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
        }))

        supabase.auth.getSession = mockGetSession
        supabase.auth.onAuthStateChange = mockOnAuthStateChange

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false')
        })

        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false')
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })

    test('should throw error when useAuth is used outside AuthProvider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => {
            render(<TestComponent />)
        }).toThrow('useAuth must be used within an AuthProvider')

        consoleSpy.mockRestore()
    })
})