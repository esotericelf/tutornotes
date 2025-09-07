import { supabase } from '../../../services/supabase';
import { QuizSortOptions } from '../types/quiz.types';

/**
 * Quiz Service - Handles all quiz-related database operations
 * Inherits the parent project's Supabase connection and follows established patterns
 */
class QuizService {
    /**
     * Create a new quiz
     * @param {Object} quizData - Quiz data following Quiz structure
     * @returns {Promise<{data: Object, error: Error}>}
     */
    async createQuiz(quizData) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .insert([quizData])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to create quiz:', error);
            return { data: null, error };
        }
    }

    /**
     * Get all quizzes with optional filtering and sorting
     * @param {Object} filters - QuizFilters object
     * @param {string} sortBy - Sort option from QuizSortOptions
     * @param {number} page - Page number for pagination
     * @param {number} pageSize - Number of items per page
     * @returns {Promise<{data: Array, error: Error}>}
     */
    async getQuizzes(filters = {}, sortBy = QuizSortOptions.CREATED_DESC, page = 1, pageSize = 20) {
        try {
            let query = supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('is_active', true);

            // Apply filters
            if (filters.subject_area) {
                query = query.eq('subject_area', filters.subject_area);
            }

            if (filters.difficulty_level) {
                query = query.eq('difficulty_level', filters.difficulty_level);
            }

            if (filters.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }

            if (filters.is_public !== null) {
                query = query.eq('is_public', filters.is_public);
            }

            if (filters.created_by) {
                query = query.eq('created_by', filters.created_by);
            }

            if (filters.min_questions) {
                query = query.gte('array_length(questions, 1)', filters.min_questions);
            }

            if (filters.max_questions) {
                query = query.lte('array_length(questions, 1)', filters.max_questions);
            }

            if (filters.time_limit_min) {
                query = query.gte('time_limit_minutes', filters.time_limit_min);
            }

            if (filters.time_limit_max) {
                query = query.lte('time_limit_minutes', filters.time_limit_max);
            }

            // Apply sorting
            switch (sortBy) {
                case QuizSortOptions.TITLE_ASC:
                    query = query.order('title', { ascending: true });
                    break;
                case QuizSortOptions.TITLE_DESC:
                    query = query.order('title', { ascending: false });
                    break;
                case QuizSortOptions.CREATED_ASC:
                    query = query.order('created_at', { ascending: true });
                    break;
                case QuizSortOptions.CREATED_DESC:
                    query = query.order('created_at', { ascending: false });
                    break;
                case QuizSortOptions.DIFFICULTY_ASC:
                    query = query.order('difficulty_level', { ascending: true });
                    break;
                case QuizSortOptions.DIFFICULTY_DESC:
                    query = query.order('difficulty_level', { ascending: false });
                    break;
                case QuizSortOptions.POPULARITY:
                    query = query.order('attempt_count', { ascending: false });
                    break;
                case QuizSortOptions.PASS_RATE:
                    query = query.order('pass_rate', { ascending: false });
                    break;
                default:
                    query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get quizzes:', error);
            return { data: null, error };
        }
    }

    /**
     * Get a single quiz by ID
     * @param {string} quizId - Quiz UUID
     * @returns {Promise<{data: Object, error: Error}>}
     */
    async getQuizById(quizId) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('id', quizId)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get quiz by ID:', error);
            return { data: null, error };
        }
    }

    /**
     * Update an existing quiz
     * @param {string} quizId - Quiz UUID
     * @param {Object} updates - Quiz data to update
     * @returns {Promise<{data: Object, error: Error}>}
     */
    async updateQuiz(quizId, updates) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .update(updates)
                .eq('id', quizId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to update quiz:', error);
            return { data: null, error };
        }
    }

    /**
     * Delete a quiz (soft delete by setting is_active to false)
     * @param {string} quizId - Quiz UUID
     * @returns {Promise<{data: Object, error: Error}>}
     */
    async deleteQuiz(quizId) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .update({ is_active: false })
                .eq('id', quizId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to delete quiz:', error);
            return { data: null, error };
        }
    }

    /**
     * Get quiz statistics
     * @param {string} quizId - Quiz UUID
     * @returns {Promise<{data: Object, error: Error}>}
     */
    async getQuizStats(quizId) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .select('attempt_count, pass_rate')
                .eq('id', quizId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get quiz stats:', error);
            return { data: null, error };
        }
    }

    /**
     * Search quizzes by text
     * @param {string} searchTerm - Search term
     * @param {Object} filters - Additional filters
     * @returns {Promise<{data: Array, error: Error}>}
     */
    async searchQuizzes(searchTerm, filters = {}) {
        try {
            let query = supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('is_active', true)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);

            // Apply additional filters
            if (filters.subject_area) {
                query = query.eq('subject_area', filters.subject_area);
            }

            if (filters.is_public !== null) {
                query = query.eq('is_public', filters.is_public);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to search quizzes:', error);
            return { data: null, error };
        }
    }

    /**
     * Get quizzes by creator
     * @param {string} userId - User UUID
     * @returns {Promise<{data: Array, error: Error}>}
     */
    async getQuizzesByCreator(userId) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('created_by', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get quizzes by creator:', error);
            return { data: null, error };
        }
    }

    /**
     * Get popular quizzes (by attempt count)
     * @param {number} limit - Number of quizzes to return
     * @returns {Promise<{data: Array, error: Error}>}
     */
    async getPopularQuizzes(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('is_active', true)
                .eq('is_public', true)
                .order('attempt_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get popular quizzes:', error);
            return { data: null, error };
        }
    }

    /**
     * Get recent quizzes
     * @param {number} limit - Number of quizzes to return
     * @returns {Promise<{data: Array, error: Error}>}
     */
    async getRecentQuizzes(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .select('*')
                .eq('is_active', true)
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get recent quizzes:', error);
            return { data: null, error };
        }
    }

    /**
     * Get quiz count by filters
     * @param {Object} filters - QuizFilters object
     * @returns {Promise<{data: number, error: Error}>}
     */
    async getQuizCount(filters = {}) {
        try {
            let query = supabase
                .from('quiz_quizzes')
                .select('id', { count: 'exact' })
                .eq('is_active', true);

            // Apply filters
            if (filters.subject_area) {
                query = query.eq('subject_area', filters.subject_area);
            }

            if (filters.is_public !== null) {
                query = query.eq('is_public', filters.is_public);
            }

            const { count, error } = await query;

            if (error) throw error;
            return { data: count, error: null };
        } catch (error) {
            console.error('QuizService: Failed to get quiz count:', error);
            return { data: null, error };
        }
    }
}

// Export singleton instance
const quizService = new QuizService();
export default quizService;
