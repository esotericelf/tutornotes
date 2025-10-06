/**
 * Unified Tag Service for Math Papers
 * Consolidates all tag-related functionality with caching and validation
 */

import BaseService from './BaseService';
import TagCacheService from './tagCacheService';
import TagValidationService from './tagValidationService';
import { supabase } from '../supabase';

class UnifiedTagService extends BaseService {
    /**
     * Get popular tags with caching
     * @param {number} limit - Maximum number of tags to return (default: 15)
     * @returns {Promise<{data: Array, error: Error|null, fromCache: boolean}>}
     */
    static async getPopularTags(limit = 15) {
        try {
            // Validate parameters
            const validation = TagValidationService.validateSearchParams({ limit });
            if (!validation.isValid) {
                return { data: null, error: new Error(validation.errors.join(', ')), fromCache: false };
            }

            // Check cache first
            const cached = TagCacheService.getCachedPopularTags();
            if (cached) {
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            // Fetch from database
            const result = await this.executeRPC('get_popular_math_paper_tags', {
                limit_count: limit
            });

            if (result.error) {
                return { data: null, error: result.error, fromCache: false };
            }

            // Transform data to match frontend expectations
            const transformedData = result.data.map(tag => ({
                topic: 'General',
                tag: tag.tag,
                count: tag.count
            }));

            // Cache the results
            TagCacheService.cachePopularTags(transformedData);

            return { data: transformedData, error: null, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting popular tags:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Get popular Chinese tags with caching
     * @param {number} limit - Maximum number of tags to return (default: 15)
     * @returns {Promise<{data: Array, error: Error|null, fromCache: boolean}>}
     */
    static async getPopularTagsChinese(limit = 15) {
        try {
            // Validate parameters
            const validation = TagValidationService.validateSearchParams({ limit });
            if (!validation.isValid) {
                return { data: null, error: new Error(validation.errors.join(', ')), fromCache: false };
            }

            // Check cache first
            const cached = TagCacheService.getCachedPopularTagsChinese();
            if (cached) {
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            // Fetch from database using Chinese function
            const result = await this.executeRPC('get_popular_math_paper_tags_zh', {
                limit_count: limit
            });

            if (result.error) {
                return { data: null, error: result.error, fromCache: false };
            }

            // Transform data to match frontend expectations
            const transformedData = result.data.map(tag => ({
                topic: 'General',
                tag: tag.tag,
                count: tag.count
            }));

            // Cache the results
            TagCacheService.cachePopularTagsChinese(transformedData);

            return { data: transformedData, error: null, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting popular Chinese tags:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Search math papers by Chinese tags
     * @param {Array} searchTags - Array of Chinese tags to search for
     * @param {number} limit - Maximum number of results to return (default: 100)
     * @param {string} sortBy - Sort field (default: 'year')
     * @param {boolean} sortAsc - Sort ascending (default: false)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async searchByChineseTags(searchTags, limit = 100, sortBy = 'year', sortAsc = false) {
        try {
            // Validate parameters
            const validation = TagValidationService.validateSearchParams({
                searchTags,
                limit,
                sortBy,
                sortAsc
            });
            if (!validation.isValid) {
                return { data: null, error: new Error(validation.errors.join(', ')) };
            }

            // Execute Chinese tag search function
            const result = await this.executeRPC('get_math_papers_by_tags_zh', {
                search_tags: searchTags,
                limit_count: limit,
                sort_by: sortBy,
                sort_asc: sortAsc
            });

            if (result.error) {
                return { data: null, error: result.error };
            }

            return { data: result.data, error: null };
        } catch (err) {
            console.error('Unexpected error searching by Chinese tags:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Search math papers by Chinese tags with pagination
     * @param {Array} searchTags - Array of Chinese tags to search for
     * @param {number} pageNumber - Page number (default: 1)
     * @param {number} pageSize - Number of items per page (default: 10)
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async searchByChineseTagsPaginated(searchTags, pageNumber = 1, pageSize = 10) {
        try {
            // Validate parameters
            const validation = TagValidationService.validateSearchParams({
                searchTags,
                pageNumber,
                pageSize
            });
            if (!validation.isValid) {
                return { data: null, error: new Error(validation.errors.join(', ')) };
            }

            // Execute Chinese paginated tag search function
            const result = await this.executeRPC('search_math_papers_by_tags_paginated_zh', {
                search_tags: searchTags,
                page_number: pageNumber,
                page_size: pageSize
            });

            if (result.error) {
                return { data: null, error: result.error };
            }

            return { data: result.data[0], error: null }; // Function returns array with single object
        } catch (err) {
            console.error('Unexpected error searching by Chinese tags with pagination:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get all available tags with usage statistics
     * @param {number} limit - Maximum number of tags to return (default: 100)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getAllTagsWithCounts(limit = 100) {
        try {
            const validation = TagValidationService.validateSearchParams({ limit });
            if (!validation.isValid) {
                return { data: null, error: new Error(validation.errors.join(', ')) };
            }

            const result = await this.executeRPC('get_all_tags_with_counts', {
                limit_count: limit
            });

            return result;
        } catch (err) {
            console.error('Unexpected error getting all tags with counts:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Search tags with autocomplete functionality and caching
     * @param {string} searchTerm - Search term to match against tags
     * @param {number} limit - Maximum number of results (default: 20)
     * @returns {Promise<{data: Array, error: Error|null, fromCache: boolean}>}
     */
    static async searchTagsAutocomplete(searchTerm, limit = 20) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: [], error: null, fromCache: false };
            }

            const trimmedTerm = searchTerm.trim();

            // Check cache first
            const cached = TagCacheService.getCachedAutocompleteResults(trimmedTerm);
            if (cached) {
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            const result = await this.executeRPC('search_tags_autocomplete', {
                search_term: trimmedTerm,
                limit_count: limit
            });

            if (result.error) {
                return { data: null, error: result.error, fromCache: false };
            }

            // Cache the results
            TagCacheService.cacheAutocompleteResults(trimmedTerm, result.data);

            return { data: result.data, error: null, fromCache: false };
        } catch (err) {
            console.error('Unexpected error searching tags autocomplete:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Get math papers by tags with caching
     * @param {Array<string>} tags - Array of tags to search for
     * @param {number} limit - Maximum number of results (default: 100)
     * @param {string} sortBy - Sort field (default: 'year')
     * @param {boolean} sortAsc - Sort ascending (default: false)
     * @returns {Promise<{data: Array, error: Error|null, fromCache: boolean}>}
     */
    static async getMathPapersByTags(tags, limit = 100, sortBy = 'year', sortAsc = false) {
        try {
            console.log('🔍 UnifiedTagService: getMathPapersByTags called with:', { tags, limit, sortBy, sortAsc });

            // Validate tags
            const tagValidation = TagValidationService.validateTags(tags);
            console.log('🔍 UnifiedTagService: Tag validation result:', tagValidation);

            if (!tagValidation.isValid) {
                console.error('🔍 UnifiedTagService: Tag validation failed:', tagValidation.errors);
                return { data: null, error: new Error(tagValidation.errors.join(', ')), fromCache: false };
            }

            if (tagValidation.validTags.length === 0) {
                console.log('🔍 UnifiedTagService: No valid tags, returning empty array');
                return { data: [], error: null, fromCache: false };
            }

            const options = { limit, sortBy, sortAsc };

            // Check cache first
            const cached = TagCacheService.getCachedSearchResults(tagValidation.validTags, options);
            if (cached) {
                console.log('🔍 UnifiedTagService: Found cached results:', cached.length, 'items');
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            console.log('🔍 UnifiedTagService: Calling RPC with params:', {
                search_tags: tagValidation.validTags,
                limit_count: limit,
                sort_by: sortBy,
                sort_asc: sortAsc
            });

            const result = await this.executeRPC('get_math_papers_by_tags_v3', {
                search_tags: tagValidation.validTags,
                limit_count: limit,
                sort_by: sortBy,
                sort_asc: sortAsc
            });

            console.log('🔍 UnifiedTagService: RPC result:', result);

            if (result.error) {
                console.error('🔍 UnifiedTagService: RPC error:', result.error);
                return { data: null, error: result.error, fromCache: false };
            }

            // Cache the results
            TagCacheService.cacheSearchResults(tagValidation.validTags, result.data, options);

            console.log('🔍 UnifiedTagService: Returning data:', result.data?.length || 0, 'items');
            return { data: result.data, error: null, fromCache: false };
        } catch (err) {
            console.error('🔍 UnifiedTagService: Unexpected error:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Get math papers by exact tag match
     * @param {Array<string>} tags - Array of tags to search for (exact match)
     * @param {number} limit - Maximum number of results (default: 100)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getMathPapersByExactTags(tags, limit = 100) {
        try {
            const tagValidation = TagValidationService.validateTags(tags);
            if (!tagValidation.isValid) {
                return { data: null, error: new Error(tagValidation.errors.join(', ')) };
            }

            if (tagValidation.validTags.length === 0) {
                return { data: [], error: null };
            }

            const result = await this.executeRPC('get_math_papers_by_exact_tags_v3', {
                search_tags: tagValidation.validTags,
                limit_count: limit
            });

            return result;
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
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getMathPapersByTagsAdvanced(tags, matchType = 'OR', limit = 100, sortBy = 'year', sortAsc = false) {
        try {
            const tagValidation = TagValidationService.validateTags(tags);
            if (!tagValidation.isValid) {
                return { data: null, error: new Error(tagValidation.errors.join(', ')) };
            }

            if (tagValidation.validTags.length === 0) {
                return { data: [], error: null };
            }

            const result = await this.executeRPC('get_math_papers_by_tags_advanced_v3', {
                search_tags: tagValidation.validTags,
                match_type: matchType,
                limit_count: limit,
                sort_by: sortBy,
                sort_asc: sortAsc
            });

            return result;
        } catch (err) {
            console.error('Unexpected error getting math papers by tags advanced:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get tag statistics with caching
     * @param {string} tag - Tag to get statistics for
     * @returns {Promise<{data: Object, error: Error|null, fromCache: boolean}>}
     */
    static async getTagStatistics(tag) {
        try {
            const tagValidation = TagValidationService.validateTag(tag);
            if (!tagValidation.isValid) {
                return {
                    data: null,
                    error: new Error(tagValidation.errors.join(', ')),
                    fromCache: false
                };
            }

            // Check cache first
            const cached = TagCacheService.getCachedTagStatistics(tagValidation.normalizedTag);
            if (cached) {
                return {
                    data: cached,
                    error: null,
                    fromCache: true
                };
            }

            const result = await this.executeRPC('get_tag_statistics', {
                target_tag: tagValidation.normalizedTag
            });

            if (result.error) {
                return { data: null, error: result.error, fromCache: false };
            }

            const statistics = result.data?.[0] || null;

            // Cache the results
            if (statistics) {
                TagCacheService.cacheTagStatistics(tagValidation.normalizedTag, statistics);
            }

            return { data: statistics, error: null, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting tag statistics:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Get available tags from questions (fallback method)
     * @param {number} limit - Maximum number of tags to return
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getAvailableTagsFromQuestions(limit = 100) {
        try {
            const result = await this.executeQuery(
                supabase
                    .from('Math_Past_Paper')
                    .select('tags')
                    .not('tags', 'is', null)
                    .limit(limit * 2)
            );

            if (result.error) {
                return { data: null, error: result.error };
            }

            // Extract unique tags
            const allTags = new Set();
            result.data.forEach(question => {
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

    /**
     * Search math papers with pagination
     * @param {Object} options - Search options
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async searchMathPapersPaginated(options = {}) {
        try {
            const {
                filterYear = null,
                filterPaper = null,
                filterQuestionNo = null,
                searchTags = null,
                page = 1,
                pageSize = 10
            } = options;

            const result = await this.executeRPC('search_math_papers_paginated', {
                filter_year: filterYear,
                filter_paper: filterPaper,
                filter_question_no: filterQuestionNo,
                search_tags: searchTags,
                page_number: page,
                page_size: pageSize
            });

            return result;
        } catch (err) {
            console.error('Unexpected error in paginated search:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Search math papers by tags with pagination
     * @param {Array<string>} searchTags - Array of tags to search for
     * @param {number} page - Page number (1-based)
     * @param {number} pageSize - Number of items per page
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async searchByTagsPaginated(searchTags, page = 1, pageSize = 10) {
        try {
            const tagValidation = TagValidationService.validateTags(searchTags);
            if (!tagValidation.isValid) {
                return { data: null, error: new Error(tagValidation.errors.join(', ')) };
            }

            const result = await this.executeRPC('search_math_papers_by_tags_paginated', {
                search_tags: tagValidation.validTags,
                page_number: page,
                page_size: pageSize
            });

            return result;
        } catch (err) {
            console.error('Unexpected error in tag paginated search:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Cache management methods
     */
    static getCacheStats() {
        return TagCacheService.getStats();
    }

    static clearCache() {
        TagCacheService.clear();
    }

    static cleanExpiredCache() {
        TagCacheService.cleanExpired();
    }

    static invalidateTagCache(tag) {
        TagCacheService.invalidateTagCache(tag);
    }

    static invalidateSearchCache() {
        TagCacheService.invalidateSearchCache();
    }

    /**
     * Preload cache with popular data
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    static async preloadCache() {
        try {
            console.log('🚀 Starting cache preload...');

            // Preload popular tags
            await TagCacheService.preloadPopularTags(async () => {
                const result = await this.getPopularTags(15);
                return result.data || [];
            });

            // Get popular tags for statistics preload
            const popularTagsResult = await this.getPopularTags(5);
            if (popularTagsResult.data) {
                await TagCacheService.preloadTagStatistics(
                    popularTagsResult.data,
                    async (tag) => {
                        const result = await this.getTagStatistics(tag);
                        return result.data;
                    }
                );
            }

            console.log('🚀 Cache preload completed successfully');
            return { success: true, error: null };
        } catch (err) {
            console.error('🚀 Error during cache preload:', err);
            return { success: false, error: err };
        }
    }
}

export default UnifiedTagService;
