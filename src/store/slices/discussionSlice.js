import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import DiscussionService from '../../services/discussion/discussionService'

// Initial state
const initialState = {
    // Discussions state
    discussions: [],
    currentQuestionDiscussions: [],
    loading: false,
    error: null,

    // Discussion form state
    newDiscussion: {
        content: '',
        questionId: null,
        parentId: null,
        isSubmitting: false,
    },

    // Pagination
    currentPage: 1,
    totalPages: 1,
    totalDiscussions: 0,

    // Filters and sorting
    sortBy: 'created_at',
    sortOrder: 'asc',
    filterBy: 'all', // all, questions, answers

    // Cache
    discussionsCache: {},
}

// Async thunks for discussion operations
export const loadDiscussionsByQuestion = createAsyncThunk(
    'discussion/loadDiscussionsByQuestion',
    async (questionId, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.getDiscussionsByQuestionId(questionId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadDiscussionsWithUsers = createAsyncThunk(
    'discussion/loadDiscussionsWithUsers',
    async (questionId, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.getDiscussionsWithUsers(questionId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const createDiscussion = createAsyncThunk(
    'discussion/createDiscussion',
    async (discussionData, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.createDiscussion(discussionData)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateDiscussion = createAsyncThunk(
    'discussion/updateDiscussion',
    async ({ discussionId, updates }, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.updateDiscussion(discussionId, updates)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const deleteDiscussion = createAsyncThunk(
    'discussion/deleteDiscussion',
    async (discussionId, { rejectWithValue }) => {
        try {
            const { error } = await DiscussionService.deleteDiscussion(discussionId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return discussionId
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const likeDiscussion = createAsyncThunk(
    'discussion/likeDiscussion',
    async ({ discussionId, userId }, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.likeDiscussion(discussionId, userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const unlikeDiscussion = createAsyncThunk(
    'discussion/unlikeDiscussion',
    async ({ discussionId, userId }, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.unlikeDiscussion(discussionId, userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const reportDiscussion = createAsyncThunk(
    'discussion/reportDiscussion',
    async ({ discussionId, reason, userId }, { rejectWithValue }) => {
        try {
            const { data, error } = await DiscussionService.reportDiscussion(discussionId, reason, userId)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Discussion slice
const discussionSlice = createSlice({
    name: 'discussion',
    initialState,
    reducers: {
        // Discussion form actions
        setNewDiscussionContent: (state, action) => {
            state.newDiscussion.content = action.payload
        },
        setNewDiscussionQuestionId: (state, action) => {
            state.newDiscussion.questionId = action.payload
        },
        setNewDiscussionParentId: (state, action) => {
            state.newDiscussion.parentId = action.payload
        },
        clearNewDiscussion: (state) => {
            state.newDiscussion = {
                content: '',
                questionId: null,
                parentId: null,
                isSubmitting: false,
            }
        },

        // Discussion list actions
        setDiscussions: (state, action) => {
            state.discussions = action.payload
        },
        addDiscussion: (state, action) => {
            state.discussions.push(action.payload)
        },
        updateDiscussionInList: (state, action) => {
            const { id, updates } = action.payload
            const index = state.discussions.findIndex(discussion => discussion.id === id)
            if (index !== -1) {
                state.discussions[index] = { ...state.discussions[index], ...updates }
            }
        },
        removeDiscussionFromList: (state, action) => {
            state.discussions = state.discussions.filter(discussion => discussion.id !== action.payload)
        },

        // Current question discussions
        setCurrentQuestionDiscussions: (state, action) => {
            state.currentQuestionDiscussions = action.payload
        },
        addCurrentQuestionDiscussion: (state, action) => {
            state.currentQuestionDiscussions.push(action.payload)
        },
        updateCurrentQuestionDiscussion: (state, action) => {
            const { id, updates } = action.payload
            const index = state.currentQuestionDiscussions.findIndex(discussion => discussion.id === id)
            if (index !== -1) {
                state.currentQuestionDiscussions[index] = { ...state.currentQuestionDiscussions[index], ...updates }
            }
        },
        removeCurrentQuestionDiscussion: (state, action) => {
            state.currentQuestionDiscussions = state.currentQuestionDiscussions.filter(discussion => discussion.id !== action.payload)
        },

        // Pagination actions
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setTotalPages: (state, action) => {
            state.totalPages = action.payload
        },
        setTotalDiscussions: (state, action) => {
            state.totalDiscussions = action.payload
        },

        // Filter and sort actions
        setSortBy: (state, action) => {
            state.sortBy = action.payload
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload
        },
        setFilterBy: (state, action) => {
            state.filterBy = action.payload
        },

        // Cache actions
        setDiscussionsCache: (state, action) => {
            state.discussionsCache = { ...state.discussionsCache, ...action.payload }
        },
        clearDiscussionsCache: (state) => {
            state.discussionsCache = {}
        },

        // Error handling
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },

        // Clear all discussions
        clearAllDiscussions: (state) => {
            return { ...initialState }
        },
    },
    extraReducers: (builder) => {
        builder
            // Load discussions by question
            .addCase(loadDiscussionsByQuestion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loadDiscussionsByQuestion.fulfilled, (state, action) => {
                state.currentQuestionDiscussions = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(loadDiscussionsByQuestion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Load discussions with users
            .addCase(loadDiscussionsWithUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loadDiscussionsWithUsers.fulfilled, (state, action) => {
                state.currentQuestionDiscussions = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(loadDiscussionsWithUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Create discussion
            .addCase(createDiscussion.pending, (state) => {
                state.newDiscussion.isSubmitting = true
                state.error = null
            })
            .addCase(createDiscussion.fulfilled, (state, action) => {
                state.currentQuestionDiscussions.push(action.payload)
                state.newDiscussion.isSubmitting = false
                state.newDiscussion.content = ''
                state.error = null
            })
            .addCase(createDiscussion.rejected, (state, action) => {
                state.newDiscussion.isSubmitting = false
                state.error = action.payload
            })

            // Update discussion
            .addCase(updateDiscussion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateDiscussion.fulfilled, (state, action) => {
                const updatedDiscussion = action.payload
                const index = state.currentQuestionDiscussions.findIndex(discussion => discussion.id === updatedDiscussion.id)
                if (index !== -1) {
                    state.currentQuestionDiscussions[index] = updatedDiscussion
                }
                state.loading = false
                state.error = null
            })
            .addCase(updateDiscussion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Delete discussion
            .addCase(deleteDiscussion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteDiscussion.fulfilled, (state, action) => {
                const deletedId = action.payload
                state.currentQuestionDiscussions = state.currentQuestionDiscussions.filter(discussion => discussion.id !== deletedId)
                state.loading = false
                state.error = null
            })
            .addCase(deleteDiscussion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Like discussion
            .addCase(likeDiscussion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(likeDiscussion.fulfilled, (state, action) => {
                const updatedDiscussion = action.payload
                const index = state.currentQuestionDiscussions.findIndex(discussion => discussion.id === updatedDiscussion.id)
                if (index !== -1) {
                    state.currentQuestionDiscussions[index] = updatedDiscussion
                }
                state.loading = false
                state.error = null
            })
            .addCase(likeDiscussion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Unlike discussion
            .addCase(unlikeDiscussion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(unlikeDiscussion.fulfilled, (state, action) => {
                const updatedDiscussion = action.payload
                const index = state.currentQuestionDiscussions.findIndex(discussion => discussion.id === updatedDiscussion.id)
                if (index !== -1) {
                    state.currentQuestionDiscussions[index] = updatedDiscussion
                }
                state.loading = false
                state.error = null
            })
            .addCase(unlikeDiscussion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Report discussion
            .addCase(reportDiscussion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(reportDiscussion.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
            })
            .addCase(reportDiscussion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const {
    setNewDiscussionContent,
    setNewDiscussionQuestionId,
    setNewDiscussionParentId,
    clearNewDiscussion,
    setDiscussions,
    addDiscussion,
    updateDiscussionInList,
    removeDiscussionFromList,
    setCurrentQuestionDiscussions,
    addCurrentQuestionDiscussion,
    updateCurrentQuestionDiscussion,
    removeCurrentQuestionDiscussion,
    setCurrentPage,
    setTotalPages,
    setTotalDiscussions,
    setSortBy,
    setSortOrder,
    setFilterBy,
    setDiscussionsCache,
    clearDiscussionsCache,
    setError,
    clearError,
    clearAllDiscussions,
} = discussionSlice.actions

export default discussionSlice.reducer
