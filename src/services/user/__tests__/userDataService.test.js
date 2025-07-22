import UserDataService from '../userDataService'
import { supabase } from '../../supabase'

// Mock the supabase client
jest.mock('../../supabase')

describe('UserDataService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getTutorNotes', () => {
        test('should successfully get all public tutor notes', async () => {
            const mockData = [
                { id: '1', title: 'Math Notes', content: 'Algebra basics', is_public: true },
                { id: '2', title: 'Science Notes', content: 'Physics basics', is_public: true }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.getTutorNotes()

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })

        test('should handle error when getting tutor notes', async () => {
            const mockError = new Error('Database error')
            const mockResponse = { data: null, error: mockError }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockRejectedValue(mockError)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.getTutorNotes()

            expect(result).toEqual({
                data: null,
                error: mockError
            })
        })
    })

    describe('getTutorNotesByCategory', () => {
        test('should successfully get tutor notes by category', async () => {
            const mockData = [
                { id: '1', title: 'Math Notes', category: 'Mathematics', is_public: true }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue(mockResponse)
                    })
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.getTutorNotesByCategory('Mathematics')

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getTutorNoteById', () => {
        test('should successfully get tutor note by ID', async () => {
            const mockData = { id: '1', title: 'Math Notes', content: 'Algebra basics', is_public: true }
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue(mockResponse)
                    })
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.getTutorNoteById('1')

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('searchTutorNotes', () => {
        test('should successfully search tutor notes', async () => {
            const mockData = [
                { id: '1', title: 'Math Notes', content: 'Algebra basics', is_public: true }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    or: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue(mockResponse)
                    })
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.searchTutorNotes('Algebra')

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getCategories', () => {
        test('should successfully get all categories', async () => {
            const mockData = [
                { id: '1', name: 'Mathematics', description: 'Math subjects' },
                { id: '2', name: 'Science', description: 'Science subjects' }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.getCategories()

            expect(supabase.from).toHaveBeenCalledWith('categories')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getUserFavorites', () => {
        test('should successfully get user favorites', async () => {
            const mockData = [
                {
                    id: '1',
                    user_id: 'user123',
                    note_id: 'note1',
                    tutor_notes: { id: 'note1', title: 'Math Notes' }
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await UserDataService.getUserFavorites('user123')

            expect(supabase.from).toHaveBeenCalledWith('user_favorites')
            expect(mockSelect).toHaveBeenCalledWith(`
          *,
          tutor_notes (*)
        `)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('addToFavorites', () => {
        test('should successfully add note to favorites', async () => {
            const mockData = { id: '1', user_id: 'user123', note_id: 'note1' }
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await UserDataService.addToFavorites('user123', 'note1')

            expect(supabase.from).toHaveBeenCalledWith('user_favorites')
            expect(mockInsert).toHaveBeenCalledWith({
                user_id: 'user123',
                note_id: 'note1'
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('removeFromFavorites', () => {
        test('should successfully remove note from favorites', async () => {
            const mockResponse = { error: null }

            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                delete: mockDelete
            })

            const result = await UserDataService.removeFromFavorites('user123', 'note1')

            expect(supabase.from).toHaveBeenCalledWith('user_favorites')
            expect(mockDelete).toHaveBeenCalled()
            expect(result).toEqual(mockResponse)
        })
    })
})