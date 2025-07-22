import AdminService from '../adminService'
import { supabase } from '../../supabase'

// Mock the supabase client
jest.mock('../../supabase')

describe('AdminService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createTutorNote', () => {
        test('should successfully create a new tutor note', async () => {
            const mockNoteData = {
                title: 'Math Notes',
                content: 'Algebra basics',
                category: 'Mathematics',
                is_public: true,
                author_id: 'user123',
                tags: ['algebra', 'math']
            }

            const mockData = { id: '1', ...mockNoteData }
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await AdminService.createTutorNote(mockNoteData)

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockInsert).toHaveBeenCalledWith({
                title: mockNoteData.title,
                content: mockNoteData.content,
                category: mockNoteData.category,
                is_public: mockNoteData.is_public,
                author_id: mockNoteData.author_id,
                tags: mockNoteData.tags
            })
            expect(result).toEqual(mockResponse)
        })

        test('should handle error when creating tutor note', async () => {
            const mockError = new Error('Database error')
            const mockResponse = { data: null, error: mockError }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockRejectedValue(mockError)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await AdminService.createTutorNote({
                title: 'Test',
                content: 'Test content',
                author_id: 'user123'
            })

            expect(result).toEqual({
                data: null,
                error: mockError
            })
        })
    })

    describe('updateTutorNote', () => {
        test('should successfully update a tutor note', async () => {
            const mockUpdates = {
                title: 'Updated Math Notes',
                content: 'Updated content',
                category: 'Mathematics',
                is_public: false,
                tags: ['updated', 'tags']
            }

            const mockData = { id: '1', ...mockUpdates }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await AdminService.updateTutorNote('1', mockUpdates)

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockUpdate).toHaveBeenCalledWith({
                title: mockUpdates.title,
                content: mockUpdates.content,
                category: mockUpdates.category,
                is_public: mockUpdates.is_public,
                tags: mockUpdates.tags,
                updated_at: expect.any(String)
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('deleteTutorNote', () => {
        test('should successfully delete a tutor note', async () => {
            const mockResponse = { error: null }

            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                delete: mockDelete
            })

            const result = await AdminService.deleteTutorNote('1')

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockDelete).toHaveBeenCalled()
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getAllTutorNotes', () => {
        test('should successfully get all tutor notes with author info', async () => {
            const mockData = [
                {
                    id: '1',
                    title: 'Math Notes',
                    author_id: 'user123',
                    profiles: { id: 'user123', email: 'test@example.com', full_name: 'Test User' }
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await AdminService.getAllTutorNotes()

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(mockSelect).toHaveBeenCalledWith(`
          *,
          profiles:author_id (id, email, full_name)
        `)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('createCategory', () => {
        test('should successfully create a new category', async () => {
            const mockCategoryData = {
                name: 'Physics',
                description: 'Physics subjects',
                color: '#ff0000'
            }

            const mockData = { id: '1', ...mockCategoryData }
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await AdminService.createCategory(mockCategoryData)

            expect(supabase.from).toHaveBeenCalledWith('categories')
            expect(mockInsert).toHaveBeenCalledWith({
                name: mockCategoryData.name,
                description: mockCategoryData.description,
                color: mockCategoryData.color
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('updateCategory', () => {
        test('should successfully update a category', async () => {
            const mockUpdates = {
                name: 'Updated Physics',
                description: 'Updated description',
                color: '#00ff00'
            }

            const mockData = { id: '1', ...mockUpdates }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await AdminService.updateCategory('1', mockUpdates)

            expect(supabase.from).toHaveBeenCalledWith('categories')
            expect(mockUpdate).toHaveBeenCalledWith({
                name: mockUpdates.name,
                description: mockUpdates.description,
                color: mockUpdates.color
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('deleteCategory', () => {
        test('should successfully delete a category', async () => {
            const mockResponse = { error: null }

            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                delete: mockDelete
            })

            const result = await AdminService.deleteCategory('1')

            expect(supabase.from).toHaveBeenCalledWith('categories')
            expect(mockDelete).toHaveBeenCalled()
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getAllUsers', () => {
        test('should successfully get all users', async () => {
            const mockData = [
                { id: 'user123', email: 'test@example.com', full_name: 'Test User', role: 'user' }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await AdminService.getAllUsers()

            expect(supabase.from).toHaveBeenCalledWith('profiles')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('updateUserRole', () => {
        test('should successfully update user role', async () => {
            const mockData = { id: 'user123', role: 'admin' }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await AdminService.updateUserRole('user123', 'admin')

            expect(supabase.from).toHaveBeenCalledWith('profiles')
            expect(mockUpdate).toHaveBeenCalledWith({ role: 'admin' })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getSystemStats', () => {
        test('should successfully get system statistics', async () => {
            const mockNotesCount = { count: 50 }
            const mockUsersCount = { count: 25 }
            const mockCategoriesCount = { count: 10 }

            const mockFrom = jest.fn()
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockNotesCount) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockUsersCount) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockCategoriesCount) })

            supabase.from = mockFrom

            const result = await AdminService.getSystemStats()

            expect(supabase.from).toHaveBeenCalledWith('tutor_notes')
            expect(supabase.from).toHaveBeenCalledWith('profiles')
            expect(supabase.from).toHaveBeenCalledWith('categories')
            expect(result.data).toEqual({
                totalNotes: 50,
                totalUsers: 25,
                totalCategories: 10
            })
        })
    })
})