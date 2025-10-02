import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import randomizedQuizService from '../../components/quiz/services/randomizedQuizService'

// Initial state
const initialState = {
    // Quiz state
    currentTest: null,
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 30 * 60, // 30 minutes in seconds
    isSubmitting: false,
    quizStarted: false,
    isPractice: false,

    // Results state
    results: null,
    score: 0,
    percentage: 0,
    correctAnswers: 0,
    totalQuestions: 0,

    // UI state
    loading: false,
    error: null,

    // Timer state
    timerActive: false,
    timerInterval: null,
}

// Async thunks for quiz operations
export const initializeQuiz = createAsyncThunk(
    'quiz/initializeQuiz',
    async (testData, { rejectWithValue }) => {
        try {
            if (!testData) {
                return rejectWithValue('No test data provided')
            }

            // Initialize answers object
            const initialAnswers = {}
            testData.questions.forEach((question, index) => {
                initialAnswers[index] = null
            })

            return {
                test: testData,
                answers: initialAnswers,
                isPractice: testData.isPractice || false
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const submitQuiz = createAsyncThunk(
    'quiz/submitQuiz',
    async ({ test, answers, userId, timeRemaining }, { rejectWithValue }) => {
        try {
            // Calculate score
            let correctAnswers = 0
            const quizAnswers = []

            test.questions.forEach((question, index) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer === question.correct_answer

                if (isCorrect) {
                    correctAnswers++
                }

                quizAnswers.push({
                    question_id: question.id,
                    selected_answer: userAnswer,
                    is_correct: isCorrect
                })
            })

            const percentage = Math.round((correctAnswers / test.questions.length) * 100)
            const timeUsed = (30 * 60) - timeRemaining

            // Submit to service
            const result = await randomizedQuizService.submitQuizResult({
                test_id: test.id,
                user_id: userId,
                answers: quizAnswers,
                score: correctAnswers,
                percentage,
                time_used: timeUsed,
                is_practice: test.isPractice || false
            })

            return {
                results: result,
                score: correctAnswers,
                percentage,
                correctAnswers,
                totalQuestions: test.questions.length,
                timeUsed
            }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const loadQuizHistory = createAsyncThunk(
    'quiz/loadQuizHistory',
    async (userId, { rejectWithValue }) => {
        try {
            const history = await randomizedQuizService.getQuizHistory(userId)
            return history
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const createPracticeQuiz = createAsyncThunk(
    'quiz/createPracticeQuiz',
    async ({ tags, questionCount = 10, difficulty = 'mixed' }, { rejectWithValue }) => {
        try {
            const quiz = await randomizedQuizService.createPracticeQuiz({
                tags,
                questionCount,
                difficulty
            })
            return quiz
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Quiz slice
const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        // Quiz navigation
        setCurrentQuestionIndex: (state, action) => {
            state.currentQuestionIndex = action.payload
        },
        nextQuestion: (state) => {
            if (state.currentQuestionIndex < state.currentTest?.questions.length - 1) {
                state.currentQuestionIndex += 1
            }
        },
        previousQuestion: (state) => {
            if (state.currentQuestionIndex > 0) {
                state.currentQuestionIndex -= 1
            }
        },

        // Answer management
        setAnswer: (state, action) => {
            const { questionIndex, answer } = action.payload
            state.answers[questionIndex] = answer
        },
        clearAnswers: (state) => {
            state.answers = {}
        },

        // Timer management
        setTimeRemaining: (state, action) => {
            state.timeRemaining = action.payload
        },
        decrementTime: (state) => {
            if (state.timeRemaining > 0) {
                state.timeRemaining -= 1
            }
        },
        startTimer: (state) => {
            state.timerActive = true
        },
        stopTimer: (state) => {
            state.timerActive = false
        },

        // Quiz state
        setQuizStarted: (state, action) => {
            state.quizStarted = action.payload
        },
        setIsSubmitting: (state, action) => {
            state.isSubmitting = action.payload
        },

        // Results
        setResults: (state, action) => {
            state.results = action.payload
        },
        clearResults: (state) => {
            state.results = null
            state.score = 0
            state.percentage = 0
            state.correctAnswers = 0
            state.totalQuestions = 0
        },

        // Error handling
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },

        // Reset quiz
        resetQuiz: (state) => {
            return {
                ...initialState,
                // Keep some persistent state if needed
            }
        },

        // Set practice mode
        setIsPractice: (state, action) => {
            state.isPractice = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Initialize quiz
            .addCase(initializeQuiz.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(initializeQuiz.fulfilled, (state, action) => {
                const { test, answers, isPractice } = action.payload
                state.currentTest = test
                state.answers = answers
                state.isPractice = isPractice
                state.currentQuestionIndex = 0
                state.quizStarted = true
                state.loading = false
                state.error = null
            })
            .addCase(initializeQuiz.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Submit quiz
            .addCase(submitQuiz.pending, (state) => {
                state.isSubmitting = true
                state.error = null
            })
            .addCase(submitQuiz.fulfilled, (state, action) => {
                const { results, score, percentage, correctAnswers, totalQuestions } = action.payload
                state.results = results
                state.score = score
                state.percentage = percentage
                state.correctAnswers = correctAnswers
                state.totalQuestions = totalQuestions
                state.isSubmitting = false
                state.error = null
            })
            .addCase(submitQuiz.rejected, (state, action) => {
                state.isSubmitting = false
                state.error = action.payload
            })

            // Load quiz history
            .addCase(loadQuizHistory.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loadQuizHistory.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                // Store history in state if needed
            })
            .addCase(loadQuizHistory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Create practice quiz
            .addCase(createPracticeQuiz.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createPracticeQuiz.fulfilled, (state, action) => {
                state.currentTest = action.payload
                state.isPractice = true
                state.loading = false
                state.error = null
            })
            .addCase(createPracticeQuiz.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const {
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    setAnswer,
    clearAnswers,
    setTimeRemaining,
    decrementTime,
    startTimer,
    stopTimer,
    setQuizStarted,
    setIsSubmitting,
    setResults,
    clearResults,
    setError,
    clearError,
    resetQuiz,
    setIsPractice,
} = quizSlice.actions

export default quizSlice.reducer
