/**
 * Dashboard Service
 * Handles all dashboard-related data fetching and operations
 * Integrates with Supabase functions for user statistics and analytics
 */

import { supabase } from '../supabase'
import UnifiedTagService from '../mathpaper/UnifiedTagService'
import UnifiedAnalyticsService from '../mathpaper/UnifiedAnalyticsService'

class DashboardService {
    /**
     * Get comprehensive user statistics
     * @param {string} userId - User ID
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getUserStatistics(userId) {
        try {
            if (!userId) {
                return { data: null, error: new Error('User ID is required') }
            }

            console.log('📊 DashboardService: Getting user statistics for:', userId)

            // Get user profile and basic stats
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (profileError) {
                console.error('Error fetching profile:', profileError)
                // Don't return error for missing profile, just use null
            }

            // Get quiz statistics
            const { data: quizStats, error: quizError } = await supabase
                .from('quiz_attempts')
                .select('score, total_questions, created_at')
                .eq('user_id', userId)

            if (quizError) {
                console.error('Error fetching quiz stats:', quizError)
                // Continue with empty array
            }

            // Get past paper progress
            const { data: pastPapers, error: papersError } = await supabase
                .from('user_past_papers')
                .select('progress, completed_at, paper_data')
                .eq('user_id', userId)

            if (papersError) {
                console.error('Error fetching past papers:', papersError)
                // Continue with empty array
            }

            // Calculate statistics
            const totalQuestionsAttempted = quizStats?.reduce((sum, attempt) => sum + (attempt.total_questions || 0), 0) || 0
            const totalCorrectAnswers = quizStats?.reduce((sum, attempt) => {
                const score = attempt.score || 0
                const total = attempt.total_questions || 1
                return sum + Math.round((score / 100) * total)
            }, 0) || 0
            const averageScore = quizStats?.length > 0
                ? quizStats.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / quizStats.length
                : 0
            const papersCompleted = pastPapers?.filter(paper => paper.completed_at).length || 0

            // Calculate progress score (weighted average of quiz scores and paper completion)
            const progressScore = this.calculateProgressScore(quizStats, pastPapers)

            // Get favorite topics from quiz attempts and past papers
            const favoriteTopics = await this.getFavoriteTopics(userId)

            // Get recent activity
            const recentActivity = await this.getRecentActivityData(userId)

            const statistics = {
                totalQuestionsAttempted,
                totalCorrectAnswers,
                averageScore: Math.round(averageScore * 100) / 100,
                progressScore: Math.round(progressScore * 100) / 100,
                papersCompleted,
                favoriteTopics,
                recentActivity,
                profile: profile
            }

            console.log('✅ DashboardService: User statistics loaded:', statistics)
            return { data: statistics, error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error getting user statistics:', error)
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

            console.log('📊 DashboardService: Getting dashboard data for:', userId)

            const [quickStats, recentActivity, popularTags, recommendedPapers] = await Promise.allSettled([
                this.getQuickStats(userId),
                this.getRecentActivity(userId),
                this.getPopularTags(10),
                this.getRecommendedPapers(userId)
            ])

            const dashboardData = {
                quickStats: quickStats.status === 'fulfilled' ? quickStats.value.data : null,
                recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value.data : [],
                popularTags: popularTags.status === 'fulfilled' ? popularTags.value.data : [],
                recommendedPapers: recommendedPapers.status === 'fulfilled' ? recommendedPapers.value.data : []
            }

            console.log('✅ DashboardService: Dashboard data loaded')
            return { data: dashboardData, error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error getting dashboard data:', error)
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

            // Get quiz attempts count
            const { count: quizAttempts, error: quizError } = await supabase
                .from('quiz_attempts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)

            if (quizError) {
                console.error('Error fetching quiz attempts count:', quizError)
            }

            // Get completed papers count
            const { count: completedPapers, error: papersError } = await supabase
                .from('user_past_papers')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .not('completed_at', 'is', null)

            if (papersError) {
                console.error('Error fetching completed papers count:', papersError)
            }

            // Get discussions participated count
            const { count: discussions, error: discussionsError } = await supabase
                .from('discussions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)

            if (discussionsError) {
                console.error('Error fetching discussions count:', discussionsError)
            }

            // Get favorite topics count
            const favoriteTopics = await this.getFavoriteTopics(userId)

            const quickStats = {
                progressScore: 0, // Will be calculated in getUserStatistics
                papersCompleted: completedPapers || 0,
                discussionsParticipated: discussions || 0,
                favoriteTopics: favoriteTopics.length,
                quizAttempts: quizAttempts || 0
            }

            return { data: quickStats, error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error getting quick stats:', error)
            return { data: null, error }
        }
    }

    /**
     * Get recent activity for user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getRecentActivity(userId) {
        try {
            if (!userId) {
                return { data: [], error: new Error('User ID is required') }
            }

            console.log('📊 DashboardService: Getting recent activity for:', userId)

            // Get recent quiz attempts
            const { data: recentQuizzes, error: quizError } = await supabase
                .from('quiz_attempts')
                .select('id, score, total_questions, created_at, quiz_type')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (quizError) {
                console.error('Error fetching recent quizzes:', quizError)
            }

            // Get recent past paper activities
            const { data: recentPapers, error: papersError } = await supabase
                .from('user_past_papers')
                .select('id, progress, updated_at, paper_data')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(5)

            if (papersError) {
                console.error('Error fetching recent papers:', papersError)
            }

            // Get recent discussions
            const { data: recentDiscussions, error: discussionsError } = await supabase
                .from('discussions')
                .select('id, title, created_at, topic')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (discussionsError) {
                console.error('Error fetching recent discussions:', discussionsError)
            }

            // Combine and format activities
            const activities = []

            // Add quiz activities
            if (recentQuizzes) {
                recentQuizzes.forEach(quiz => {
                    activities.push({
                        id: `quiz_${quiz.id}`,
                        type: 'quiz',
                        title: `Completed ${quiz.quiz_type || 'Quiz'}`,
                        description: `Score: ${quiz.score}% (${quiz.total_questions} questions)`,
                        timestamp: quiz.created_at,
                        data: quiz
                    })
                })
            }

            // Add paper activities
            if (recentPapers) {
                recentPapers.forEach(paper => {
                    const paperData = paper.paper_data || {}
                    activities.push({
                        id: `paper_${paper.id}`,
                        type: 'paper',
                        title: `Progress on ${paperData.year || 'Paper'} ${paperData.paper || ''}`,
                        description: `Progress: ${paper.progress}%`,
                        timestamp: paper.updated_at,
                        data: paper
                    })
                })
            }

            // Add discussion activities
            if (recentDiscussions) {
                recentDiscussions.forEach(discussion => {
                    activities.push({
                        id: `discussion_${discussion.id}`,
                        type: 'discussion',
                        title: `Started discussion: ${discussion.title}`,
                        description: `Topic: ${discussion.topic || 'General'}`,
                        timestamp: discussion.created_at,
                        data: discussion
                    })
                })
            }

            // Sort by timestamp and limit to 10
            const sortedActivities = activities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)

            console.log('✅ DashboardService: Recent activity loaded:', sortedActivities.length, 'activities')
            return { data: sortedActivities, error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error getting recent activity:', error)
            return { data: [], error }
        }
    }

    /**
     * Get popular tags for dashboard
     * @param {number} limit - Number of tags to return
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getPopularTags(limit = 10) {
        try {
            console.log('📊 DashboardService: Getting popular tags, limit:', limit)

            const result = await UnifiedTagService.getPopularTags(limit)

            if (result.error) {
                return { data: [], error: result.error }
            }

            // Transform to dashboard format
            const popularTags = result.data.map(tag => ({
                tag: tag.tag,
                count: tag.count,
                topic: tag.topic || 'General'
            }))

            console.log('✅ DashboardService: Popular tags loaded:', popularTags.length, 'tags')
            return { data: popularTags, error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error getting popular tags:', error)
            return { data: [], error }
        }
    }

    /**
     * Get recommended papers for user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getRecommendedPapers(userId) {
        try {
            if (!userId) {
                return { data: [], error: new Error('User ID is required') }
            }

            console.log('📊 DashboardService: Getting recommended papers for:', userId)

            // Get user's favorite topics
            const favoriteTopics = await this.getFavoriteTopics(userId)

            if (favoriteTopics.length === 0) {
                // If no favorite topics, get general popular papers
                const { data: generalPapers, error } = await supabase
                    .from('math_papers')
                    .select('id, year, paper, question_no, tags, difficulty')
                    .order('year', { ascending: false })
                    .limit(5)

                if (error) {
                    console.error('Error fetching general papers:', error)
                    return { data: [], error }
                }

                return { data: generalPapers || [], error: null }
            }

            // Get papers related to favorite topics
            const { data: recommendedPapers, error } = await supabase
                .from('math_papers')
                .select('id, year, paper, question_no, tags, difficulty')
                .contains('tags', favoriteTopics.slice(0, 3)) // Use top 3 favorite topics
                .order('year', { ascending: false })
                .limit(5)

            if (error) {
                console.error('Error fetching recommended papers:', error)
                return { data: [], error }
            }

            console.log('✅ DashboardService: Recommended papers loaded:', recommendedPapers?.length || 0, 'papers')
            return { data: recommendedPapers || [], error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error getting recommended papers:', error)
            return { data: [], error }
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

            console.log('📊 DashboardService: Updating user progress for:', userId, progressData)

            // Update user data table
            const { data, error } = await supabase
                .from('user_data')
                .upsert({
                    user_id: userId,
                    ...progressData,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) {
                console.error('Error updating user progress:', error)
                return { data: null, error }
            }

            console.log('✅ DashboardService: User progress updated')
            return { data, error: null }

        } catch (error) {
            console.error('❌ DashboardService: Error updating user progress:', error)
            return { data: null, error }
        }
    }

    /**
     * Get favorite topics for user
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    static async getFavoriteTopics(userId) {
        try {
            // Get tags from quiz attempts
            const { data: quizTags, error: quizError } = await supabase
                .from('quiz_attempts')
                .select('quiz_data')
                .eq('user_id', userId)
                .not('quiz_data', 'is', null)

            if (quizError) {
                console.error('Error fetching quiz tags:', quizError)
            }

            // Get tags from past papers
            const { data: paperTags, error: paperError } = await supabase
                .from('user_past_papers')
                .select('paper_data')
                .eq('user_id', userId)
                .not('paper_data', 'is', null)

            if (paperError) {
                console.error('Error fetching paper tags:', paperError)
            }

            // Extract and count tags
            const tagCounts = {}

            if (quizTags) {
                quizTags.forEach(attempt => {
                    const tags = attempt.quiz_data?.tags || []
                    tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1
                    })
                })
            }

            if (paperTags) {
                paperTags.forEach(paper => {
                    const tags = paper.paper_data?.tags || []
                    tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1
                    })
                })
            }

            // Sort by count and return top 5
            const favoriteTopics = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([tag]) => tag)

            return favoriteTopics

        } catch (error) {
            console.error('Error getting favorite topics:', error)
            return []
        }
    }

    /**
     * Calculate progress score based on quiz and paper performance
     * @param {Array} quizStats - Quiz statistics
     * @param {Array} pastPapers - Past paper data
     * @returns {number} Progress score (0-100)
     */
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

    /**
     * Get recent activity data for statistics
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    static async getRecentActivityData(userId) {
        try {
            const recentActivity = await this.getRecentActivity(userId)
            return recentActivity.data || []
        } catch (error) {
            console.error('Error getting recent activity data:', error)
            return []
        }
    }
}

export default DashboardService
