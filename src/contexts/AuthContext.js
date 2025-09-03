import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import AuthService from '../services/auth/authService'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    // Simple, single useEffect for auth management
    useEffect(() => {
        let mounted = true

        // Get initial session
        const getInitialSession = async () => {
            try {
                console.log('AuthContext: Getting initial session...')
                const { session, error } = await AuthService.getCurrentSession()

                if (error) {
                    console.error('AuthContext: Error getting initial session:', error)
                    if (mounted) {
                        setSession(null)
                        setUser(null)
                        setLoading(false)
                    }
                    return
                }

                if (mounted) {
                    setSession(session)
                    setUser(session?.user ?? null)
                    setLoading(false)
                    console.log('AuthContext: Initial session loaded, user:', session?.user?.email)
                }
            } catch (error) {
                console.error('AuthContext: Unexpected error getting initial session:', error)
                if (mounted) {
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                }
            }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                console.log('AuthContext: Auth state change:', event, session?.user?.email || 'No user')

                if (event === 'SIGNED_IN' && session?.user) {
                    // User just signed in - create/update profile
                    try {
                        console.log('AuthContext: User signed in, handling profile...')
                        await AuthService.handleOAuthCallback()
                    } catch (error) {
                        console.error('AuthContext: Profile creation error:', error)
                        // Don't fail auth if profile creation fails
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log('AuthContext: User signed out')
                }

                // Update state
                if (mounted) {
                    setSession(session)
                    setUser(session?.user ?? null)
                    setLoading(false)
                }
            }
        )

        // Get initial session
        getInitialSession()

        // Cleanup
        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email, password, userData = {}) => {
        const { data, error } = await AuthService.signUp(email, password, userData)
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await AuthService.signIn(email, password)
        return { data, error }
    }

    const signInWithGoogle = async () => {
        const { data, error } = await AuthService.signInWithGoogle()
        return { data, error }
    }

    const signInWithApple = async () => {
        const { data, error } = await AuthService.signInWithApple()
        return { data, error }
    }

    const signOut = async () => {
        const { error } = await AuthService.signOut()
        return { error }
    }

    const resetPassword = async (email) => {
        const { error } = await AuthService.resetPassword(email)
        return { error }
    }

    const updateProfile = async (updates) => {
        const { data, error } = await AuthService.updateProfile(updates)
        return { data, error }
    }

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        resetPassword,
        updateProfile,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext