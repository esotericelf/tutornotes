import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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
    const loadingRef = useRef(loading)

    // Update loading ref whenever loading state changes
    useEffect(() => {
        loadingRef.current = loading
    }, [loading])

    // Simple, single useEffect for auth management
    useEffect(() => {
        let mounted = true

        // Quick environment check
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
        const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables:', {
                url: !!supabaseUrl,
                key: !!supabaseKey
            })
            // Set loading to false immediately if credentials are missing
            setLoading(false)
            return
        }

        // Get initial session - with fallback to prevent infinite loading
        const getInitialSession = async () => {
            try {
                // Add timeout to prevent infinite hanging
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
                })

                const sessionPromise = AuthService.getCurrentSession()
                const { session, error } = await Promise.race([sessionPromise, timeoutPromise])

                if (error) {
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
                }
            } catch (error) {
                // If there's any error (including timeout), set loading to false
                if (mounted) {
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                }
            }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!mounted) return

                // Update state immediately
                if (mounted) {
                    setSession(session)
                    setUser(session?.user ?? null)
                    setLoading(false)
                }
            }
        )

        // Get initial session
        getInitialSession()

        // Safety fallback - ensure loading is never stuck
        const safetyTimer = setTimeout(() => {
            if (mounted && loadingRef.current) {
                setLoading(false)
            }
        }, 10000) // 10 second safety net

        // Cleanup
        return () => {
            mounted = false
            clearTimeout(safetyTimer)
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

    const signInWithDiscord = async () => {
        const { data, error } = await AuthService.signInWithDiscord()
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
        signInWithDiscord,
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