import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ProfileService from '../../services/user/profileService'
import UserDataService from '../../services/user/userDataService'
import PastPaperService from '../../services/user/pastPaperService'

// Initial state
const initialState = {
    // Profile state
    profile: null,
    profileLoading: false,
    profileError: null,

    // User data state
    userData: null,
    userDataLoading: false,
    userDataError: null,

    // Past papers state
    pastPapers: [],
    pastPapersLoading: false,
    pastPapersError: null,

    // Statistics
    statistics: {
        totalQuestionsAttempted: 0,
        totalCorrectAnswers: 0,
        averageScore: 0,
        favoriteTopics: [],
        recentActivity: []
    },

    // Settings
    settings: {
        theme: 'light',
        notifications: true,
        autoSave: true,
        language: 'en'
    },

    // Loading and error states
    loading: false,
    error: null,
}

// Async thunks for user operations
export const loadProfile = createAsyncThunk(
    'user/loadProfile',
    async (userId, { rejectWithValue }) => {
        try {
            const { data, error } = await ProfileService.getProfile(userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async ({ userId, updates }, { rejectWithValue }) => {
        try {
            const { data, error } = await ProfileService.updateProfile(userId, updates)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadUserData = createAsyncThunk(
    'user/loadUserData',
    async (userId, { rejectWithValue }) => {
        try {
            const { data, error } = await UserDataService.getUserData(userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateUserData = createAsyncThunk(
    'user/updateUserData',
    async ({ userId, updates }, { rejectWithValue }) => {
        try {
            const { data, error } = await UserDataService.updateUserData(userId, updates)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadPastPapers = createAsyncThunk(
    'user/loadPastPapers',
    async (userId, { rejectWithValue }) => {
        try {
            const { data, error } = await PastPaperService.getUserPastPapers(userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const savePastPaperProgress = createAsyncThunk(
    'user/savePastPaperProgress',
    async ({ userId, paperData, progress }, { rejectWithValue }) => {
        try {
            const { data, error } = await PastPaperService.saveProgress(userId, paperData, progress)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadUserStatistics = createAsyncThunk(
    'user/loadUserStatistics',
    async (userId, { rejectWithValue }) => {
        try {
            const { data, error } = await UserDataService.getUserStatistics(userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Profile actions
        setProfile: (state, action) => {
            state.profile = action.payload
        },
        clearProfile: (state) => {
            state.profile = null
        },

        // User data actions
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        clearUserData: (state) => {
            state.userData = null
        },

        // Past papers actions
        setPastPapers: (state, action) => {
            state.pastPapers = action.payload
        },
        addPastPaper: (state, action) => {
            state.pastPapers.push(action.payload)
        },
        updatePastPaper: (state, action) => {
            const { id, updates } = action.payload
            const index = state.pastPapers.findIndex(paper => paper.id === id)
            if (index !== -1) {
                state.pastPapers[index] = { ...state.pastPapers[index], ...updates }
            }
        },
        removePastPaper: (state, action) => {
            state.pastPapers = state.pastPapers.filter(paper => paper.id !== action.payload)
        },

        // Statistics actions
        setStatistics: (state, action) => {
            state.statistics = action.payload
        },
        updateStatistics: (state, action) => {
            state.statistics = { ...state.statistics, ...action.payload }
        },

        // Settings actions
        setSettings: (state, action) => {
            state.settings = action.payload
        },
        updateSetting: (state, action) => {
            const { key, value } = action.payload
            state.settings[key] = value
        },

        // Error handling
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },

        // Clear all user data
        clearAllUserData: (state) => {
            return { ...initialState }
        },
    },
    extraReducers: (builder) => {
        builder
            // Load profile
            .addCase(loadProfile.pending, (state) => {
                state.profileLoading = true
                state.profileError = null
            })
            .addCase(loadProfile.fulfilled, (state, action) => {
                state.profile = action.payload
                state.profileLoading = false
                state.profileError = null
            })
            .addCase(loadProfile.rejected, (state, action) => {
                state.profileLoading = false
                state.profileError = action.payload
            })

            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.profileLoading = true
                state.profileError = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.profile = action.payload
                state.profileLoading = false
                state.profileError = null
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.profileLoading = false
                state.profileError = action.payload
            })

            // Load user data
            .addCase(loadUserData.pending, (state) => {
                state.userDataLoading = true
                state.userDataError = null
            })
            .addCase(loadUserData.fulfilled, (state, action) => {
                state.userData = action.payload
                state.userDataLoading = false
                state.userDataError = null
            })
            .addCase(loadUserData.rejected, (state, action) => {
                state.userDataLoading = false
                state.userDataError = action.payload
            })

            // Update user data
            .addCase(updateUserData.pending, (state) => {
                state.userDataLoading = true
                state.userDataError = null
            })
            .addCase(updateUserData.fulfilled, (state, action) => {
                state.userData = action.payload
                state.userDataLoading = false
                state.userDataError = null
            })
            .addCase(updateUserData.rejected, (state, action) => {
                state.userDataLoading = false
                state.userDataError = action.payload
            })

            // Load past papers
            .addCase(loadPastPapers.pending, (state) => {
                state.pastPapersLoading = true
                state.pastPapersError = null
            })
            .addCase(loadPastPapers.fulfilled, (state, action) => {
                state.pastPapers = action.payload
                state.pastPapersLoading = false
                state.pastPapersError = null
            })
            .addCase(loadPastPapers.rejected, (state, action) => {
                state.pastPapersLoading = false
                state.pastPapersError = action.payload
            })

            // Save past paper progress
            .addCase(savePastPaperProgress.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(savePastPaperProgress.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                // Update the specific past paper in the list
                const updatedPaper = action.payload
                const index = state.pastPapers.findIndex(paper => paper.id === updatedPaper.id)
                if (index !== -1) {
                    state.pastPapers[index] = updatedPaper
                }
            })
            .addCase(savePastPaperProgress.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Load user statistics
            .addCase(loadUserStatistics.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loadUserStatistics.fulfilled, (state, action) => {
                state.statistics = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(loadUserStatistics.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const {
    setProfile,
    clearProfile,
    setUserData,
    clearUserData,
    setPastPapers,
    addPastPaper,
    updatePastPaper,
    removePastPaper,
    setStatistics,
    updateStatistics,
    setSettings,
    updateSetting,
    setError,
    clearError,
    clearAllUserData,
} = userSlice.actions

export default userSlice.reducer
