import { supabase } from '../supabase'

export class DiscussionService {
    // Get discussions for a specific tutor note
    static async getDiscussionsByNoteId(noteId) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select(`
          *,
          profiles:user_id (id, email, full_name, avatar_url),
          replies:discussion_replies (
            *,
            profiles:user_id (id, email, full_name, avatar_url)
          )
        `)
                .eq('note_id', noteId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Create new discussion
    static async createDiscussion(discussionData) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .insert({
                    note_id: discussionData.noteId,
                    user_id: discussionData.userId,
                    title: discussionData.title,
                    content: discussionData.content,
                    is_resolved: false
                })
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update discussion
    static async updateDiscussion(id, updates) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .update({
                    title: updates.title,
                    content: updates.content,
                    is_resolved: updates.is_resolved,
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

    // Delete discussion
    static async deleteDiscussion(id) {
        try {
            const { error } = await supabase
                .from('discussions')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Add reply to discussion
    static async addReply(replyData) {
        try {
            const { data, error } = await supabase
                .from('discussion_replies')
                .insert({
                    discussion_id: replyData.discussionId,
                    user_id: replyData.userId,
                    content: replyData.content
                })
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update reply
    static async updateReply(id, updates) {
        try {
            const { data, error } = await supabase
                .from('discussion_replies')
                .update({
                    content: updates.content,
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

    // Delete reply
    static async deleteReply(id) {
        try {
            const { error } = await supabase
                .from('discussion_replies')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Get user's discussions
    static async getUserDiscussions(userId) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select(`
          *,
          tutor_notes (id, title, category),
          profiles:user_id (id, email, full_name)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Mark discussion as resolved
    static async markDiscussionResolved(id) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .update({
                    is_resolved: true,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get all discussions (for admin)
    static async getAllDiscussions() {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select(`
          *,
          tutor_notes (id, title, category),
          profiles:user_id (id, email, full_name),
          replies:discussion_replies (
            *,
            profiles:user_id (id, email, full_name)
          )
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Search discussions
    static async searchDiscussions(searchTerm) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select(`
          *,
          tutor_notes (id, title, category),
          profiles:user_id (id, email, full_name)
        `)
                .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }
}

export default DiscussionService