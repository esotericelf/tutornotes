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

    // Sign in with Google
    static async signInWithGoogle() {
        try {
            // Ensure we have a proper redirect URL for production
            let redirectUrl
            if (process.env.NODE_ENV === 'production') {
                // In production, use the current domain or fallback to a known URL
                redirectUrl = window.location.origin ? `${window.location.origin}/dashboard` : '/dashboard'
            } else {
                // In development, use localhost
                redirectUrl = 'http://localhost:3000/dashboard'
            }

            console.log('AuthService: Google OAuth redirect URL:', redirectUrl)
            console.log('AuthService: Current environment:', process.env.NODE_ENV)
            console.log('AuthService: Current origin:', window.location.origin)

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
            // Ensure we have a proper redirect URL for production
            let redirectUrl
            if (process.env.NODE_ENV === 'production') {
                // In production, use the current domain or fallback to a known URL
                redirectUrl = window.location.origin ? `${window.location.origin}/dashboard` : '/dashboard'
            } else {
                // In development, use localhost
                redirectUrl = 'http://localhost:3000/dashboard'
            }

            console.log('AuthService: Apple OAuth redirect URL:', redirectUrl)
            console.log('AuthService: Current environment:', process.env.NODE_ENV)
            console.log('AuthService: Current origin:', window.location.origin)

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