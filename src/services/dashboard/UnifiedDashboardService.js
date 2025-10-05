/**
 * Unified Dashboard Service
 * Combines the functionality of DashboardService and SimpleDashboardService
 * Provides comprehensive dashboard data with fallback mechanisms
 */

import { supabase } from '../supabase'
import UnifiedTagService from '../mathpaper/UnifiedTagService'
import UnifiedAnalyticsService from '../mathpaper/UnifiedAnalyticsService'

class UnifiedDashboardService {
    /**
     * Get comprehensive user statistics with fallback
     * @param {string} userId - User ID
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getUserStatistics(userId) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            console.log('📊 UnifiedDashboardService: Getting user statistics for:', userId)

            // Try to get comprehensive statistics first
            try {
                const [profileResult, quizStats, pastPapers] = await Promise.allSettled([
                    this.getUserProfile(userId),
                    this.getQuizStatistics(userId),
                    this.getPastPaperProgress(userId)
                ])

                const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
                const quizData = quizStats.status === 'fulfilled' ? quizStats.value.data : []
                const papersData = pastPapers.status === 'fulfilled' ? pastPapers.value.data : []

                const statistics = {
                    totalQuestionsAttempted: quizData.length,
                    totalCorrectAnswers: quizData.reduce((sum, quiz) => sum + (quiz.score || 0), 0),
                    averageScore: quizData.length > 0 ? quizData.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / quizData.length : 0,
                    progressScore: this.calculateProgressScore(quizData, papersData),
                    papersCompleted: papersData.filter(paper => paper.completed_at).length,
                    favoriteTopics: await this.getFavoriteTopics(userId),
                    recentActivity: await this.getRecentActivityData(userId),
                    profile: profile || { id: userId, full_name: 'User', username: 'user' }
                }

                console.log('✅ UnifiedDashboardService: User statistics loaded')
                return { data: statistics, error: null }

            } catch (error) {
                console.log('⚠️ UnifiedDashboardService: Falling back to simple statistics')
                // Fallback to simple statistics
                return this.getSimpleStatistics(userId)
            }

        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error getting user statistics:', error)
            return { data: null, error }
        }
    }

    /**
     * Get dashboard data (quick stats, recent activity, etc.)
     * @param {string} userId - User ID
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getDashboardData(userId) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            console.log('📊 UnifiedDashboardService: Getting dashboard data for:', userId)

            const [quickStats, recentActivity, popularTags, recommendedPapers] = await Promise.allSettled([
                this.getQuickStats(userId),
                this.getRecentActivity(userId),
                this.getPopularTags(10),
                this.getRecommendedPapers(userId)
            ])

            const dashboardData = {
                quickStats: quickStats.status === 'fulfilled' ? quickStats.value.data : this.getFallbackQuickStats(),
                recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value.data : [],
                popularTags: popularTags.status === 'fulfilled' ? popularTags.value.data : [],
                recommendedPapers: recommendedPapers.status === 'fulfilled' ? recommendedPapers.value.data : []
            }

            console.log('✅ UnifiedDashboardService: Dashboard data loaded')
            return { data: dashboardData, error: null }

        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error getting dashboard data:', error)
            return { data: null, error }
        }
    }

    /**
     * Get quick statistics for dashboard
     * @param {string} userId - User ID
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getQuickStats(userId) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            const [quizStats, pastPapers, discussions] = await Promise.allSettled([
                this.getQuizStatistics(userId),
                this.getPastPaperProgress(userId),
                this.getDiscussionParticipation(userId)
            ])

            const quizData = quizStats.status === 'fulfilled' ? quizStats.value.data : []
            const papersData = pastPapers.status === 'fulfilled' ? pastPapers.value.data : []
            const discussionData = discussions.status === 'fulfilled' ? discussions.value.data : []

            const quickStats = {
                progressScore: this.calculateProgressScore(quizData, papersData),
                papersCompleted: papersData.filter(paper => paper.completed_at).length,
                discussionsParticipated: discussionData.length,
                favoriteTopics: (await this.getFavoriteTopics(userId)).length,
                quizAttempts: quizData.length
            }

            return { data: quickStats, error: null }

        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error getting quick stats:', error)
            return { data: this.getFallbackQuickStats(), error: null }
        }
    }

    /**
     * Get recent activity
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getRecentActivity(userId) {
        try {
            if (!userId) {
                return { data: [], error: new Error('User ID is required') }
            }

            const { data, error } = await supabase
                .from('quiz_attempts')
                .select('id, score, total_questions, created_at, quiz_type')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) {
                console.error('Error fetching recent activity:', error)
                return { data: [], error: null }
            }

            const activities = (data || []).map(attempt => ({
                id: attempt.id,
                type: 'quiz',
                title: `Quiz Attempt - Score: ${attempt.score}/${attempt.total_questions}`,
                timestamp: attempt.created_at,
                score: attempt.score,
                total: attempt.total_questions
            }))

            return { data: activities, error: null }

        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error getting recent activity:', error)
            return { data: [], error: null }
        }
    }

    /**
     * Get popular tags
     * @param {number} limit - Number of tags to return
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getPopularTags(limit = 10) {
        try {
            const result = await UnifiedTagService.getPopularTags(limit)
            return result
        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error getting popular tags:', error)
            return { data: [], error: null }
        }
    }

    /**
     * Get recommended papers
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getRecommendedPapers(userId) {
        try {
            if (!userId) {
                return { data: [], error: new Error('User ID is required') }
            }

            // Get user's favorite topics
            const favoriteTopics = await this.getFavoriteTopics(userId)

            if (favoriteTopics.length === 0) {
                return { data: [], error: null }
            }

            // Get papers related to favorite topics
            const result = await UnifiedTagService.getMathPapersByTags(favoriteTopics, 5)
            return result

        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error getting recommended papers:', error)
            return { data: [], error: null }
        }
    }

    /**
     * Update user progress
     * @param {string} userId - User ID
     * @param {Object} progressData - Progress data to update
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async updateUserProgress(userId, progressData) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            console.log('📊 UnifiedDashboardService: Updating user progress')

            // Update user statistics in database
            const { data, error } = await supabase
                .from('user_statistics')
                .upsert({
                    user_id: userId,
                    ...progressData,
                    updated_at: new Date().toISOString()
                })

            if (error) {
                console.error('Error updating user progress:', error)
                return { data: null, error }
            }

            return { data: { success: true }, error: null }

        } catch (error) {
            console.error('❌ UnifiedDashboardService: Error updating user progress:', error)
            return { data: null, error }
        }
    }

    // Helper methods
    static async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return { data: null, error }
        }

        return { data, error: null }
    }

    static async getQuizStatistics(userId) {
        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('score, total_questions, created_at')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching quiz stats:', error)
            return { data: [], error }
        }

        return { data: data || [], error: null }
    }

    static async getPastPaperProgress(userId) {
        const { data, error } = await supabase
            .from('user_past_papers')
            .select('progress, completed_at, paper_data')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching past papers:', error)
            return { data: [], error }
        }

        return { data: data || [], error: null }
    }

    static async getDiscussionParticipation(userId) {
        const { data, error } = await supabase
            .from('discussions')
            .select('id, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Error fetching discussions:', error)
            return { data: [], error }
        }

        return { data: data || [], error: null }
    }

    static async getFavoriteTopics(userId) {
        try {
            // Get user's most attempted topics from quiz data
            const { data: quizData } = await supabase
                .from('quiz_attempts')
                .select('quiz_data')
                .eq('user_id', userId)

            if (!quizData || quizData.length === 0) {
                return []
            }

            // Extract topics from quiz data (simplified)
            const topics = new Set()
            quizData.forEach(quiz => {
                if (quiz.quiz_data && quiz.quiz_data.topics) {
                    quiz.quiz_data.topics.forEach(topic => topics.add(topic))
                }
            })

            return Array.from(topics).slice(0, 5)
        } catch (error) {
            console.error('Error getting favorite topics:', error)
            return []
        }
    }

    static calculateProgressScore(quizStats, pastPapers) {
        try {
            let totalScore = 0
            let totalWeight = 0

            // Quiz performance (70% weight)
            if (quizStats && quizStats.length > 0) {
                const avgQuizScore = quizStats.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / quizStats.length
                totalScore += avgQuizScore * 0.7
                totalWeight += 0.7
            }

            // Paper completion (30% weight)
            if (pastPapers && pastPapers.length > 0) {
                const completedPapers = pastPapers.filter(paper => paper.completed_at).length
                const completionRate = completedPapers / pastPapers.length
                totalScore += completionRate * 100 * 0.3
                totalWeight += 0.3
            }

            return totalWeight > 0 ? totalScore / totalWeight : 0

        } catch (error) {
            console.error('Error calculating progress score:', error)
            return 0
        }
    }

    static async getRecentActivityData(userId) {
        try {
            const recentActivity = await this.getRecentActivity(userId)
            return recentActivity.data || []
        } catch (error) {
            console.error('Error getting recent activity data:', error)
            return []
        }
    }

    static getSimpleStatistics(userId) {
        return {
            data: {
                totalQuestionsAttempted: 0,
                totalCorrectAnswers: 0,
                averageScore: 0,
                progressScore: 0,
                papersCompleted: 0,
                favoriteTopics: [],
                recentActivity: [],
                profile: { id: userId, full_name: 'User', username: 'user' }
            },
            error: null
        }
    }

    static getFallbackQuickStats() {
        return {
            progressScore: 0,
            papersCompleted: 0,
            discussionsParticipated: 0,
            favoriteTopics: 0,
            quizAttempts: 0
        }
    }
}

export default UnifiedDashboardService
