import { supabase } from '../supabase'

export class UserDataService {
    // Get all public tutor notes (read-only)
    static async getTutorNotes() {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get tutor notes by category
    static async getTutorNotesByCategory(category) {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .select('*')
                .eq('category', category)
                .eq('is_public', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get single tutor note by ID
    static async getTutorNoteById(id) {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .select('*')
                .eq('id', id)
                .eq('is_public', true)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Search tutor notes
    static async searchTutorNotes(searchTerm) {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .select('*')
                .eq('is_public', true)
                .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get categories
    static async getCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get user's favorite notes (if authenticated)
    static async getUserFavorites(userId) {
        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .select(`
          *,
          tutor_notes (*)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Add note to favorites
    static async addToFavorites(userId, noteId) {
        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .insert({
                    user_id: userId,
                    note_id: noteId
                })
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Remove note from favorites
    static async removeFromFavorites(userId, noteId) {
        try {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', userId)
                .eq('note_id', noteId)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }
}

export default UserDataService