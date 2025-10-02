import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { UnifiedTagService, UnifiedQuestionService } from '../../services/mathpaper'

// Initial state
const initialState = {
    // Filter states
    selectedYear: '',
    selectedPaper: '',
    selectedQuestionNo: '',

    // Search states
    searchTags: [],
    availableTags: [],
    searchInput: '',

    // Data states
    questions: [],
    selectedQuestion: null,
    loading: false,
    error: '',
    questionTags: {},
    popularTags: [],
    isTagSearchActive: false,

    // Navigation state for back button functionality
    cameFromTagSearch: false,
    originalSearchTags: [],
    originalSearchPage: 1,

    // Pagination
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,

    // Cache
    questionsCache: {},
    tagsCache: {},
}

// Async thunks for math paper operations
export const loadPopularTags = createAsyncThunk(
    'mathPaper/loadPopularTags',
    async (limit = 15, { rejectWithValue }) => {
        try {
            console.log('🔍 Redux thunk: loadPopularTags called with limit:', limit);
            const { data, error } = await UnifiedTagService.getPopularTags(limit)
            console.log('🔍 Redux thunk: loadPopularTags result:', { data: data?.length || 0, error });
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            console.error('🔍 Redux thunk: loadPopularTags error:', error);
            return rejectWithValue(error.message)
        }
    }
)

