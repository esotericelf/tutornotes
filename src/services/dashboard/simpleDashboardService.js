/**
 * Simple Dashboard Service
 * A fallback service that provides basic dashboard functionality
 * without complex database queries that might be failing
 */

import { supabase } from '../supabase'

class SimpleDashboardService {
    /**
     * Get basic user statistics with fallback data
     * @param {string} userId - User ID
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getUserStatistics(userId) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            console.log('📊 SimpleDashboardService: Getting user statistics for:', userId)

            // Try to get basic profile info
            let profile = null
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, username')
                    .eq('id', userId)
                    .single()

                if (!error && data) {
                    profile = data
                }
            } catch (err) {
                console.log('Profile not found, using fallback data')
            }

            // Return basic statistics with fallback data
            const statistics = {
                totalQuestionsAttempted: 0,
                totalCorrectAnswers: 0,
                averageScore: 0,
                progressScore: 0,
                papersCompleted: 0,
                favoriteTopics: [],
                recentActivity: [],
                profile: profile || { id: userId, full_name: 'User', username: 'user' }
            }

            console.log('✅ SimpleDashboardService: User statistics loaded (fallback)')
            return { data: statistics, error: null }

        } catch (error) {
            console.error('❌ SimpleDashboardService: Error getting user statistics:', error)
            return { data: null, error }
        }
    }

    /**
     * Get quick stats with fallback data
     * @param {string} userId - User ID
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getQuickStats(userId) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            const quickStats = {
                progressScore: 0,
                papersCompleted: 0,
                discussionsParticipated: 0,
                favoriteTopics: 0,
                quizAttempts: 0
            }

            return { data: quickStats, error: null }

        } catch (error) {
            console.error('❌ SimpleDashboardService: Error getting quick stats:', error)
            return { data: null, error }
        }
    }

    /**
     * Get recent activity with fallback data
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getRecentActivity(userId) {
        try {
            if (!userId) {
                return { data: [], error: new Error('User ID is required') }
            }

            // Return empty array for now
            const activities = []

            return { data: activities, error: null }

        } catch (error) {
            console.error('❌ SimpleDashboardService: Error getting recent activity:', error)
            return { data: [], error }
        }
    }

    /**
     * Get popular tags with fallback data
     * @param {number} limit - Number of tags to return
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getPopularTags(limit = 10) {
        try {
            // Return some basic fallback tags
            const popularTags = [
                { tag: 'algebra', count: 25, topic: 'General' },
                { tag: 'geometry', count: 20, topic: 'General' },
                { tag: 'calculus', count: 18, topic: 'General' },
                { tag: 'statistics', count: 15, topic: 'General' },
                { tag: 'trigonometry', count: 12, topic: 'General' }
            ].slice(0, limit)

            return { data: popularTags, error: null }

        } catch (error) {
            console.error('❌ SimpleDashboardService: Error getting popular tags:', error)
            return { data: [], error }
        }
    }

    /**
     * Get recommended papers with fallback data
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getRecommendedPapers(userId) {
        try {
            if (!userId) {
                return { data: [], error: new Error('User ID is required') }
            }

            // Return empty array for now
            const recommendedPapers = []

            return { data: recommendedPapers, error: null }

        } catch (error) {
            console.error('❌ SimpleDashboardService: Error getting recommended papers:', error)
            return { data: [], error }
        }
    }

    /**
     * Update user progress (placeholder)
     * @param {string} userId - User ID
     * @param {Object} progressData - Progress data to update
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async updateUserProgress(userId, progressData) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            console.log('📊 SimpleDashboardService: Updating user progress (placeholder)')
            return { data: { success: true }, error: null }

        } catch (error) {
            console.error('❌ SimpleDashboardService: Error updating user progress:', error)
            return { data: null, error }
        }
    }
}

export default SimpleDashboardService
