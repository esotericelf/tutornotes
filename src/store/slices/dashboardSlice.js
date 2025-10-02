import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import DashboardService from '../../services/dashboard/dashboardService'
import SimpleDashboardService from '../../services/dashboard/simpleDashboardService'

// Helper function to add timeout to async operations
const withTimeout = (promise, timeoutMs = 10000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        )
    ])
}

// Initial state
const initialState = {
    // User statistics
    userStats: {
        totalQuestionsAttempted: 0,
        totalCorrectAnswers: 0,
        averageScore: 0,
        progressScore: 0,
        papersCompleted: 0,
        favoriteTopics: [],
        recentActivity: []
    },

    // Dashboard data
    dashboardData: {
        quickStats: {
            progressScore: 0,
            papersCompleted: 0,
            discussionsParticipated: 0,
            favoriteTopics: 0
        },
        recentActivity: [],
        popularTags: [],
        recommendedPapers: [],
        upcomingDeadlines: []
    },

    // Loading states
    loading: {
        userStats: false,
        dashboardData: false,
        quickStats: false,
        recentActivity: false,
        popularTags: false,
        recommendedPapers: false
    },

    // Error states
    errors: {
        userStats: null,
        dashboardData: null,
        quickStats: null,
        recentActivity: null,
        popularTags: null,
        recommendedPapers: null
    },

    // UI state
    lastUpdated: null,
    refreshInterval: 300000, // 5 minutes
}

// Async thunks for dashboard operations
export const loadUserStatistics = createAsyncThunk(
    'dashboard/loadUserStatistics',
    async (userId, { rejectWithValue }) => {
        try {
            console.log('🔄 Loading user statistics for:', userId)

            // Try the main service first with timeout
            let result = await withTimeout(DashboardService.getUserStatistics(userId), 8000)

            // If it fails, use the simple service as fallback
            if (result.error) {
                console.log('⚠️ Main service failed, using simple service fallback')
                result = await withTimeout(SimpleDashboardService.getUserStatistics(userId), 5000)
            }

            if (result.error) {
                return rejectWithValue(result.error.message)
            }

            console.log('✅ User statistics loaded successfully')
            return result.data
        } catch (error) {
            console.error('❌ Error loading user statistics:', error)
            // If everything fails, return fallback data
            try {
                const fallbackResult = await SimpleDashboardService.getUserStatistics(userId)
                if (!fallbackResult.error) {
                    console.log('✅ Using fallback data for user statistics')
                    return fallbackResult.data
                }
            } catch (fallbackError) {
                console.error('❌ Even fallback failed:', fallbackError)
            }
            return rejectWithValue(error.message)
        }
    }
)

