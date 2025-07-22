import { supabase } from '../supabase'

export class AdminService {
    // Create new tutor note
    static async createTutorNote(noteData) {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .insert({
                    title: noteData.title,
                    content: noteData.content,
                    category: noteData.category,
                    is_public: noteData.is_public || false,
                    author_id: noteData.author_id,
                    tags: noteData.tags || []
                })
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update tutor note
    static async updateTutorNote(id, updates) {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .update({
                    title: updates.title,
                    content: updates.content,
                    category: updates.category,
                    is_public: updates.is_public,
                    tags: updates.tags,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Delete tutor note
    static async deleteTutorNote(id) {
        try {
            const { error } = await supabase
                .from('tutor_notes')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Get all tutor notes (including private ones)
    static async getAllTutorNotes() {
        try {
            const { data, error } = await supabase
                .from('tutor_notes')
                .select(`
          *,
          profiles:author_id (id, email, full_name)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Create new category
    static async createCategory(categoryData) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name: categoryData.name,
                    description: categoryData.description,
                    color: categoryData.color
                })
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update category
    static async updateCategory(id, updates) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update({
                    name: updates.name,
                    description: updates.description,
                    color: updates.color
                })
                .eq('id', id)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Delete category
    static async deleteCategory(id) {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Get all users (admin only)
    static async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update user role
    static async updateUserRole(userId, role) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get system statistics
    static async getSystemStats() {
        try {
            const [notesCount, usersCount, categoriesCount] = await Promise.all([
                supabase.from('tutor_notes').select('*', { count: 'exact' }),
                supabase.from('profiles').select('*', { count: 'exact' }),
                supabase.from('categories').select('*', { count: 'exact' })
            ])

            return {
                data: {
                    totalNotes: notesCount.count,
                    totalUsers: usersCount.count,
                    totalCategories: categoriesCount.count
                },
                error: null
            }
        } catch (error) {
            return { data: null, error }
        }
    }
}

export default AdminService