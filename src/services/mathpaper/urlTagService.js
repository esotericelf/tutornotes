/**
 * URL Tag Service for Math Papers
 * This service handles URL parameter-based tag searches and integrates with the backend TagService
 */

import TagService from './tagService';

class URLTagService {
    /**
     * Parse tags from URL parameters
     * @param {string} urlTags - Comma-separated tags from URL
     * @returns {Array<string>} Array of parsed tags
     */
    static parseTagsFromURL(urlTags) {
        if (!urlTags || typeof urlTags !== 'string') {
            return [];
        }

        return urlTags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }

    /**
     * Encode tags for URL parameters
     * @param {Array<string>} tags - Array of tags
     * @returns {string} Comma-separated tags for URL
     */
    static encodeTagsForURL(tags) {
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return '';
        }

        return tags
            .map(tag => encodeURIComponent(tag.trim()))
            .join(',');
    }

    /**
     * Search math papers by URL tags
     * @param {string} urlTags - Comma-separated tags from URL
     * @param {Object} options - Search options
     * @returns {Promise<{data: Array, error: Error, tags: Array}>}
     */
    static async searchByURLTags(urlTags, options = {}) {
        const {
            limit = 100,
            sortBy = 'year',
            sortAsc = false,
            matchType = 'OR'
        } = options;

        try {
            // Parse tags from URL
            const tags = this.parseTagsFromURL(urlTags);

            if (tags.length === 0) {
                return {
                    data: [],
                    error: null,
                    tags: [],
                    message: 'No tags provided in URL'
                };
            }

            console.log('🔍 Searching by URL tags:', tags);

            // Use the appropriate search method based on match type
            let result;
            if (matchType === 'AND') {
                result = await TagService.getMathPapersByTagsAdvanced(tags, 'AND', limit, sortBy, sortAsc);
            } else {
                result = await TagService.getMathPapersByTags(tags, limit, sortBy, sortAsc);
            }

            if (result.error) {
                console.error('Error searching by URL tags:', result.error);
                return {
                    data: null,
                    error: result.error,
                    tags: tags,
                    message: `Failed to search by tags: ${result.error.message}`
                };
            }

            console.log(`✅ Found ${result.data?.length || 0} papers for tags:`, tags);

            return {
                data: result.data || [],
                error: null,
                tags: tags,
                message: `Found ${result.data?.length || 0} papers for tags: ${tags.join(', ')}`
            };

        } catch (err) {
            console.error('Unexpected error in URL tag search:', err);
            return {
                data: null,
                error: err,
                tags: this.parseTagsFromURL(urlTags),
                message: `Unexpected error: ${err.message}`
            };
        }
    }

    /**
     * Get popular tags for URL display
     * @param {number} limit - Maximum number of tags to return
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getPopularTagsForURL(limit = 15) {
        try {
            const result = await TagService.getPopularTags(limit);

            if (result.error) {
                console.error('Error getting popular tags for URL:', result.error);
                return result;
            }

            // Transform data for URL display
            const transformedData = result.data.map(tag => ({
                ...tag,
                url: `/mathpaper?tags=${this.encodeTagsForURL([tag.tag])}`,
                encodedTag: this.encodeTagsForURL([tag.tag])
            }));

            return {
                data: transformedData,
                error: null
            };

        } catch (err) {
            console.error('Unexpected error getting popular tags for URL:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Get tag suggestions for autocomplete with URL support
     * @param {string} searchTerm - Search term for autocomplete
     * @param {number} limit - Maximum number of suggestions
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getTagSuggestionsForURL(searchTerm, limit = 20) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: [], error: null };
            }

            const result = await TagService.searchTagsAutocomplete(searchTerm.trim(), limit);

            if (result.error) {
                console.error('Error getting tag suggestions for URL:', result.error);
                return result;
            }

            // Transform data for URL display
            const transformedData = result.data.map(tag => ({
                ...tag,
                url: `/mathpaper?tags=${this.encodeTagsForURL([tag.tag])}`,
                encodedTag: this.encodeTagsForURL([tag.tag])
            }));

            return {
                data: transformedData,
                error: null
            };

        } catch (err) {
            console.error('Unexpected error getting tag suggestions for URL:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Get tag statistics for URL display
     * @param {string} tag - Tag to get statistics for
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async getTagStatisticsForURL(tag) {
        try {
            if (!tag || tag.trim().length === 0) {
                return {
                    data: null,
                    error: new Error('Tag is required')
                };
            }

            const result = await TagService.getTagStatistics(tag.trim());

            if (result.error) {
                console.error('Error getting tag statistics for URL:', result.error);
                return result;
            }

            // Add URL information to the statistics
            const enhancedData = result.data ? {
                ...result.data,
                url: `/mathpaper?tags=${this.encodeTagsForURL([tag.trim()])}`,
                encodedTag: this.encodeTagsForURL([tag.trim()])
            } : null;

            return {
                data: enhancedData,
                error: null
            };

        } catch (err) {
            console.error('Unexpected error getting tag statistics for URL:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Create URL with tags
     * @param {Array<string>} tags - Array of tags
     * @param {string} basePath - Base path (default: '/mathpaper')
     * @returns {string} Complete URL with tags
     */
    static createURLWithTags(tags, basePath = '/mathpaper') {
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return basePath;
        }

        const encodedTags = this.encodeTagsForURL(tags);
        return `${basePath}?tags=${encodedTags}`;
    }

    /**
     * Update browser URL with tags
     * @param {Array<string>} tags - Array of tags
     * @param {Object} navigate - React Router navigate function
     * @param {string} basePath - Base path (default: '/mathpaper')
     */
    static updateBrowserURL(tags, navigate, basePath = '/mathpaper') {
        if (!navigate || typeof navigate !== 'function') {
            console.warn('Navigate function not provided');
            return;
        }

        const url = this.createURLWithTags(tags, basePath);
        navigate(url, { replace: false });
    }

    /**
     * Handle tag click for URL navigation
     * @param {string} tag - Tag that was clicked
     * @param {Array<string>} currentTags - Current selected tags
     * @param {Object} navigate - React Router navigate function
     * @param {boolean} addToExisting - Whether to add to existing tags or replace
     */
    static handleTagClick(tag, currentTags = [], navigate, addToExisting = false) {
        if (!navigate || typeof navigate !== 'function') {
            console.warn('Navigate function not provided');
            return;
        }

        let newTags;
        if (addToExisting) {
            // Add to existing tags if not already present
            newTags = currentTags.includes(tag)
                ? currentTags.filter(t => t !== tag) // Remove if already present
                : [...currentTags, tag]; // Add if not present
        } else {
            // Replace with single tag
            newTags = [tag];
        }

        this.updateBrowserURL(newTags, navigate);
    }
}

export default URLTagService;
