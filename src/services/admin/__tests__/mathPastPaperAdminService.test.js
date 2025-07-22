import MathPastPaperAdminService from '../mathPastPaperAdminService'
import { supabase } from '../../supabase'

jest.mock('../../supabase')

describe('MathPastPaperAdminService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createMathPastPaper', () => {
        test('should successfully create a new math past paper question', async () => {
            const mockQuestionData = {
                year: 2023,
                question_no: 1,
                correct_answer: 'A',
                option_a: 'Option A',
                option_b: 'Option B',
                option_c: 'Option C',
                option_d: 'Option D',
                user_id: 'user123'
            }

            const mockData = { id: 1, ...mockQuestionData }
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await MathPastPaperAdminService.createMathPastPaper(mockQuestionData)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('updateMathPastPaper', () => {
        test('should successfully update a math past paper question', async () => {
            const mockUpdates = {
                year: 2024,
                question_no: 2,
                correct_answer: 'B',
                option_a: 'Updated Option A',
                option_b: 'Updated Option B',
                option_c: 'Updated Option C',
                option_d: 'Updated Option D'
            }

            const mockData = { id: 1, ...mockUpdates }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await MathPastPaperAdminService.updateMathPastPaper(1, mockUpdates)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('deleteMathPastPaper', () => {
        test('should successfully delete a math past paper question', async () => {
            const mockResponse = { error: null }

            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                delete: mockDelete
            })

            const result = await MathPastPaperAdminService.deleteMathPastPaper(1)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getAllMathPastPapers', () => {
        test('should successfully get all math past papers with user info', async () => {
            const mockData = [
                {
                    id: 1,
                    year: 2023,
                    question_no: 1,
                    correct_answer: 'A',
                    user_id: 'user123',
                    profiles: { id: 'user123', email: 'test@example.com', full_name: 'Test User' }
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await MathPastPaperAdminService.getAllMathPastPapers()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('bulkInsertMathPastPapers', () => {
        test('should successfully bulk insert math past paper questions', async () => {
            const mockQuestionsArray = [
                {
                    year: 2023,
                    question_no: 1,
                    correct_answer: 'A',
                    option_a: 'Option A',
                    option_b: 'Option B',
                    option_c: 'Option C',
                    option_d: 'Option D',
                    user_id: 'user123'
                }
            ]

            const mockData = mockQuestionsArray.map((q, index) => ({ id: index + 1, ...q }))
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await MathPastPaperAdminService.bulkInsertMathPastPapers(mockQuestionsArray)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getDetailedMathPastPaperStats', () => {
        test('should successfully get detailed math past paper statistics', async () => {
            const mockTotalQuestions = { count: 100 }
            const mockYearsData = { data: [{ year: 2023 }, { year: 2022 }] }
            const mockQuestionNumbersData = { data: [{ question_no: 1 }, { question_no: 2 }] }
            const mockUsersData = { data: [{ user_id: 'user123' }, { user_id: 'user456' }] }

            const mockFrom = jest.fn()
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockTotalQuestions) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockYearsData) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockQuestionNumbersData) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockUsersData) })

            supabase.from = mockFrom

            const result = await MathPastPaperAdminService.getDetailedMathPastPaperStats()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result.data).toEqual({
                totalQuestions: 100,
                totalYears: 2,
                totalQuestionNumbers: 2,
                totalContributors: 2,
                yearRange: {
                    min: 2022,
                    max: 2023
                },
                questionsPerYear: { 2023: 1, 2022: 1 },
                averageQuestionsPerYear: 50
            })
        })
    })
})