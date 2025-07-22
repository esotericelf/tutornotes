import AuthService from '../authService'
import { supabase } from '../../supabase'

// Mock the supabase client
jest.mock('../../supabase')

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('signUp', () => {
        test('should successfully sign up a user', async () => {
            const mockUserData = {
                email: 'test@example.com',
                password: 'password123',
                userData: { full_name: 'Test User' }
            }

            const mockResponse = {
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null
            }

            supabase.auth.signUp.mockResolvedValue(mockResponse)

            const result = await AuthService.signUp(
                mockUserData.email,
                mockUserData.password,
                mockUserData.userData
            )

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: mockUserData.email,
                password: mockUserData.password,
                options: {
                    data: mockUserData.userData
                }
            })
            expect(result).toEqual(mockResponse)
        })

        test('should handle sign up error', async () => {
            const mockError = new Error('Sign up failed')
            supabase.auth.signUp.mockRejectedValue(mockError)

            const result = await AuthService.signUp('test@example.com', 'password123')

            expect(result).toEqual({
                data: null,
                error: mockError
            })
        })
    })

    describe('signIn', () => {
        test('should successfully sign in a user', async () => {
            const mockResponse = {
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null
            }

            supabase.auth.signInWithPassword.mockResolvedValue(mockResponse)

            const result = await AuthService.signIn('test@example.com', 'password123')

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            })
            expect(result).toEqual(mockResponse)
        })

        test('should handle sign in error', async () => {
            const mockError = new Error('Invalid credentials')
            supabase.auth.signInWithPassword.mockRejectedValue(mockError)

            const result = await AuthService.signIn('test@example.com', 'wrongpassword')

            expect(result).toEqual({
                data: null,
                error: mockError
            })
        })
    })

    describe('signOut', () => {
        test('should successfully sign out a user', async () => {
            const mockResponse = { error: null }
            supabase.auth.signOut.mockResolvedValue(mockResponse)

            const result = await AuthService.signOut()

            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(result).toEqual(mockResponse)
        })

        test('should handle sign out error', async () => {
            const mockError = new Error('Sign out failed')
            supabase.auth.signOut.mockRejectedValue(mockError)

            const result = await AuthService.signOut()

            expect(result).toEqual({
                error: mockError
            })
        })
    })

    describe('getCurrentUser', () => {
        test('should successfully get current user', async () => {
            const mockUser = { id: '123', email: 'test@example.com' }
            const mockResponse = {
                data: { user: mockUser },
                error: null
            }

            supabase.auth.getUser.mockResolvedValue(mockResponse)

            const result = await AuthService.getCurrentUser()

            expect(supabase.auth.getUser).toHaveBeenCalled()
            expect(result).toEqual({
                user: mockUser,
                error: null
            })
        })

        test('should handle get current user error', async () => {
            const mockError = new Error('Failed to get user')
            supabase.auth.getUser.mockRejectedValue(mockError)

            const result = await AuthService.getCurrentUser()

            expect(result).toEqual({
                user: null,
                error: mockError
            })
        })
    })

    describe('getCurrentSession', () => {
        test('should successfully get current session', async () => {
            const mockSession = { access_token: 'token123', user: { id: '123' } }
            const mockResponse = {
                data: { session: mockSession },
                error: null
            }

            supabase.auth.getSession.mockResolvedValue(mockResponse)

            const result = await AuthService.getCurrentSession()

            expect(supabase.auth.getSession).toHaveBeenCalled()
            expect(result).toEqual({
                session: mockSession,
                error: null
            })
        })

        test('should handle get current session error', async () => {
            const mockError = new Error('Failed to get session')
            supabase.auth.getSession.mockRejectedValue(mockError)

            const result = await AuthService.getCurrentSession()

            expect(result).toEqual({
                session: null,
                error: mockError
            })
        })
    })

    describe('resetPassword', () => {
        test('should successfully send password reset email', async () => {
            const mockResponse = { error: null }
            supabase.auth.resetPasswordForEmail.mockResolvedValue(mockResponse)

            const result = await AuthService.resetPassword('test@example.com')

            expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
            expect(result).toEqual(mockResponse)
        })

        test('should handle password reset error', async () => {
            const mockError = new Error('Failed to send reset email')
            supabase.auth.resetPasswordForEmail.mockRejectedValue(mockError)

            const result = await AuthService.resetPassword('test@example.com')

            expect(result).toEqual({
                error: mockError
            })
        })
    })

    describe('updateProfile', () => {
        test('should successfully update user profile', async () => {
            const mockUpdates = { full_name: 'Updated Name' }
            const mockResponse = {
                data: { user: { id: '123', full_name: 'Updated Name' } },
                error: null
            }

            supabase.auth.updateUser.mockResolvedValue(mockResponse)

            const result = await AuthService.updateProfile(mockUpdates)

            expect(supabase.auth.updateUser).toHaveBeenCalledWith(mockUpdates)
            expect(result).toEqual(mockResponse)
        })

        test('should handle profile update error', async () => {
            const mockError = new Error('Failed to update profile')
            supabase.auth.updateUser.mockRejectedValue(mockError)

            const result = await AuthService.updateProfile({ full_name: 'New Name' })

            expect(result).toEqual({
                data: null,
                error: mockError
            })
        })
    })
})