import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfileDisplay from '../ProfileDisplay'
import AuthContext from '../../../contexts/AuthContext'

// Mock the useProfile hook
jest.mock('../../../hooks/useProfile', () => ({
    __esModule: true,
    default: jest.fn()
}))

const mockUseProfile = require('../../../hooks/useProfile').default

describe('ProfileDisplay', () => {
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
    }

    const mockProfile = {
        id: 'test-user-id',
        full_name: 'Test User',
        username: 'testuser',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    }

    const renderWithAuth = (component, user = mockUser) => {
        return render(
            <AuthContext.Provider value={{ user }}>
                {component}
            </AuthContext.Provider>
        )
    }

    beforeEach(() => {
        mockUseProfile.mockClear()
    })

    test('displays email when profile.email is available', () => {
        const profileWithEmail = { ...mockProfile, email: 'profile@example.com' }
        mockUseProfile.mockReturnValue({
            profile: profileWithEmail,
            loading: false,
            error: null,
            isOwnProfile: true
        })

        renderWithAuth(<ProfileDisplay showEmail={true} />)

        expect(screen.getByText('profile@example.com')).toBeInTheDocument()
    })

    test('displays userEmail prop when profile.email is not available', () => {
        mockUseProfile.mockReturnValue({
            profile: mockProfile, // no email field
            loading: false,
            error: null,
            isOwnProfile: true
        })

        renderWithAuth(<ProfileDisplay showEmail={true} userEmail="prop@example.com" />)

        expect(screen.getByText('prop@example.com')).toBeInTheDocument()
    })

    test('displays user.email when neither profile.email nor userEmail prop is available', () => {
        mockUseProfile.mockReturnValue({
            profile: mockProfile, // no email field
            loading: false,
            error: null,
            isOwnProfile: true
        })

        renderWithAuth(<ProfileDisplay showEmail={true} />)

        expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    test('displays "Email not available" when no email source is available', () => {
        mockUseProfile.mockReturnValue({
            profile: mockProfile, // no email field
            loading: false,
            error: null,
            isOwnProfile: true
        })

        renderWithAuth(<ProfileDisplay showEmail={true} />, { id: 'test-user-id' }) // user without email

        expect(screen.getByText('Email not available')).toBeInTheDocument()
    })

    test('does not display email when showEmail is false', () => {
        mockUseProfile.mockReturnValue({
            profile: { ...mockProfile, email: 'test@example.com' },
            loading: false,
            error: null,
            isOwnProfile: true
        })

        renderWithAuth(<ProfileDisplay showEmail={false} />)

        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
    })

    test('does not display email when not own profile', () => {
        mockUseProfile.mockReturnValue({
            profile: { ...mockProfile, email: 'test@example.com' },
            loading: false,
            error: null,
            isOwnProfile: false
        })

        renderWithAuth(<ProfileDisplay showEmail={true} />)

        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
    })
})
