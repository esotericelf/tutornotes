/**
 * Tag Service for Math Papers
 * This service provides backend functions for tag-based operations using database functions
 */

import { supabase } from '../supabase';

class TagService {
    /**
     * Get popular tags with usage counts
     * @param {number} limit - Maximum number of tags to return (default: 15)
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getPopularTags(limit = 15) {
        try {
            const { data, error } = await supabase
                .rpc('get_popular_math_paper_tags', { limit_count: limit });

            if (error) {
                console.error('Error getting popular tags:', error);
                return { data: null, error };
            }

            // Transform data to match frontend expectations
            const transformedData = data.map(tag => ({
                topic: 'General', // Default topic since we don't have topic info
                tag: tag.tag,
                count: tag.count
            }));

            return { data: transformedData, error: null };
        } catch (err) {
            console.error('Unexpected error getting popular tags:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get all available tags with usage statistics
     * @param {number} limit - Maximum number of tags to return (default: 100)
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getAllTagsWithCounts(limit = 100) {
        try {
            const { data, error } = await supabase
                .rpc('get_all_tags_with_counts', { limit_count: limit });

            if (error) {
                console.error('Error getting all tags with counts:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Unexpected error getting all tags with counts:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Search tags with autocomplete functionality
     * @param {string} searchTerm - Search term to match against tags
     * @param {number} limit - Maximum number of results (default: 20)
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async searchTagsAutocomplete(searchTerm, limit = 20) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: [], error: null };
            }

            const { data, error } = await supabase
                .rpc('search_tags_autocomplete', {
                    search_term: searchTerm.trim(),
                    limit_count: limit
                });

            if (error) {
                console.error('Error searching tags autocomplete:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Unexpected error searching tags autocomplete:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get math papers by tags (overlap search)
     * @param {Array<string>} tags - Array of tags to search for
     * @param {number} limit - Maximum number of results (default: 100)
     * @param {string} sortBy - Sort field (default: 'year')
     * @param {boolean} sortAsc - Sort ascending (default: false)
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getMathPapersByTags(tags, limit = 100, sortBy = 'year', sortAsc = false) {
        try {
            if (!tags || tags.length === 0) {
                return { data: [], error: null };
            }

            const { data, error } = await supabase
                .rpc('get_math_papers_by_tags_v3', {
                    search_tags: tags,
                    limit_count: limit,
                    sort_by: sortBy,
                    sort_asc: sortAsc
                });

            if (error) {
                console.error('Error getting math papers by tags:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Unexpected error getting math papers by tags:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get math papers by exact tag match
     * @param {Array<string>} tags - Array of tags to search for (exact match)
     * @param {number} limit - Maximum number of results (default: 100)
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getMathPapersByExactTags(tags, limit = 100) {
        try {
            if (!tags || tags.length === 0) {
                return { data: [], error: null };
            }

            const { data, error } = await supabase
                .rpc('get_math_papers_by_exact_tags_v3', {
                    search_tags: tags,
                    limit_count: limit
                });

            if (error) {
                console.error('Error getting math papers by exact tags:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Unexpected error getting math papers by exact tags:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get math papers by tags with advanced search (AND/OR logic)
     * @param {Array<string>} tags - Array of tags to search for
     * @param {string} matchType - 'AND' or 'OR' logic (default: 'OR')
     * @param {number} limit - Maximum number of results (default: 100)
     * @param {string} sortBy - Sort field (default: 'year')
     * @param {boolean} sortAsc - Sort ascending (default: false)
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getMathPapersByTagsAdvanced(tags, matchType = 'OR', limit = 100, sortBy = 'year', sortAsc = false) {
        try {
            if (!tags || tags.length === 0) {
                return { data: [], error: null };
            }

            const { data, error } = await supabase
                .rpc('get_math_papers_by_tags_advanced_v3', {
                    search_tags: tags,
                    match_type: matchType,
                    limit_count: limit,
                    sort_by: sortBy,
                    sort_asc: sortAsc
                });

            if (error) {
                console.error('Error getting math papers by tags advanced:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Unexpected error getting math papers by tags advanced:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get tag statistics and related information
     * @param {string} tag - Tag to get statistics for
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async getTagStatistics(tag) {
        try {
            if (!tag || tag.trim().length === 0) {
                return { data: null, error: new Error('Tag is required') };
            }

            const { data, error } = await supabase
                .rpc('get_tag_statistics', { target_tag: tag.trim() });

            if (error) {
                console.error('Error getting tag statistics:', error);
                return { data: null, error };
            }

            return { data: data?.[0] || null, error: null };
        } catch (err) {
            console.error('Unexpected error getting tag statistics:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get available tags for autocomplete (extracted from questions)
     * This is a fallback method that extracts tags directly from questions
     * @param {number} limit - Maximum number of tags to return
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getAvailableTagsFromQuestions(limit = 100) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('tags')
                .not('tags', 'is', null)
                .limit(limit * 2); // Get more records to ensure we have enough tags

            if (error) {
                console.error('Error getting available tags from questions:', error);
                return { data: null, error };
            }

            // Extract unique tags
            const allTags = new Set();
            data.forEach(question => {
                if (question.tags && Array.isArray(question.tags)) {
                    question.tags.forEach(tag => allTags.add(tag));
                }
            });

            const uniqueTags = Array.from(allTags).sort();
            return { data: uniqueTags.slice(0, limit), error: null };
        } catch (err) {
            console.error('Unexpected error getting available tags from questions:', err);
            return { data: null, error: err };
        }
    }
}

export default TagService;
