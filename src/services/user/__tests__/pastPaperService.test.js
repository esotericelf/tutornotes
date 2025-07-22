import PastPaperService from '../pastPaperService'
import { supabase } from '../../supabase'

// Mock the supabase client
jest.mock('../../supabase')

describe('PastPaperService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getMathPastPapers', () => {
        test('should successfully get all math past papers', async () => {
            const mockData = [
                { id: 1, year: 2023, question_no: 1, correct_answer: 'A' },
                { id: 2, year: 2022, question_no: 1, correct_answer: 'B' }
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

            const result = await PastPaperService.getMathPastPapers()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })

        test('should handle error when getting math past papers', async () => {
            const mockError = new Error('Database error')
            const mockResponse = { data: null, error: mockError }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                    order: jest.fn().mockRejectedValue(mockError)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getMathPastPapers()

            expect(result).toEqual({
                data: null,
                error: mockError
            })
        })
    })

    describe('getMathPastPapersByYear', () => {
        test('should successfully get math past papers by year', async () => {
            const mockData = [
                { id: 1, year: 2023, question_no: 1, correct_answer: 'A' },
                { id: 2, year: 2023, question_no: 2, correct_answer: 'B' }
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

            const result = await PastPaperService.getMathPastPapersByYear(2023)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getMathPastPapersByQuestionNumber', () => {
        test('should successfully get math past papers by question number', async () => {
            const mockData = [
                { id: 1, year: 2023, question_no: 1, correct_answer: 'A' },
                { id: 2, year: 2022, question_no: 1, correct_answer: 'B' }
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

            const result = await PastPaperService.getMathPastPapersByQuestionNumber(1)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getMathPastPaperById', () => {
        test('should successfully get math past paper by ID', async () => {
            const mockData = { id: 1, year: 2023, question_no: 1, correct_answer: 'A' }
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getMathPastPaperById(1)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('searchMathPastPapers', () => {
        test('should successfully search math past papers', async () => {
            const mockData = [
                { id: 1, year: 2023, question_no: 1, correct_answer: 'Algebra' }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                or: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue(mockResponse)
                    })
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.searchMathPastPapers('Algebra')

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getAvailableYears', () => {
        test('should successfully get available years', async () => {
            const mockData = [
                { year: 2023 },
                { year: 2022 },
                { year: 2023 } // Duplicate to test unique filtering
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getAvailableYears()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('year')
            expect(result.data).toEqual([2023, 2022]) // Should be unique and sorted
        })
    })

    describe('getAvailableQuestionNumbers', () => {
        test('should successfully get available question numbers', async () => {
            const mockData = [
                { question_no: 1 },
                { question_no: 2 },
                { question_no: 1 } // Duplicate to test unique filtering
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getAvailableQuestionNumbers()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('question_no')
            expect(result.data).toEqual([1, 2]) // Should be unique and sorted
        })
    })

    describe('getQuestionsByYearAndNumber', () => {
        test('should successfully get questions by year and number', async () => {
            const mockData = [
                { id: 1, year: 2023, question_no: 1, correct_answer: 'A' }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getQuestionsByYearAndNumber(2023, 1)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getRandomQuestion', () => {
        test('should successfully get random question', async () => {
            const mockData = [{ id: 1, year: 2023, question_no: 1, correct_answer: 'A' }]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getRandomQuestion()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result.data).toEqual(mockData[0])
        })
    })

    describe('getQuestionsByYearRange', () => {
        test('should successfully get questions by year range', async () => {
            const mockData = [
                { id: 1, year: 2023, question_no: 1, correct_answer: 'A' },
                { id: 2, year: 2022, question_no: 1, correct_answer: 'B' }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                    lte: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue(mockResponse)
                        })
                    })
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await PastPaperService.getQuestionsByYearRange(2020, 2023)

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(mockSelect).toHaveBeenCalledWith('*')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getMathPastPaperStats', () => {
        test('should successfully get math past paper statistics', async () => {
            const mockTotalQuestions = { count: 100 }
            const mockYearsData = { data: [{ year: 2023 }, { year: 2022 }, { year: 2023 }] }
            const mockQuestionNumbersData = { data: [{ question_no: 1 }, { question_no: 2 }, { question_no: 1 }] }

            const mockFrom = jest.fn()
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockTotalQuestions) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockYearsData) })
                .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(mockQuestionNumbersData) })

            supabase.from = mockFrom

            const result = await PastPaperService.getMathPastPaperStats()

            expect(supabase.from).toHaveBeenCalledWith('Math_Past_Paper')
            expect(result.data).toEqual({
                totalQuestions: 100,
                totalYears: 2,
                totalQuestionNumbers: 2,
                yearRange: {
                    min: 2022,
                    max: 2023
                }
            })
        })
    })
})