export const loadDashboardData = createAsyncThunk(
    'dashboard/loadDashboardData',
    async (userId, { rejectWithValue }) => {
        try {
            const result = await DashboardService.getDashboardData(userId)
            if (result.error) {
                return rejectWithValue(result.error.message)
            }
            return result.data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadQuickStats = createAsyncThunk(
    'dashboard/loadQuickStats',
    async (userId, { rejectWithValue }) => {
        try {
            console.log('🔄 Loading quick stats for:', userId)

            // Try the main service first
            let result = await DashboardService.getQuickStats(userId)

            // If it fails, use the simple service as fallback
            if (result.error) {
                console.log('⚠️ Main service failed, using simple service fallback')
                result = await SimpleDashboardService.getQuickStats(userId)
            }

            if (result.error) {
                return rejectWithValue(result.error.message)
            }

            console.log('✅ Quick stats loaded successfully')
            return result.data
        } catch (error) {
            console.error('❌ Error loading quick stats:', error)
            return rejectWithValue(error.message)
        }
    }
)

export const loadRecentActivity = createAsyncThunk(
    'dashboard/loadRecentActivity',
    async (userId, { rejectWithValue }) => {
        try {
            console.log('🔄 Loading recent activity for:', userId)

            // Try the main service first
            let result = await DashboardService.getRecentActivity(userId)

            // If it fails, use the simple service as fallback
            if (result.error) {
                console.log('⚠️ Main service failed, using simple service fallback')
                result = await SimpleDashboardService.getRecentActivity(userId)
            }

            if (result.error) {
                return rejectWithValue(result.error.message)
            }

            console.log('✅ Recent activity loaded successfully')
            return result.data
        } catch (error) {
            console.error('❌ Error loading recent activity:', error)
            return rejectWithValue(error.message)
        }
    }
)

export const loadPopularTags = createAsyncThunk(
    'dashboard/loadPopularTags',
    async (limit = 10, { rejectWithValue }) => {
        try {
            console.log('🔄 Loading popular tags, limit:', limit)

            // Try the main service first
            let result = await DashboardService.getPopularTags(limit)

            // If it fails, use the simple service as fallback
            if (result.error) {
                console.log('⚠️ Main service failed, using simple service fallback')
                result = await SimpleDashboardService.getPopularTags(limit)
            }

            if (result.error) {
                return rejectWithValue(result.error.message)
            }

            console.log('✅ Popular tags loaded successfully')
            return result.data
        } catch (error) {
            console.error('❌ Error loading popular tags:', error)
            return rejectWithValue(error.message)
        }
    }
)

export const loadRecommendedPapers = createAsyncThunk(
    'dashboard/loadRecommendedPapers',
    async (userId, { rejectWithValue }) => {
        try {
            const result = await DashboardService.getRecommendedPapers(userId)
            if (result.error) {
                return rejectWithValue(result.error.message)
            }
            return result.data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateUserProgress = createAsyncThunk(
    'dashboard/updateUserProgress',
    async ({ userId, progressData }, { rejectWithValue }) => {
        try {
            const result = await DashboardService.updateUserProgress(userId, progressData)
            if (result.error) {
                return rejectWithValue(result.error.message)
            }
            return result.data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const refreshDashboard = createAsyncThunk(
    'dashboard/refreshDashboard',
    async (userId, { rejectWithValue, dispatch }) => {
        try {
            // Load all dashboard data in parallel
            const results = await Promise.allSettled([
                DashboardService.getUserStatistics(userId),
                DashboardService.getQuickStats(userId),
                DashboardService.getRecentActivity(userId),
                DashboardService.getPopularTags(10),
                DashboardService.getRecommendedPapers(userId)
            ])

            const [userStats, quickStats, recentActivity, popularTags, recommendedPapers] = results

            return {
                userStats: userStats.status === 'fulfilled' ? userStats.value.data : null,
                quickStats: quickStats.status === 'fulfilled' ? quickStats.value.data : null,
                recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value.data : null,
                popularTags: popularTags.status === 'fulfilled' ? popularTags.value.data : null,
                recommendedPapers: recommendedPapers.status === 'fulfilled' ? recommendedPapers.value.data : null,
                errors: {
                    userStats: userStats.status === 'rejected' ? userStats.reason : null,
                    quickStats: quickStats.status === 'rejected' ? quickStats.reason : null,
                    recentActivity: recentActivity.status === 'rejected' ? recentActivity.reason : null,
                    popularTags: popularTags.status === 'rejected' ? popularTags.reason : null,
                    recommendedPapers: recommendedPapers.status === 'rejected' ? recommendedPapers.reason : null
                }
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Dashboard slice
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // Clear specific errors
        clearError: (state, action) => {
            const errorType = action.payload
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null
            }
        },

        // Clear all errors
        clearAllErrors: (state) => {
            state.errors = {
                userStats: null,
                dashboardData: null,
                quickStats: null,
                recentActivity: null,
                popularTags: null,
                recommendedPapers: null
            }
        },

        // Update refresh interval
        setRefreshInterval: (state, action) => {
            state.refreshInterval = action.payload
        },

        // Manual data updates
        updateQuickStats: (state, action) => {
            state.dashboardData.quickStats = { ...state.dashboardData.quickStats, ...action.payload }
        },

        addRecentActivity: (state, action) => {
            state.dashboardData.recentActivity.unshift(action.payload)
            // Keep only last 10 activities
            if (state.dashboardData.recentActivity.length > 10) {
                state.dashboardData.recentActivity = state.dashboardData.recentActivity.slice(0, 10)
            }
        },

        // Reset dashboard state
        resetDashboard: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Load user statistics
            .addCase(loadUserStatistics.pending, (state) => {
                state.loading.userStats = true
                state.errors.userStats = null
            })
            .addCase(loadUserStatistics.fulfilled, (state, action) => {
                state.loading.userStats = false
                state.userStats = action.payload
                state.errors.userStats = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(loadUserStatistics.rejected, (state, action) => {
                state.loading.userStats = false
                state.errors.userStats = action.payload
            })

            // Load dashboard data
            .addCase(loadDashboardData.pending, (state) => {
                state.loading.dashboardData = true
                state.errors.dashboardData = null
            })
            .addCase(loadDashboardData.fulfilled, (state, action) => {
                state.loading.dashboardData = false
                state.dashboardData = { ...state.dashboardData, ...action.payload }
                state.errors.dashboardData = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(loadDashboardData.rejected, (state, action) => {
                state.loading.dashboardData = false
                state.errors.dashboardData = action.payload
            })

            // Load quick stats
            .addCase(loadQuickStats.pending, (state) => {
                state.loading.quickStats = true
                state.errors.quickStats = null
            })
            .addCase(loadQuickStats.fulfilled, (state, action) => {
                state.loading.quickStats = false
                state.dashboardData.quickStats = action.payload
                state.errors.quickStats = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(loadQuickStats.rejected, (state, action) => {
                state.loading.quickStats = false
                state.errors.quickStats = action.payload
            })

            // Load recent activity
            .addCase(loadRecentActivity.pending, (state) => {
                state.loading.recentActivity = true
                state.errors.recentActivity = null
            })
            .addCase(loadRecentActivity.fulfilled, (state, action) => {
                state.loading.recentActivity = false
                state.dashboardData.recentActivity = action.payload
                state.errors.recentActivity = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(loadRecentActivity.rejected, (state, action) => {
                state.loading.recentActivity = false
                state.errors.recentActivity = action.payload
            })

            // Load popular tags
            .addCase(loadPopularTags.pending, (state) => {
                state.loading.popularTags = true
                state.errors.popularTags = null
            })
            .addCase(loadPopularTags.fulfilled, (state, action) => {
                state.loading.popularTags = false
                state.dashboardData.popularTags = action.payload
                state.errors.popularTags = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(loadPopularTags.rejected, (state, action) => {
                state.loading.popularTags = false
                state.errors.popularTags = action.payload
            })

            // Load recommended papers
            .addCase(loadRecommendedPapers.pending, (state) => {
                state.loading.recommendedPapers = true
                state.errors.recommendedPapers = null
            })
            .addCase(loadRecommendedPapers.fulfilled, (state, action) => {
                state.loading.recommendedPapers = false
                state.dashboardData.recommendedPapers = action.payload
                state.errors.recommendedPapers = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(loadRecommendedPapers.rejected, (state, action) => {
                state.loading.recommendedPapers = false
                state.errors.recommendedPapers = action.payload
            })

            // Update user progress
            .addCase(updateUserProgress.pending, (state) => {
                state.loading.userStats = true
                state.errors.userStats = null
            })
            .addCase(updateUserProgress.fulfilled, (state, action) => {
                state.loading.userStats = false
                state.userStats = { ...state.userStats, ...action.payload }
                state.errors.userStats = null
                state.lastUpdated = new Date().toISOString()
            })
            .addCase(updateUserProgress.rejected, (state, action) => {
                state.loading.userStats = false
                state.errors.userStats = action.payload
            })

            // Refresh dashboard
            .addCase(refreshDashboard.pending, (state) => {
                // Set all loading states to true
                Object.keys(state.loading).forEach(key => {
                    state.loading[key] = true
                })
                // Clear all errors
                Object.keys(state.errors).forEach(key => {
                    state.errors[key] = null
                })
            })
            .addCase(refreshDashboard.fulfilled, (state, action) => {
                const { userStats, quickStats, recentActivity, popularTags, recommendedPapers, errors } = action.payload

                // Update data
                if (userStats) state.userStats = userStats
                if (quickStats) state.dashboardData.quickStats = quickStats
                if (recentActivity) state.dashboardData.recentActivity = recentActivity
                if (popularTags) state.dashboardData.popularTags = popularTags
                if (recommendedPapers) state.dashboardData.recommendedPapers = recommendedPapers

                // Update errors
                state.errors = { ...state.errors, ...errors }

                // Set all loading states to false
                Object.keys(state.loading).forEach(key => {
                    state.loading[key] = false
                })

                state.lastUpdated = new Date().toISOString()
            })
            .addCase(refreshDashboard.rejected, (state, action) => {
                // Set all loading states to false
                Object.keys(state.loading).forEach(key => {
                    state.loading[key] = false
                })
                // Set a general error
                state.errors.dashboardData = action.payload
            })
    },
})

export const {
    clearError,
    clearAllErrors,
    setRefreshInterval,
    updateQuickStats,
    addRecentActivity,
    resetDashboard,
} = dashboardSlice.actions

export default dashboardSlice.reducer
