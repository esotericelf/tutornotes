/**
 * Unified URL Service for Math Papers
 * Handles URL operations for both tags and questions
 */

import UnifiedTagService from './UnifiedTagService';
import UnifiedQuestionService from './UnifiedQuestionService';

class UnifiedURLService {
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
     * @returns {Promise<{data: Array, error: Error|null, tags: Array, message: string}>}
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
                result = await UnifiedTagService.getMathPapersByTagsAdvanced(tags, 'AND', limit, sortBy, sortAsc);
            } else {
                result = await UnifiedTagService.getMathPapersByTags(tags, limit, sortBy, sortAsc);
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
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getPopularTagsForURL(limit = 15) {
        try {
            const result = await UnifiedTagService.getPopularTags(limit);

            if (result.error) {
                console.error('Error getting popular tags for URL:', result.error);
                return result;
            }

            // Transform data for URL display
            const transformedData = result.data.map(tag => ({
                ...tag,
                url: `/DSE_Math?tags=${this.encodeTagsForURL([tag.tag])}`,
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
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async getTagSuggestionsForURL(searchTerm, limit = 20) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: [], error: null };
            }

            const result = await UnifiedTagService.searchTagsAutocomplete(searchTerm.trim(), limit);

            if (result.error) {
                console.error('Error getting tag suggestions for URL:', result.error);
                return result;
            }

            // Transform data for URL display
            const transformedData = result.data.map(tag => ({
                ...tag,
                url: `/DSE_Math?tags=${this.encodeTagsForURL([tag.tag])}`,
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
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getTagStatisticsForURL(tag) {
        try {
            if (!tag || tag.trim().length === 0) {
                return {
                    data: null,
                    error: new Error('Tag is required')
                };
            }

            const result = await UnifiedTagService.getTagStatistics(tag.trim());

            if (result.error) {
                console.error('Error getting tag statistics for URL:', result.error);
                return result;
            }

            // Add URL information to the statistics
            const enhancedData = result.data ? {
                ...result.data,
                url: `/DSE_Math?tags=${this.encodeTagsForURL([tag.trim()])}`,
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
     * @param {string} basePath - Base path (default: '/DSE_Math')
     * @returns {string} Complete URL with tags
     */
    static createURLWithTags(tags, basePath = '/DSE_Math') {
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
     * @param {string} basePath - Base path (default: '/DSE_Math')
     */
    static updateBrowserURL(tags, navigate, basePath = '/DSE_Math') {
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

    /**
     * Question URL methods (delegate to UnifiedQuestionService)
     */
    static generateQuestionURL(year, paper, questionNo) {
        return UnifiedQuestionService.generateQuestionURL(year, paper, questionNo);
    }

    static parseQuestionURL(urlPath) {
        return UnifiedQuestionService.parseQuestionURL(urlPath);
    }

    static isValidQuestionParams(year, paper, questionNo) {
        return UnifiedQuestionService.isValidQuestionParams(year, paper, questionNo);
    }

    static getQuestionParamsFromRouter(params) {
        return UnifiedQuestionService.getQuestionParamsFromRouter(params);
    }

    static createQuestionFromParams(params) {
        return UnifiedQuestionService.createQuestionFromParams(params);
    }

    static isQuestionURL(urlPath) {
        return UnifiedQuestionService.isQuestionURL(urlPath);
    }

    static getValidYears() {
        return UnifiedQuestionService.getValidYears();
    }

    static getValidQuestionNumbers(paper) {
        return UnifiedQuestionService.getValidQuestionNumbers(paper);
    }

    static generateAllQuestionURLs() {
        return UnifiedQuestionService.generateAllQuestionURLs();
    }

    /**
     * Combined URL operations
     */
    static async loadQuestionFromURL(urlPath) {
        return UnifiedQuestionService.loadQuestionFromURL(urlPath);
    }

    static async loadQuestionFromParams(params) {
        return UnifiedQuestionService.loadQuestionFromParams(params);
    }

    /**
     * URL validation and sanitization
     */
    static validateURLParams(urlTags) {
        const errors = [];
        const warnings = [];

        if (urlTags && typeof urlTags !== 'string') {
            errors.push('URL tags parameter must be a string');
            return { isValid: false, errors, warnings, parsedTags: [] };
        }

        let parsedTags = [];
        if (urlTags && urlTags.trim().length > 0) {
            parsedTags = urlTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Validate parsed tags
        const validTags = [];
        const invalidTags = [];

        parsedTags.forEach((tag, index) => {
            if (tag.length < 2) {
                invalidTags.push({ tag, index, error: 'Tag too short' });
            } else if (tag.length > 50) {
                invalidTags.push({ tag, index, error: 'Tag too long' });
            } else {
                validTags.push(tag);
            }
        });

        if (invalidTags.length > 0) {
            errors.push(...invalidTags.map(({ tag, index, error }) =>
                `Tag ${index + 1} ("${tag}"): ${error}`
            ));
        }

        if (validTags.length > 10) {
            errors.push('Cannot search for more than 10 tags at once');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            parsedTags: validTags
        };
    }

    /**
     * Create breadcrumb navigation from URL
     * @param {string} urlPath - Current URL path
     * @returns {Array} Breadcrumb items
     */
    static createBreadcrumbs(urlPath) {
        const breadcrumbs = [
            { label: 'Home', url: '/' },
            { label: 'DSE Math', url: '/DSE_Math' }
        ];

        if (!urlPath) return breadcrumbs;

        // Check if it's a question URL
        const questionParams = this.parseQuestionURL(urlPath);
        if (questionParams) {
            breadcrumbs.push({
                label: `${questionParams.year} Paper ${questionParams.paper}`,
                url: `/DSE_Math/${questionParams.year}/${questionParams.paper}`
            });
            breadcrumbs.push({
                label: `Question ${questionParams.questionNo}`,
                url: urlPath
            });
            return breadcrumbs;
        }

        // Check if it's a tag search URL
        const url = new URL(urlPath, window.location.origin);
        const tags = url.searchParams.get('tags');
        if (tags) {
            const parsedTags = this.parseTagsFromURL(tags);
            if (parsedTags.length > 0) {
                breadcrumbs.push({
                    label: `Search: ${parsedTags.join(', ')}`,
                    url: urlPath
                });
            }
        }

        return breadcrumbs;
    }
}

export default UnifiedURLService;
