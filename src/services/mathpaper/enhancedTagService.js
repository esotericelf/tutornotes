/**
 * Enhanced Tag Service for Math Papers with Caching
 * This service provides optimized tag operations with intelligent caching
 */

import TagService from './tagService';
import tagCacheService from './tagCacheService';

class EnhancedTagService {
    /**
     * Get popular tags with caching
     * @param {number} limit - Maximum number of tags to return (default: 15)
     * @returns {Promise<{data: Array, error: Error, fromCache: boolean}>}
     */
    static async getPopularTags(limit = 15) {
        try {
            // Check cache first
            const cached = tagCacheService.getCachedPopularTags();
            if (cached) {
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            // Fetch from service if not in cache
            const result = await TagService.getPopularTags(limit);

            if (result.error) {
                return { ...result, fromCache: false };
            }

            // Cache the results
            tagCacheService.cachePopularTags(result.data);

            return { ...result, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting popular tags:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Search tags with autocomplete and caching
     * @param {string} searchTerm - Search term to match against tags
     * @param {number} limit - Maximum number of results (default: 20)
     * @returns {Promise<{data: Array, error: Error, fromCache: boolean}>}
     */
    static async searchTagsAutocomplete(searchTerm, limit = 20) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: [], error: null, fromCache: false };
            }

            // Check cache first
            const cached = tagCacheService.getCachedAutocompleteResults(searchTerm);
            if (cached) {
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            // Fetch from service if not in cache
            const result = await TagService.searchTagsAutocomplete(searchTerm.trim(), limit);

            if (result.error) {
                return { ...result, fromCache: false };
            }

            // Cache the results
            tagCacheService.cacheAutocompleteResults(searchTerm.trim(), result.data);

            return { ...result, fromCache: false };
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
     * @returns {Promise<{data: Array, error: Error, fromCache: boolean}>}
     */
    static async getMathPapersByTags(tags, limit = 100, sortBy = 'year', sortAsc = false) {
        try {
            if (!tags || tags.length === 0) {
                return { data: [], error: null, fromCache: false };
            }

            const options = { limit, sortBy, sortAsc };

            // Check cache first
            const cached = tagCacheService.getCachedSearchResults(tags, options);
            if (cached) {
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true
                };
            }

            // Fetch from service if not in cache
            const result = await TagService.getMathPapersByTags(tags, limit, sortBy, sortAsc);

            if (result.error) {
                return { ...result, fromCache: false };
            }

            // Cache the results
            tagCacheService.cacheSearchResults(tags, result.data, options);

            return { ...result, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting math papers by tags:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Get tag statistics with caching
     * @param {string} tag - Tag to get statistics for
     * @returns {Promise<{data: Object, error: Error, fromCache: boolean}>}
     */
    static async getTagStatistics(tag) {
        try {
            if (!tag || tag.trim().length === 0) {
                return {
                    data: null,
                    error: new Error('Tag is required'),
                    fromCache: false
                };
            }

            // Check cache first
            const cached = tagCacheService.getCachedTagStatistics(tag.trim());
            if (cached) {
                return {
                    data: cached,
                    error: null,
                    fromCache: true
                };
            }

            // Fetch from service if not in cache
            const result = await TagService.getTagStatistics(tag.trim());

            if (result.error) {
                return { ...result, fromCache: false };
            }

            // Cache the results
            tagCacheService.cacheTagStatistics(tag.trim(), result.data);

            return { ...result, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting tag statistics:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Get tag analytics with caching
     * @param {string} tag - Tag to analyze
     * @returns {Promise<{data: Object, error: Error, fromCache: boolean}>}
     */
    static async getTagAnalytics(tag) {
        try {
            if (!tag || tag.trim().length === 0) {
                return {
                    data: null,
                    error: new Error('Tag is required for analytics'),
                    fromCache: false
                };
            }

            // Check cache first
            const cached = tagCacheService.getCachedTagAnalytics(tag.trim());
            if (cached) {
                return {
                    data: cached,
                    error: null,
                    fromCache: true
                };
            }

            // Import TagAnalyticsService dynamically to avoid circular dependencies
            const { default: TagAnalyticsService } = await import('./tagAnalyticsService');

            // Fetch from service if not in cache
            const result = await TagAnalyticsService.getTagAnalytics(tag.trim());

            if (result.error) {
                return { ...result, fromCache: false };
            }

            // Cache the results
            tagCacheService.cacheTagAnalytics(tag.trim(), result.data);

            return { ...result, fromCache: false };
        } catch (err) {
            console.error('Unexpected error getting tag analytics:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Preload cache with popular data
     * @returns {Promise<{success: boolean, error: Error}>}
     */
    static async preloadCache() {
        try {
            console.log('🚀 Starting cache preload...');

            // Preload popular tags
            await tagCacheService.preloadPopularTags(async () => {
                const result = await TagService.getPopularTags(15);
                return result.data || [];
            });

            // Get popular tags for statistics preload
            const popularTagsResult = await TagService.getPopularTags(5);
            if (popularTagsResult.data) {
                await tagCacheService.preloadTagStatistics(
                    popularTagsResult.data,
                    async (tag) => {
                        const result = await TagService.getTagStatistics(tag);
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

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    static getCacheStats() {
        return tagCacheService.getStats();
    }

    /**
     * Clear cache
     */
    static clearCache() {
        tagCacheService.clear();
    }

    /**
     * Clean expired cache items
     */
    static cleanExpiredCache() {
        tagCacheService.cleanExpired();
    }

    /**
     * Invalidate cache for specific tag
     * @param {string} tag - Tag to invalidate cache for
     */
    static invalidateTagCache(tag) {
        tagCacheService.invalidateTagCache(tag);
    }

    /**
     * Invalidate all search cache
     */
    static invalidateSearchCache() {
        tagCacheService.invalidateSearchCache();
    }

    /**
     * Batch get multiple tag statistics with caching
     * @param {Array<string>} tags - Array of tags to get statistics for
     * @returns {Promise<{data: Array, error: Error, fromCache: boolean}>}
     */
    static async batchGetTagStatistics(tags) {
        try {
            if (!tags || tags.length === 0) {
                return { data: [], error: null, fromCache: false };
            }

            const results = [];
            let fromCache = true;

            // Check cache for all tags first
            for (const tag of tags) {
                const cached = tagCacheService.getCachedTagStatistics(tag);
                if (cached) {
                    results.push({ tag, data: cached, fromCache: true });
                } else {
                    fromCache = false;
                    break; // If any tag is not cached, fetch all
                }
            }

            // If all tags are cached, return cached results
            if (fromCache && results.length === tags.length) {
                return {
                    data: results,
                    error: null,
                    fromCache: true
                };
            }

            // Fetch all tags from service
            const fetchPromises = tags.map(async (tag) => {
                const result = await TagService.getTagStatistics(tag);
                return { tag, data: result.data, error: result.error };
            });

            const fetchedResults = await Promise.all(fetchPromises);

            // Cache the results
            fetchedResults.forEach(({ tag, data, error }) => {
                if (!error && data) {
                    tagCacheService.cacheTagStatistics(tag, data);
                }
            });

            return {
                data: fetchedResults,
                error: null,
                fromCache: false
            };
        } catch (err) {
            console.error('Unexpected error in batch get tag statistics:', err);
            return { data: null, error: err, fromCache: false };
        }
    }

    /**
     * Smart search with caching and fallback
     * @param {Array<string>} tags - Array of tags to search for
     * @param {Object} options - Search options
     * @returns {Promise<{data: Array, error: Error, fromCache: boolean, performance: Object}>}
     */
    static async smartSearch(tags, options = {}) {
        const startTime = Date.now();

        try {
            if (!tags || tags.length === 0) {
                return {
                    data: [],
                    error: null,
                    fromCache: false,
                    performance: { duration: Date.now() - startTime }
                };
            }

            const { limit = 100, sortBy = 'year', sortAsc = false } = options;

            // Check cache first
            const cached = tagCacheService.getCachedSearchResults(tags, options);
            if (cached) {
                const duration = Date.now() - startTime;
                return {
                    data: cached.slice(0, limit),
                    error: null,
                    fromCache: true,
                    performance: { duration, cacheHit: true }
                };
            }

            // Fetch from service if not in cache
            const result = await TagService.getMathPapersByTags(tags, limit, sortBy, sortAsc);

            const duration = Date.now() - startTime;

            if (result.error) {
                return {
                    ...result,
                    fromCache: false,
                    performance: { duration, cacheHit: false }
                };
            }

            // Cache the results
            tagCacheService.cacheSearchResults(tags, result.data, options);

            return {
                ...result,
                fromCache: false,
                performance: { duration, cacheHit: false }
            };
        } catch (err) {
            console.error('Unexpected error in smart search:', err);
            const duration = Date.now() - startTime;
            return {
                data: null,
                error: err,
                fromCache: false,
                performance: { duration, cacheHit: false }
            };
        }
    }
}

export default EnhancedTagService;
