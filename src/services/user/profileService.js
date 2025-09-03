import { supabase } from '../supabase'

export class ProfileService {
    // Get user profile by ID
    static async getProfile(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                throw error
            }

            return { data, error: null }
        } catch (error) {
            console.error('ProfileService: Failed to get profile:', error)
            return { data: null, error }
        }
    }

    // Create or update user profile
    static async upsertProfile(profileData) {
        try {
            if (!profileData?.id) {
                throw new Error('Profile data must include user ID')
            }

            const { data, error } = await supabase
                .from('profiles')
                .upsert(profileData, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                })
                .select()
                .single()

            if (error) {
                throw error
            }

            return { data, error: null }
        } catch (error) {
            console.error('ProfileService: Failed to upsert profile:', error)
            return { data: null, error }
        }
    }

    // Create profile from Google OAuth data
    static async createProfileFromGoogle(user, googleData = {}) {
        try {
            if (!user?.id) {
                throw new Error('User object must include ID')
            }

            const profileData = {
                id: user.id,
                full_name: googleData.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || '',
                avatar_url: googleData.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.photoURL || '',
                username: googleData.username || user.user_metadata?.username || user.user_metadata?.preferred_username || user.email?.split('@')[0] || '',
                role: 'user',
                updated_at: new Date().toISOString()
            }

            // Check if profile already exists
            const existingProfile = await this.getProfile(user.id)

            if (existingProfile.data) {
                // Update existing profile with Google data
                const updatedData = {
                    ...existingProfile.data,
                    full_name: profileData.full_name || existingProfile.data.full_name,
                    avatar_url: profileData.avatar_url || existingProfile.data.avatar_url,
                    username: profileData.username || existingProfile.data.username,
                    updated_at: new Date().toISOString()
                }

                return await this.upsertProfile(updatedData)
            } else {
                // Create new profile
                return await this.upsertProfile(profileData)
            }
        } catch (error) {
            console.error('ProfileService: Failed to create profile from Google data:', error)
            return { data: null, error }
        }
    }

    // Update profile
    static async updateProfile(userId, updates) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single()

            if (error) {
                throw error
            }

            return { data, error: null }
        } catch (error) {
            console.error('ProfileService: Failed to update profile:', error)
            return { data: null, error }
        }
    }

    // Get all profiles (admin only)
    static async getAllProfiles() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) {
                throw error
            }

            return { data, error: null }
        } catch (error) {
            console.error('ProfileService: Failed to get all profiles:', error)
            return { data: null, error }
        }
    }

    // Delete profile (admin only)
    static async deleteProfile(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (error) {
                throw error
            }

            return { error: null }
        } catch (error) {
            console.error('ProfileService: Failed to delete profile:', error)
            return { error }
        }
    }
}

export default ProfileService
