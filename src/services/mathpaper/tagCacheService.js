/**
 * Tag Cache Service for Math Papers
 * This service provides caching functionality to improve performance
 */

class TagCacheService {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.maxCacheSize = 100; // Maximum number of cached items
    }

    /**
     * Generate cache key for tag-related operations
     * @param {string} operation - Operation type
     * @param {*} params - Parameters for the operation
     * @returns {string} Cache key
     */
    generateCacheKey(operation, params) {
        const paramString = typeof params === 'object'
            ? JSON.stringify(params)
            : String(params);
        return `${operation}:${paramString}`;
    }

    /**
     * Get item from cache
     * @param {string} key - Cache key
     * @returns {*} Cached item or null if not found/expired
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const timestamp = this.cacheTimestamps.get(key);
        const now = Date.now();

        // Check if cache item has expired
        if (now - timestamp > this.defaultTTL) {
            this.delete(key);
            return null;
        }

        console.log(`📦 Cache hit for key: ${key}`);
        return this.cache.get(key);
    }

    /**
     * Set item in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, value, ttl = this.defaultTTL) {
        // Check cache size limit
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldest();
        }

        this.cache.set(key, value);
        this.cacheTimestamps.set(key, Date.now());
        console.log(`📦 Cached item with key: ${key} (TTL: ${ttl}ms)`);
    }

    /**
     * Delete item from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        console.log(`📦 Deleted cache item: ${key}`);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.cacheTimestamps.clear();
        console.log('📦 Cache cleared');
    }

    /**
     * Evict oldest cache item
     */
    evictOldest() {
        if (this.cache.size === 0) return;

        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, timestamp] of this.cacheTimestamps.entries()) {
            if (timestamp < oldestTime) {
                oldestTime = timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const now = Date.now();
        let expiredCount = 0;
        let validCount = 0;

        for (const [key, timestamp] of this.cacheTimestamps.entries()) {
            if (now - timestamp > this.defaultTTL) {
                expiredCount++;
            } else {
                validCount++;
            }
        }

        return {
            totalItems: this.cache.size,
            validItems: validCount,
            expiredItems: expiredCount,
            maxSize: this.maxCacheSize,
            defaultTTL: this.defaultTTL,
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * Calculate cache hit rate (simplified)
     * @returns {number} Hit rate percentage
     */
    calculateHitRate() {
        // This is a simplified calculation
        // In a real implementation, you'd track hits and misses
        const validItems = this.getStats().validItems;
        const totalItems = this.cache.size;
        return totalItems > 0 ? (validItems / totalItems * 100).toFixed(1) : 0;
    }

    /**
     * Clean expired items from cache
     */
    cleanExpired() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, timestamp] of this.cacheTimestamps.entries()) {
            if (now - timestamp > this.defaultTTL) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.delete(key));

        if (expiredKeys.length > 0) {
            console.log(`📦 Cleaned ${expiredKeys.length} expired cache items`);
        }
    }

    /**
     * Cache popular tags with extended TTL
     * @param {Array} popularTags - Popular tags data
     */
    cachePopularTags(popularTags) {
        const key = this.generateCacheKey('popular_tags', {});
        const extendedTTL = 30 * 60 * 1000; // 30 minutes for popular tags
        this.set(key, popularTags, extendedTTL);
    }

    /**
     * Cache tag statistics with extended TTL
     * @param {string} tag - Tag name
     * @param {Object} statistics - Tag statistics
     */
    cacheTagStatistics(tag, statistics) {
        const key = this.generateCacheKey('tag_statistics', { tag });
        const extendedTTL = 15 * 60 * 1000; // 15 minutes for tag statistics
        this.set(key, statistics, extendedTTL);
    }

    /**
     * Cache tag analytics with extended TTL
     * @param {string} tag - Tag name
     * @param {Object} analytics - Tag analytics
     */
    cacheTagAnalytics(tag, analytics) {
        const key = this.generateCacheKey('tag_analytics', { tag });
        const extendedTTL = 20 * 60 * 1000; // 20 minutes for tag analytics
        this.set(key, analytics, extendedTTL);
    }

    /**
     * Cache search results with shorter TTL
     * @param {Array} tags - Search tags
     * @param {Array} results - Search results
     * @param {Object} options - Search options
     */
    cacheSearchResults(tags, results, options = {}) {
        const key = this.generateCacheKey('search_results', { tags, options });
        const shortTTL = 2 * 60 * 1000; // 2 minutes for search results
        this.set(key, results, shortTTL);
    }

    /**
     * Cache autocomplete results with medium TTL
     * @param {string} searchTerm - Search term
     * @param {Array} results - Autocomplete results
     */
    cacheAutocompleteResults(searchTerm, results) {
        const key = this.generateCacheKey('autocomplete', { searchTerm });
        const mediumTTL = 10 * 60 * 1000; // 10 minutes for autocomplete
        this.set(key, results, mediumTTL);
    }

    /**
     * Get cached popular tags
     * @returns {Array|null} Cached popular tags or null
     */
    getCachedPopularTags() {
        const key = this.generateCacheKey('popular_tags', {});
        return this.get(key);
    }

    /**
     * Get cached tag statistics
     * @param {string} tag - Tag name
     * @returns {Object|null} Cached tag statistics or null
     */
    getCachedTagStatistics(tag) {
        const key = this.generateCacheKey('tag_statistics', { tag });
        return this.get(key);
    }

    /**
     * Get cached tag analytics
     * @param {string} tag - Tag name
     * @returns {Object|null} Cached tag analytics or null
     */
    getCachedTagAnalytics(tag) {
        const key = this.generateCacheKey('tag_analytics', { tag });
        return this.get(key);
    }

    /**
     * Get cached search results
     * @param {Array} tags - Search tags
     * @param {Object} options - Search options
     * @returns {Array|null} Cached search results or null
     */
    getCachedSearchResults(tags, options = {}) {
        const key = this.generateCacheKey('search_results', { tags, options });
        return this.get(key);
    }

    /**
     * Get cached autocomplete results
     * @param {string} searchTerm - Search term
     * @returns {Array|null} Cached autocomplete results or null
     */
    getCachedAutocompleteResults(searchTerm) {
        const key = this.generateCacheKey('autocomplete', { searchTerm });
        return this.get(key);
    }

    /**
     * Invalidate cache for specific tag
     * @param {string} tag - Tag to invalidate cache for
     */
    invalidateTagCache(tag) {
        const patterns = [
            this.generateCacheKey('tag_statistics', { tag }),
            this.generateCacheKey('tag_analytics', { tag }),
            this.generateCacheKey('search_results', { tags: [tag] }),
            this.generateCacheKey('search_results', { tags: [tag], options: {} })
        ];

        patterns.forEach(key => {
            if (this.cache.has(key)) {
                this.delete(key);
            }
        });

        console.log(`📦 Invalidated cache for tag: ${tag}`);
    }

    /**
     * Invalidate all search-related cache
     */
    invalidateSearchCache() {
        const keysToDelete = [];

        for (const key of this.cache.keys()) {
            if (key.startsWith('search_results:') || key.startsWith('autocomplete:')) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));

        if (keysToDelete.length > 0) {
            console.log(`📦 Invalidated ${keysToDelete.length} search cache items`);
        }
    }

    /**
     * Preload popular tags into cache
     * @param {Function} fetchFunction - Function to fetch popular tags
     */
    async preloadPopularTags(fetchFunction) {
        try {
            console.log('📦 Preloading popular tags into cache...');
            const popularTags = await fetchFunction();
            this.cachePopularTags(popularTags);
            console.log('📦 Popular tags preloaded successfully');
        } catch (error) {
            console.error('📦 Error preloading popular tags:', error);
        }
    }

    /**
     * Preload tag statistics for popular tags
     * @param {Array} popularTags - Array of popular tags
     * @param {Function} fetchFunction - Function to fetch tag statistics
     */
    async preloadTagStatistics(popularTags, fetchFunction) {
        try {
            console.log('📦 Preloading tag statistics into cache...');
            const preloadPromises = popularTags.slice(0, 5).map(async (tagData) => {
                const statistics = await fetchFunction(tagData.tag);
                this.cacheTagStatistics(tagData.tag, statistics);
            });

            await Promise.all(preloadPromises);
            console.log('📦 Tag statistics preloaded successfully');
        } catch (error) {
            console.error('📦 Error preloading tag statistics:', error);
        }
    }
}

// Create a singleton instance
const tagCacheService = new TagCacheService();

export default tagCacheService;
