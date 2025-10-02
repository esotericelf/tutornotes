import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { store } from './index'
import { setAuthState } from './slices/authSlice'
import { supabase } from '../services/supabase'
import AuthService from '../services/auth/authService'

// Component to handle auth state synchronization
const AuthStateSync = ({ children }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        let mounted = true

        // Initialize auth state
        const initializeAuthState = async () => {
            try {
                // Get initial session
                const { session, error } = await AuthService.getCurrentSession()

                if (mounted) {
                    if (error) {
                        dispatch(setAuthState({ user: null, session: null }))
                    } else {
                        dispatch(setAuthState({ user: session?.user || null, session }))
                    }
                }
            } catch (error) {
                if (mounted) {
                    dispatch(setAuthState({ user: null, session: null }))
                }
            }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                // Update Redux state immediately
                dispatch(setAuthState({ user: session?.user || null, session }))

                // Handle profile creation for OAuth sign-ins
                if (event === 'SIGNED_IN' && session?.user) {
                    try {
                        await AuthService.handleOAuthCallback()
                    } catch (error) {
                        // Don't fail auth if profile creation fails
                        console.error('Profile creation failed:', error)
                    }
                }
            }
        )

        // Initialize auth state
        initializeAuthState()

        // Cleanup
        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [dispatch])

    return children
}

// Main Redux Provider component
export const ReduxProvider = ({ children }) => {
    return (
        <Provider store={store}>
            <AuthStateSync>
                {children}
            </AuthStateSync>
        </Provider>
    )
}

export default ReduxProvider
