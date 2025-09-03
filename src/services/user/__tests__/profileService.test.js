import { ProfileService } from '../profileService'
import { supabase } from '../../supabase'

// Mock supabase
jest.mock('../../supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn()
                }))
            })),
            upsert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn()
                }))
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn()
                    }))
                }))
            })),
            delete: jest.fn(() => ({
                eq: jest.fn()
            })),
            order: jest.fn(() => ({
                select: jest.fn()
            }))
        }))
    }
}))

describe('ProfileService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getProfile', () => {
        it('should get profile by user ID', async () => {
            const mockProfile = { id: '123', full_name: 'Test User' }
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
                })
            })

            supabase.from.mockReturnValue({ select: mockSelect })

            const result = await ProfileService.getProfile('123')

            expect(result.data).toEqual(mockProfile)
            expect(result.error).toBeNull()
        })

        it('should handle errors', async () => {
            const mockError = new Error('Profile not found')
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: mockError })
                })
            })

            supabase.from.mockReturnValue({ select: mockSelect })

            const result = await ProfileService.getProfile('123')

            expect(result.data).toBeNull()
            expect(result.error).toEqual(mockError)
        })
    })

    describe('createProfileFromGoogle', () => {
        it('should create new profile from Google data', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                user_metadata: {
                    full_name: 'Test User',
                    picture: 'https://example.com/avatar.jpg'
                }
            }

            const mockProfile = {
                id: '123',
                full_name: 'Test User',
                avatar_url: 'https://example.com/avatar.jpg',
                username: 'test',
                role: 'user'
            }

            // Mock getProfile to return null (no existing profile)
            const mockGetProfile = jest.fn().mockResolvedValue({ data: null, error: null })
            jest.spyOn(ProfileService, 'getProfile').mockImplementation(mockGetProfile)

            // Mock upsertProfile
            const mockUpsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
                })
            })

            supabase.from.mockReturnValue({ upsert: mockUpsert })

            const result = await ProfileService.createProfileFromGoogle(mockUser)

            expect(result.data).toEqual(mockProfile)
            expect(result.error).toBeNull()
        })

        it('should update existing profile with Google data', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                user_metadata: {
                    full_name: 'Updated Name',
                    picture: 'https://example.com/new-avatar.jpg'
                }
            }

            const existingProfile = {
                id: '123',
                full_name: 'Old Name',
                avatar_url: 'https://example.com/old-avatar.jpg',
                username: 'test',
                role: 'user'
            }

            // Mock getProfile to return existing profile
            const mockGetProfile = jest.fn().mockResolvedValue({ data: existingProfile, error: null })
            jest.spyOn(ProfileService, 'getProfile').mockImplementation(mockGetProfile)

            // Mock upsertProfile
            const mockUpsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { ...existingProfile, full_name: 'Updated Name' },
                        error: null
                    })
                })
            })

            supabase.from.mockReturnValue({ upsert: mockUpsert })

            const result = await ProfileService.createProfileFromGoogle(mockUser)

            expect(result.data.full_name).toBe('Updated Name')
            expect(result.error).toBeNull()
        })

        it('should handle missing user metadata gracefully', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                user_metadata: {}
            }

            // Mock getProfile to return null
            const mockGetProfile = jest.fn().mockResolvedValue({ data: null, error: null })
            jest.spyOn(ProfileService, 'getProfile').mockImplementation(mockGetProfile)

            // Mock upsertProfile
            const mockUpsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: '123', full_name: '', avatar_url: '', username: 'test' },
                        error: null
                    })
                })
            })

            supabase.from.mockReturnValue({ upsert: mockUpsert })

            const result = await ProfileService.createProfileFromGoogle(mockUser)

            expect(result.data.full_name).toBe('')
            expect(result.data.avatar_url).toBe('')
            expect(result.data.username).toBe('test') // Generated from email
            expect(result.error).toBeNull()
        })
    })

    describe('upsertProfile', () => {
        it('should upsert profile data', async () => {
            const profileData = { id: '123', full_name: 'Test User' }
            const mockProfile = { ...profileData, created_at: '2023-01-01' }

            const mockUpsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
                })
            })

            supabase.from.mockReturnValue({ upsert: mockUpsert })

            const result = await ProfileService.upsertProfile(profileData)

            expect(result.data).toEqual(mockProfile)
            expect(result.error).toBeNull()
        })
    })

    describe('updateProfile', () => {
        it('should update profile with new data', async () => {
            const updates = { full_name: 'New Name' }
            const mockProfile = { id: '123', full_name: 'New Name', updated_at: '2023-01-01' }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
                    })
                })
            })

            supabase.from.mockReturnValue({ update: mockUpdate })

            const result = await ProfileService.updateProfile('123', updates)

            expect(result.data).toEqual(mockProfile)
            expect(result.error).toBeNull()
        })
    })
})