export const searchTagsAutocomplete = createAsyncThunk(
    'mathPaper/searchTagsAutocomplete',
    async ({ searchTerm, limit = 20 }, { rejectWithValue }) => {
        try {
            const { data, error } = await UnifiedTagService.searchTagsAutocomplete(searchTerm, limit)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const getMathPapersByTags = createAsyncThunk(
    'mathPaper/getMathPapersByTags',
    async ({ tags, limit = 100, sortBy = 'year', sortAsc = false }, { rejectWithValue }) => {
        try {
            console.log('🔍 Redux: Calling UnifiedTagService.getMathPapersByTags with:', { tags, limit, sortBy, sortAsc });
            const result = await UnifiedTagService.getMathPapersByTags(tags, limit, sortBy, sortAsc);
            console.log('🔍 Redux: UnifiedTagService result:', result);

            if (result.error) {
                console.error('🔍 Redux: Error from UnifiedTagService:', result.error);
                return rejectWithValue(result.error.message || result.error);
            }

            console.log('🔍 Redux: Returning data:', result.data);
            return result.data;
        } catch (error) {
            console.error('🔍 Redux: Exception in getMathPapersByTags:', error);
            return rejectWithValue(error.message || error);
        }
    }
)

export const getMathPapersByExactTags = createAsyncThunk(
    'mathPaper/getMathPapersByExactTags',
    async ({ tags, limit = 100 }, { rejectWithValue }) => {
        try {
            const { data, error } = await UnifiedTagService.getMathPapersByExactTags(tags, limit)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const getMathPapersByTagsAdvanced = createAsyncThunk(
    'mathPaper/getMathPapersByTagsAdvanced',
    async ({ tags, matchType = 'OR', limit = 100, sortBy = 'year', sortAsc = false }, { rejectWithValue }) => {
        try {
            const { data, error } = await UnifiedTagService.getMathPapersByTagsAdvanced(tags, matchType, limit, sortBy, sortAsc)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadQuestion = createAsyncThunk(
    'mathPaper/loadQuestion',
    async ({ year, paper, questionNo }, { rejectWithValue }) => {
        try {
            const { data, error } = await UnifiedQuestionService.loadQuestion(year, paper, questionNo)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadQuestionsByFilters = createAsyncThunk(
    'mathPaper/loadQuestionsByFilters',
    async ({ year, paper, questionNo }, { rejectWithValue }) => {
        try {
            console.log('🔍 Redux thunk: loadQuestionsByFilters called with:', { year, paper, questionNo });
            const { data, error } = await UnifiedQuestionService.loadQuestionsByYearAndPaper(year, paper, questionNo)
            console.log('🔍 Redux thunk: loadQuestionsByFilters result:', { data: data?.length || 0, error });
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            console.error('🔍 Redux thunk: loadQuestionsByFilters error:', error);
            return rejectWithValue(error.message)
        }
    }
)

export const getQuestionNavigation = createAsyncThunk(
    'mathPaper/getQuestionNavigation',
    async ({ year, paper, questionNo }, { rejectWithValue }) => {
        try {
            const { data, error } = await UnifiedQuestionService.getQuestionNavigation(year, paper, questionNo)
            if (error) {
                return rejectWithValue(error.message)
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Math paper slice
const mathPaperSlice = createSlice({
    name: 'mathPaper',
    initialState,
    reducers: {
        // Filter actions
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload
        },
        setSelectedPaper: (state, action) => {
            state.selectedPaper = action.payload
        },
        setSelectedQuestionNo: (state, action) => {
            state.selectedQuestionNo = action.payload
        },

        // Search actions
        setSearchTags: (state, action) => {
            state.searchTags = action.payload
        },
        addSearchTag: (state, action) => {
            if (!state.searchTags.includes(action.payload)) {
                state.searchTags.push(action.payload)
            }
        },
        removeSearchTag: (state, action) => {
            state.searchTags = state.searchTags.filter(tag => tag !== action.payload)
        },
        clearSearchTags: (state) => {
            state.searchTags = []
        },
        setSearchInput: (state, action) => {
            state.searchInput = action.payload
        },

        // Question actions
        setSelectedQuestion: (state, action) => {
            state.selectedQuestion = action.payload
        },
        setQuestions: (state, action) => {
            state.questions = action.payload
        },
        setQuestionTags: (state, action) => {
            state.questionTags = action.payload
        },

        // Navigation actions
        setCameFromTagSearch: (state, action) => {
            state.cameFromTagSearch = action.payload
        },
        setOriginalSearchTags: (state, action) => {
            state.originalSearchTags = action.payload
        },
        setOriginalSearchPage: (state, action) => {
            state.originalSearchPage = action.payload
        },

        // UI actions
        setIsTagSearchActive: (state, action) => {
            state.isTagSearchActive = action.payload
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setTotalPages: (state, action) => {
            state.totalPages = action.payload
        },
        setTotalQuestions: (state, action) => {
            state.totalQuestions = action.payload
        },

        // Cache actions
        setQuestionsCache: (state, action) => {
            state.questionsCache = { ...state.questionsCache, ...action.payload }
        },
        setTagsCache: (state, action) => {
            state.tagsCache = { ...state.tagsCache, ...action.payload }
        },

        // Clear actions
        clearError: (state) => {
            state.error = ''
        },
        clearAll: (state) => {
            return { ...initialState }
        },
        clearSearch: (state) => {
            state.searchTags = []
            state.searchInput = ''
            state.isTagSearchActive = false
            state.questions = []
            state.selectedQuestion = null
            state.currentPage = 1
            state.totalPages = 1
            state.totalQuestions = 0
        },

        // Additional actions for compatibility
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setAvailableTags: (state, action) => {
            state.availableTags = action.payload
        },
        setPopularTags: (state, action) => {
            state.popularTags = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Load popular tags
            .addCase(loadPopularTags.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(loadPopularTags.fulfilled, (state, action) => {
                state.popularTags = action.payload
                state.loading = false
                state.error = ''
            })
            .addCase(loadPopularTags.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Search tags autocomplete
            .addCase(searchTagsAutocomplete.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(searchTagsAutocomplete.fulfilled, (state, action) => {
                state.availableTags = action.payload
                state.loading = false
                state.error = ''
            })
            .addCase(searchTagsAutocomplete.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Get math papers by tags
            .addCase(getMathPapersByTags.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(getMathPapersByTags.fulfilled, (state, action) => {
                state.questions = action.payload
                state.isTagSearchActive = true
                state.loading = false
                state.error = ''
            })
            .addCase(getMathPapersByTags.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Get math papers by exact tags
            .addCase(getMathPapersByExactTags.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(getMathPapersByExactTags.fulfilled, (state, action) => {
                state.questions = action.payload
                state.isTagSearchActive = true
                state.loading = false
                state.error = ''
            })
            .addCase(getMathPapersByExactTags.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Get math papers by tags advanced
            .addCase(getMathPapersByTagsAdvanced.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(getMathPapersByTagsAdvanced.fulfilled, (state, action) => {
                state.questions = action.payload
                state.isTagSearchActive = true
                state.loading = false
                state.error = ''
            })
            .addCase(getMathPapersByTagsAdvanced.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Load question
            .addCase(loadQuestion.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(loadQuestion.fulfilled, (state, action) => {
                state.selectedQuestion = action.payload
                state.loading = false
                state.error = ''
            })
            .addCase(loadQuestion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Load questions by filters
            .addCase(loadQuestionsByFilters.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(loadQuestionsByFilters.fulfilled, (state, action) => {
                console.log('🔍 Redux slice: loadQuestionsByFilters.fulfilled', { payload: action.payload });
                state.questions = action.payload
                state.totalQuestions = action.payload ? action.payload.length : 0
                state.loading = false
                state.error = ''
                console.log('🔍 Redux slice: Updated state', { questions: state.questions.length, totalQuestions: state.totalQuestions });
            })
            .addCase(loadQuestionsByFilters.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Get question navigation
            .addCase(getQuestionNavigation.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(getQuestionNavigation.fulfilled, (state, action) => {
                // Update navigation data in state
                state.loading = false
                state.error = ''
            })
            .addCase(getQuestionNavigation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const {
    setSelectedYear,
    setSelectedPaper,
    setSelectedQuestionNo,
    setSearchTags,
    addSearchTag,
    removeSearchTag,
    clearSearchTags,
    setSearchInput,
    setSelectedQuestion,
    setQuestions,
    setQuestionTags,
    setCameFromTagSearch,
    setOriginalSearchTags,
    setOriginalSearchPage,
    setIsTagSearchActive,
    setCurrentPage,
    setTotalPages,
    setTotalQuestions,
    setQuestionsCache,
    setTagsCache,
    clearError,
    clearAll,
    clearSearch,
    setLoading,
    setAvailableTags,
    setPopularTags,
} = mathPaperSlice.actions

export default mathPaperSlice.reducer
