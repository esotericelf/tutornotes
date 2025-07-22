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

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { session } = await AuthService.getCurrentSession()
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, userData = {}) => {
        const { data, error } = await AuthService.signUp(email, password, userData)
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await AuthService.signIn(email, password)
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