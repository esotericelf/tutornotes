/**
 * Simple Dashboard Service Tests
 * Tests for the fallback dashboard service functionality
 */

import SimpleDashboardService from '../simpleDashboardService'

describe('SimpleDashboardService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUserStatistics', () => {
        it('should return user statistics with fallback data', async () => {
            const userId = 'test-user-id'
            const result = await SimpleDashboardService.getUserStatistics(userId)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.totalQuestionsAttempted).toBe(0)
            expect(result.data.averageScore).toBe(0)
            expect(result.data.papersCompleted).toBe(0)
            expect(result.data.progressScore).toBe(0)
            expect(result.data.favoriteTopics).toEqual([])
            expect(result.data.recentActivity).toEqual([])
            expect(result.data.profile).toBeDefined()
        })

        it('should handle missing userId', async () => {
            const result = await SimpleDashboardService.getUserStatistics(null)

            expect(result.error).toBeDefined()
            expect(result.error.message).toBe('User ID is required')
            expect(result.data).toBeNull()
        })
    })

    describe('getQuickStats', () => {
        it('should return quick stats with fallback data', async () => {
            const userId = 'test-user-id'
            const result = await SimpleDashboardService.getQuickStats(userId)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.papersCompleted).toBe(0)
            expect(result.data.discussionsParticipated).toBe(0)
            expect(result.data.favoriteTopics).toBe(0)
            expect(result.data.quizAttempts).toBe(0)
        })
    })

    describe('getPopularTags', () => {
        it('should return popular tags with fallback data', async () => {
            const result = await SimpleDashboardService.getPopularTags(5)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.length).toBe(5)
            expect(result.data[0].tag).toBe('algebra')
            expect(result.data[0].count).toBe(25)
        })
    })

    describe('getRecentActivity', () => {
        it('should return empty recent activity', async () => {
            const userId = 'test-user-id'
            const result = await SimpleDashboardService.getRecentActivity(userId)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data).toEqual([])
        })
    })

    describe('getRecommendedPapers', () => {
        it('should return empty recommended papers', async () => {
            const userId = 'test-user-id'
            const result = await SimpleDashboardService.getRecommendedPapers(userId)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data).toEqual([])
        })
    })

    describe('updateUserProgress', () => {
        it('should return success for progress update', async () => {
            const userId = 'test-user-id'
            const progressData = { score: 85 }
            const result = await SimpleDashboardService.updateUserProgress(userId, progressData)

            expect(result.error).toBeNull()
            expect(result.data).toBeDefined()
            expect(result.data.success).toBe(true)
        })
    })
})
