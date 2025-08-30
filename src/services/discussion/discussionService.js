import { supabase } from '../supabase'

export class DiscussionService {
    // Get all discussions for a specific question
    static async getDiscussionsByQuestionId(questionId) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select('*')
                .eq('question_id', questionId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get discussions with user information
    static async getDiscussionsWithUsers(questionId) {
        try {
            const { data, error } = await supabase
                .from('discussions_with_users')
                .select('*')
                .eq('question_id', questionId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Create a new discussion/comment
    static async createDiscussion(discussionData) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .insert([discussionData])
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update a discussion
    static async updateDiscussion(id, updates) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Delete a discussion
    static async deleteDiscussion(id) {
        try {
            const { error } = await supabase
                .from('discussions')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { data: { success: true }, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get a single discussion by ID
    static async getDiscussionById(id) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get replies to a specific discussion
    static async getReplies(parentId) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select('*')
                .eq('parent', parentId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Vote on a discussion (increment votes_count)
    static async voteDiscussion(id) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .update({ votes_count: supabase.rpc('increment') })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get discussions by user
    static async getDiscussionsByUser(userId) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get top discussions by votes
    static async getTopDiscussions(questionId, limit = 5) {
        try {
            const { data, error } = await supabase
                .from('discussions')
                .select('*')
                .eq('question_id', questionId)
                .order('votes_count', { ascending: false })
                .limit(limit)

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Search discussions by content
    static async searchDiscussions(searchTerm, questionId = null) {
        try {
            let query = supabase
                .from('discussions')
                .select('*')
                .ilike('comment', `%${searchTerm}%`)
                .order('created_at', { ascending: false })

            if (questionId) {
                query = query.eq('question_id', questionId)
            }

            const { data, error } = await query

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get discussion statistics
    static async getDiscussionStats(questionId = null) {
        try {
            let query = supabase
                .from('discussions')
                .select('*', { count: 'exact' })

            if (questionId) {
                query = query.eq('question_id', questionId)
            }

            const { count, error } = await query

            if (error) throw error
            return {
                data: {
                    totalDiscussions: count || 0,
                    questionId: questionId
                },
                error: null
            }
        } catch (error) {
            return { data: null, error }
        }
    }
}

export default DiscussionService