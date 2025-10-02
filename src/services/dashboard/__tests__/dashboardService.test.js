/**
 * Dashboard Service Tests
 * Tests for the dashboard service functionality
 */

import DashboardService from '../dashboardService'

// Mock Supabase
jest.mock('../../supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: { id: 'test-user', full_name: 'Test User' },
                        error: null
                    }))
                })),
                order: jest.fn(() => ({
                    limit: jest.fn(() => ({
                        data: [
                            { id: 1, score: 85, total_questions: 10, created_at: '2024-01-01' },
                            { id: 2, score: 90, total_questions: 15, created_at: '2024-01-02' }
                        ],
                        error: null
                    }))
                }))
            }))
        })),
        rpc: jest.fn(() => ({
            data: [
                { tag: 'algebra', count: 25 },
                { tag: 'geometry', count: 20 }
            ],
            error: null
        }))
    }
}))

// Mock other services
jest.mock('../../mathpaper/UnifiedTagService', () => ({
    getPopularTags: jest.fn(() => ({
        data: [
            { tag: 'algebra', count: 25, topic: 'General' },
            { tag: 'geometry', count: 20, topic: 'General' }
        ],
        error: null
    }))
}))

describe('DashboardService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUserStatistics', () => {
        it('should return user statistics successfully', async () => {
            const userId = 'test-user-id'
            const result = await DashboardService.getUserStatistics(userId)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.totalQuestionsAttempted).toBe(25) // 10 + 15
            expect(result.data.averageScore).toBe(87.5) // (85 + 90) / 2
            expect(result.data.papersCompleted).toBe(0)
            expect(result.data.progressScore).toBeDefined()
        })

        it('should handle missing userId', async () => {
            const result = await DashboardService.getUserStatistics(null)

            expect(result.error).toBeDefined()
            expect(result.error.message).toBe('User ID is required')
            expect(result.data).toBeNull()
        })
    })

    describe('getQuickStats', () => {
        it('should return quick stats successfully', async () => {
            const userId = 'test-user-id'
            const result = await DashboardService.getQuickStats(userId)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.papersCompleted).toBeDefined()
            expect(result.data.discussionsParticipated).toBeDefined()
            expect(result.data.favoriteTopics).toBeDefined()
        })
    })

    describe('getPopularTags', () => {
        it('should return popular tags successfully', async () => {
            const result = await DashboardService.getPopularTags(10)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.length).toBe(2)
            expect(result.data[0].tag).toBe('algebra')
            expect(result.data[0].count).toBe(25)
        })
    })

    describe('calculateProgressScore', () => {
        it('should calculate progress score correctly', () => {
            const quizStats = [
                { score: 80, total_questions: 10 },
                { score: 90, total_questions: 15 }
            ]
            const pastPapers = [
                { completed_at: '2024-01-01' },
                { completed_at: null }
            ]

            const score = DashboardService.calculateProgressScore(quizStats, pastPapers)

            // Expected: (80 + 90) / 2 * 0.7 + (1/2) * 100 * 0.3 = 85 * 0.7 + 50 * 0.3 = 59.5 + 15 = 74.5
            expect(score).toBeCloseTo(74.5, 1)
        })

        it('should handle empty data', () => {
            const score = DashboardService.calculateProgressScore([], [])
            expect(score).toBe(0)
        })
    })
})
