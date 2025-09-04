import { supabase } from '../supabase'

export class AuthService {
    // Sign up with email and password
    static async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Sign in with email and password
    static async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get the current redirect URL based on environment
    static getRedirectUrl() {
        // Debug environment info
        console.log('AuthService: Environment check:', {
            NODE_ENV: process.env.NODE_ENV,
            REACT_APP_PRODUCTION_URL: process.env.REACT_APP_PRODUCTION_URL,
            REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
            windowLocation: typeof window !== 'undefined' ? window.location.href : 'undefined',
            windowPort: typeof window !== 'undefined' ? window.location.port : 'undefined'
        })

        // Detect development environment by checking current URL
        const isDevelopment = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('localhost') ||
            process.env.NODE_ENV === 'development'
        );

        // Development environment - always use localhost
        if (isDevelopment) {
            // Check if we're on a different port than 3000
            const currentPort = window.location.port || '3000'
            const redirectUrl = `http://localhost:${currentPort}/dashboard`
            console.log('AuthService: Development redirect URL:', redirectUrl)
            return redirectUrl
        }

        // Production environment
        // Priority 1: Use explicit production URL environment variable
        if (process.env.REACT_APP_PRODUCTION_URL) {
            const redirectUrl = `${process.env.REACT_APP_PRODUCTION_URL}/dashboard`
            console.log('AuthService: Production redirect URL (env var):', redirectUrl)
            return redirectUrl
        }

        // Priority 2: Extract from Supabase URL (most reliable)
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
        if (supabaseUrl) {
            try {
                const url = new URL(supabaseUrl)
                // Remove any auth-related paths and construct base URL
                const baseUrl = `https://${url.hostname}`
                const redirectUrl = `${baseUrl}/dashboard`
                console.log('AuthService: Production redirect URL (Supabase):', redirectUrl)
                return redirectUrl
            } catch (error) {
                console.warn('AuthService: Failed to parse Supabase URL:', error)
            }
        }

        // Priority 3: Use window.location.origin if available
        if (typeof window !== 'undefined' && window.location.origin) {
            const redirectUrl = `${window.location.origin}/dashboard`
            console.log('AuthService: Production redirect URL (window.location):', redirectUrl)
            return redirectUrl
        }

        // Priority 4: Hardcoded fallback (should be updated for your domain)
        console.warn('AuthService: No production URL found, using fallback')
        const fallbackUrl = 'https://pjcjnmqoaajtotqqqsxs.supabase.co/dashboard'
        console.log('AuthService: Fallback redirect URL:', fallbackUrl)
        return fallbackUrl
    }

    // Sign in with Google
    static async signInWithGoogle() {
        try {
            // Use the robust redirect URL method
            const redirectUrl = AuthService.getRedirectUrl()

            // Add redirect interceptor for development
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                // Store the intended redirect URL
                localStorage.setItem('intendedRedirectUrl', redirectUrl)

                // Add a listener for when we're redirected to the wrong domain
                window.addEventListener('load', () => {
                    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                        console.log('AuthService: Detected wrong redirect, redirecting back to localhost')
                        const intendedUrl = localStorage.getItem('intendedRedirectUrl') || 'http://localhost:3001/dashboard'
                        window.location.href = intendedUrl
                    }
                })
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Sign in with Discord
    static async signInWithDiscord() {
        try {
            // Use the robust redirect URL method
            const redirectUrl = AuthService.getRedirectUrl()

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        scope: 'identify email'
                    }
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Handle OAuth callback and profile creation
    static async handleOAuthCallback() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                throw error
            }

            if (session?.user) {
                // Import ProfileService here to avoid circular dependencies
                const { ProfileService } = await import('../user/profileService')

                // Determine OAuth provider and create appropriate profile
                let profileResult
                const provider = session.user.app_metadata?.provider

                if (provider === 'discord') {
                    profileResult = await ProfileService.createProfileFromDiscord(session.user)
                } else if (provider === 'google') {
                    profileResult = await ProfileService.createProfileFromGoogle(session.user)
                } else {
                    // Fallback for other providers or unknown providers
                    profileResult = await ProfileService.createProfileFromGoogle(session.user)
                }

                if (profileResult.error) {
                    // Don't fail the auth flow if profile creation fails
                }

                return { data: { session, profile: profileResult.data }, error: null }
            }

            return { data: { session: null, profile: null }, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }



    // Sign out
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Get current user
    static async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            return { user, error: null }
        } catch (error) {
            return { user: null, error }
        }
    }

    // Get current session
    static async getCurrentSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) throw error
            return { session, error: null }
        } catch (error) {
            return { session: null, error }
        }
    }

    // Reset password
    static async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email)
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Update user profile
    static async updateProfile(updates) {
        try {
            const { data, error } = await supabase.auth.updateUser(updates)
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }
}

export default AuthService