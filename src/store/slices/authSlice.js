import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import AuthService from '../../services/auth/authService'

// Initial state
const initialState = {
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
}

// Async thunks for auth operations
export const initializeAuth = createAsyncThunk(
    'auth/initializeAuth',
    async (_, { rejectWithValue }) => {
        try {
            const { session, error } = await AuthService.getCurrentSession()
            if (error) {
                return rejectWithValue(error.message)
            }
            return { session, user: session?.user || null }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({ email, password, userData }, { rejectWithValue }) => {
        try {
            const { data, error } = await AuthService.signUp(email, password, userData)
            if (error) {
                return rejectWithValue(error.message)
            }
            return { data, user: data?.user || null, session: data?.session || null }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data, error } = await AuthService.signIn(email, password)
            if (error) {
                return rejectWithValue(error.message)
            }
            return { data, user: data?.user || null, session: data?.session || null }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const signInWithGoogle = createAsyncThunk(
    'auth/signInWithGoogle',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await AuthService.signInWithGoogle()
            if (error) {
                return rejectWithValue(error.message)
            }
            return { data, user: data?.user || null, session: data?.session || null }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const signInWithDiscord = createAsyncThunk(
    'auth/signInWithDiscord',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await AuthService.signInWithDiscord()
            if (error) {
                return rejectWithValue(error.message)
            }
            return { data, user: data?.user || null, session: data?.session || null }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🚪 Auth slice: Starting signOut...')
            const { error } = await AuthService.signOut()
            console.log('🚪 Auth slice: signOut result:', { error })

            if (error) {
                console.error('🚪 Auth slice: signOut error:', error)
                return rejectWithValue(error.message)
            }

            console.log('🚪 Auth slice: signOut successful')
            return null
        } catch (error) {
            console.error('🚪 Auth slice: signOut exception:', error)
            return rejectWithValue(error.message)
        }
    }
)

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (email, { rejectWithValue }) => {
        try {
            const { error } = await AuthService.resetPassword(email)
            if (error) {
                return rejectWithValue(error.message)
            }
            return null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (updates, { rejectWithValue }) => {
        try {
            const { data, error } = await AuthService.updateProfile(updates)
            if (error) {
                return rejectWithValue(error.message)
            }
            return { data, user: data?.user || null }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthState: (state, action) => {
            const { user, session } = action.payload
            state.user = user
            state.session = session
            state.isAuthenticated = !!user
            state.loading = false
        },
        clearError: (state) => {
            state.error = null
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Initialize auth
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                const { user, session } = action.payload
                state.user = user
                state.session = session
                state.isAuthenticated = !!user
                state.loading = false
                state.error = null
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.user = null
                state.session = null
                state.isAuthenticated = false
                state.loading = false
                state.error = action.payload
            })

            // Sign up
            .addCase(signUp.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(signUp.fulfilled, (state, action) => {
                const { user, session } = action.payload
                state.user = user
                state.session = session
                state.isAuthenticated = !!user
                state.loading = false
                state.error = null
            })
            .addCase(signUp.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Sign in
            .addCase(signIn.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(signIn.fulfilled, (state, action) => {
                const { user, session } = action.payload
                state.user = user
                state.session = session
                state.isAuthenticated = !!user
                state.loading = false
                state.error = null
            })
            .addCase(signIn.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Sign in with Google
            .addCase(signInWithGoogle.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(signInWithGoogle.fulfilled, (state, action) => {
                const { user, session } = action.payload
                state.user = user
                state.session = session
                state.isAuthenticated = !!user
                state.loading = false
                state.error = null
            })
            .addCase(signInWithGoogle.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Sign in with Discord
            .addCase(signInWithDiscord.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(signInWithDiscord.fulfilled, (state, action) => {
                const { user, session } = action.payload
                state.user = user
                state.session = session
                state.isAuthenticated = !!user
                state.loading = false
                state.error = null
            })
            .addCase(signInWithDiscord.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Sign out
            .addCase(signOut.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(signOut.fulfilled, (state) => {
                state.user = null
                state.session = null
                state.isAuthenticated = false
                state.loading = false
                state.error = null
            })
            .addCase(signOut.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Reset password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                const { user } = action.payload
                if (user) {
                    state.user = user
                }
                state.loading = false
                state.error = null
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { setAuthState, clearError, setLoading } = authSlice.actions
export default authSlice.reducer
