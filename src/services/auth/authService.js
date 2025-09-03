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

    // Get the current production URL for OAuth redirects
    static getProductionRedirectUrl() {
        if (process.env.NODE_ENV !== 'production') {
            return 'http://localhost:3000/dashboard'
        }

        // Priority 1: Use explicit production URL environment variable
        if (process.env.REACT_APP_PRODUCTION_URL) {
            return `${process.env.REACT_APP_PRODUCTION_URL}/dashboard`
        }

        // Priority 2: Extract from Supabase URL (most reliable)
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
        if (supabaseUrl) {
            try {
                const url = new URL(supabaseUrl)
                // Remove any auth-related paths and construct base URL
                const baseUrl = `https://${url.hostname}`
                return `${baseUrl}/dashboard`
            } catch (error) {
                console.warn('AuthService: Failed to parse Supabase URL:', error)
            }
        }

        // Priority 3: Use window.location.origin if available
        if (typeof window !== 'undefined' && window.location.origin) {
            return `${window.location.origin}/dashboard`
        }

        // Priority 4: Hardcoded fallback (should be updated for your domain)
        console.warn('AuthService: No production URL found, using fallback')
        return 'https://pjcjnmqoaajtotqqqsxs.supabase.co/dashboard' // Using your Supabase domain as fallback
    }

    // Sign in with Google
    static async signInWithGoogle() {
        try {
            // Use the robust production URL method
            const redirectUrl = AuthService.getProductionRedirectUrl()

            console.log('AuthService: Google OAuth redirect URL:', redirectUrl)
            console.log('AuthService: Current environment:', process.env.NODE_ENV)
            console.log('AuthService: Production URL method result:', redirectUrl)

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

    // Sign in with Apple
    static async signInWithApple() {
        try {
            // Use the robust production URL method
            const redirectUrl = AuthService.getProductionRedirectUrl()

            console.log('AuthService: Apple OAuth redirect URL:', redirectUrl)
            console.log('AuthService: Current environment:', process.env.NODE_ENV)
            console.log('AuthService: Production URL method result:', redirectUrl)

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        response_mode: 'form_post'
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
            console.log('AuthService: Handling OAuth callback...')

            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('AuthService: Error getting session:', error)
                throw error
            }

            if (session?.user) {
                console.log('AuthService: User authenticated, creating profile...')

                // Import ProfileService here to avoid circular dependencies
                const { ProfileService } = await import('../user/profileService')

                // Create/update profile
                const profileResult = await ProfileService.createProfileFromGoogle(session.user)

                if (profileResult.error) {
                    console.warn('AuthService: Profile creation warning:', profileResult.error)
                    // Don't fail the auth flow if profile creation fails
                } else {
                    console.log('AuthService: Profile creation completed successfully')
                }

                return { data: { session, profile: profileResult.data }, error: null }
            }

            return { data: { session: null, profile: null }, error: null }
        } catch (error) {
            console.error('AuthService: OAuth callback error:', error)
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