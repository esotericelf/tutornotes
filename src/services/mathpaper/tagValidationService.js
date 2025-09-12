/**
 * Tag Validation Service for Math Papers
 * This service provides comprehensive validation and error handling for tag operations
 */

class TagValidationService {
    /**
     * Validate tag name
     * @param {string} tag - Tag to validate
     * @returns {Object} Validation result
     */
    static validateTag(tag) {
        const errors = [];
        const warnings = [];

        // Check if tag exists
        if (!tag) {
            errors.push('Tag is required');
            return { isValid: false, errors, warnings };
        }

        // Check if tag is a string
        if (typeof tag !== 'string') {
            errors.push('Tag must be a string');
            return { isValid: false, errors, warnings };
        }

        const trimmedTag = tag.trim();

        // Check if tag is empty after trimming
        if (trimmedTag.length === 0) {
            errors.push('Tag cannot be empty');
            return { isValid: false, errors, warnings };
        }

        // Check tag length
        if (trimmedTag.length < 2) {
            errors.push('Tag must be at least 2 characters long');
        }

        if (trimmedTag.length > 50) {
            errors.push('Tag cannot exceed 50 characters');
        }

        // Check for invalid characters
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(trimmedTag)) {
            errors.push('Tag contains invalid characters');
        }

        // Check for excessive whitespace
        if (tag !== trimmedTag) {
            warnings.push('Tag has been trimmed of leading/trailing whitespace');
        }

        // Check for multiple spaces
        if (/\s{2,}/.test(trimmedTag)) {
            warnings.push('Tag contains multiple consecutive spaces');
        }

        // Check for special characters that might cause issues
        const specialChars = /[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/;
        if (specialChars.test(trimmedTag)) {
            warnings.push('Tag contains special characters that might affect search');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            normalizedTag: trimmedTag
        };
    }

    /**
     * Validate array of tags
     * @param {Array} tags - Array of tags to validate
     * @returns {Object} Validation result
     */
    static validateTags(tags) {
        const errors = [];
        const warnings = [];
        const validTags = [];
        const invalidTags = [];

        // Check if tags is an array
        if (!Array.isArray(tags)) {
            errors.push('Tags must be an array');
            return { isValid: false, errors, warnings, validTags, invalidTags };
        }

        // Check if tags array is empty
        if (tags.length === 0) {
            warnings.push('No tags provided');
            return { isValid: true, errors, warnings, validTags, invalidTags };
        }

        // Check array length
        if (tags.length > 10) {
            errors.push('Cannot search for more than 10 tags at once');
        }

        // Validate each tag
        tags.forEach((tag, index) => {
            const validation = this.validateTag(tag);

            if (validation.isValid) {
                validTags.push(validation.normalizedTag);
            } else {
                invalidTags.push({
                    tag,
                    index,
                    errors: validation.errors
                });
            }

            // Add warnings
            warnings.push(...validation.warnings.map(warning => `Tag ${index + 1}: ${warning}`));
        });

        // Check for duplicate tags
        const uniqueTags = [...new Set(validTags)];
        if (uniqueTags.length !== validTags.length) {
            warnings.push('Duplicate tags found and removed');
        }

        // Add errors for invalid tags
        invalidTags.forEach(({ tag, index, errors: tagErrors }) => {
            errors.push(`Tag ${index + 1} ("${tag}"): ${tagErrors.join(', ')}`);
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            validTags: uniqueTags,
            invalidTags
        };
    }

    /**
     * Validate search parameters
     * @param {Object} params - Search parameters
     * @returns {Object} Validation result
     */
    static validateSearchParams(params) {
        const errors = [];
        const warnings = [];
        const validatedParams = {};

        // Validate limit
        if (params.limit !== undefined) {
            if (typeof params.limit !== 'number' || !Number.isInteger(params.limit)) {
                errors.push('Limit must be an integer');
            } else if (params.limit < 1) {
                errors.push('Limit must be at least 1');
            } else if (params.limit > 1000) {
                errors.push('Limit cannot exceed 1000');
            } else {
                validatedParams.limit = params.limit;
            }
        } else {
            validatedParams.limit = 100; // Default
        }

        // Validate sortBy
        if (params.sortBy !== undefined) {
            const validSortFields = ['year', 'question_no', 'paper', 'created_at'];
            if (!validSortFields.includes(params.sortBy)) {
                errors.push(`Sort field must be one of: ${validSortFields.join(', ')}`);
            } else {
                validatedParams.sortBy = params.sortBy;
            }
        } else {
            validatedParams.sortBy = 'year'; // Default
        }

        // Validate sortAsc
        if (params.sortAsc !== undefined) {
            if (typeof params.sortAsc !== 'boolean') {
                errors.push('Sort direction must be a boolean');
            } else {
                validatedParams.sortAsc = params.sortAsc;
            }
        } else {
            validatedParams.sortAsc = false; // Default
        }

        // Validate matchType
        if (params.matchType !== undefined) {
            const validMatchTypes = ['AND', 'OR'];
            if (!validMatchTypes.includes(params.matchType)) {
                errors.push(`Match type must be one of: ${validMatchTypes.join(', ')}`);
            } else {
                validatedParams.matchType = params.matchType;
            }
        } else {
            validatedParams.matchType = 'OR'; // Default
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            validatedParams
        };
    }

    /**
     * Validate URL parameters
     * @param {string} urlTags - URL tags parameter
     * @returns {Object} Validation result
     */
    static validateURLParams(urlTags) {
        const errors = [];
        const warnings = [];

        // Check if urlTags is a string
        if (urlTags && typeof urlTags !== 'string') {
            errors.push('URL tags parameter must be a string');
            return { isValid: false, errors, warnings, parsedTags: [] };
        }

        // Parse tags from URL
        let parsedTags = [];
        if (urlTags && urlTags.trim().length > 0) {
            parsedTags = urlTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Validate parsed tags
        const tagValidation = this.validateTags(parsedTags);

        return {
            isValid: tagValidation.isValid,
            errors: [...errors, ...tagValidation.errors],
            warnings: [...warnings, ...tagValidation.warnings],
            parsedTags: tagValidation.validTags
        };
    }

    /**
     * Sanitize tag for display
     * @param {string} tag - Tag to sanitize
     * @returns {string} Sanitized tag
     */
    static sanitizeTag(tag) {
        if (!tag || typeof tag !== 'string') {
            return '';
        }

        return tag
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
            .substring(0, 50); // Limit length
    }

    /**
     * Sanitize tags array for display
     * @param {Array} tags - Tags array to sanitize
     * @returns {Array} Sanitized tags array
     */
    static sanitizeTags(tags) {
        if (!Array.isArray(tags)) {
            return [];
        }

        return tags
            .map(tag => this.sanitizeTag(tag))
            .filter(tag => tag.length > 0)
            .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
    }

    /**
     * Create error response
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {*} details - Additional error details
     * @returns {Object} Error response
     */
    static createErrorResponse(message, code = 'VALIDATION_ERROR', details = null) {
        return {
            success: false,
            error: {
                message,
                code,
                details,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Create success response
     * @param {*} data - Response data
     * @param {Array} warnings - Warnings array
     * @returns {Object} Success response
     */
    static createSuccessResponse(data, warnings = []) {
        return {
            success: true,
            data,
            warnings,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate and sanitize search request
     * @param {Object} request - Search request object
     * @returns {Object} Validation result with sanitized data
     */
    static validateSearchRequest(request) {
        const errors = [];
        const warnings = [];
        const sanitizedRequest = {};

        // Validate tags
        if (request.tags) {
            const tagValidation = this.validateTags(request.tags);
            if (!tagValidation.isValid) {
                errors.push(...tagValidation.errors);
            }
            warnings.push(...tagValidation.warnings);
            sanitizedRequest.tags = tagValidation.validTags;
        }

        // Validate search parameters
        if (request.params) {
            const paramValidation = this.validateSearchParams(request.params);
            if (!paramValidation.isValid) {
                errors.push(...paramValidation.errors);
            }
            warnings.push(...paramValidation.warnings);
            sanitizedRequest.params = paramValidation.validatedParams;
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            sanitizedRequest
        };
    }

    /**
     * Check if error is retryable
     * @param {Error} error - Error to check
     * @returns {boolean} Whether error is retryable
     */
    static isRetryableError(error) {
        if (!error) return false;

        const retryableCodes = [
            'NETWORK_ERROR',
            'TIMEOUT_ERROR',
            'RATE_LIMIT_ERROR',
            'TEMPORARY_ERROR'
        ];

        const retryableMessages = [
            'timeout',
            'network',
            'connection',
            'rate limit',
            'temporary',
            'service unavailable'
        ];

        // Check error code
        if (error.code && retryableCodes.includes(error.code)) {
            return true;
        }

        // Check error message
        if (error.message) {
            const message = error.message.toLowerCase();
            return retryableMessages.some(keyword => message.includes(keyword));
        }

        return false;
    }

    /**
     * Create retry strategy
     * @param {Error} error - Error to create retry strategy for
     * @returns {Object} Retry strategy
     */
    static createRetryStrategy(error) {
        if (!this.isRetryableError(error)) {
            return { shouldRetry: false, maxRetries: 0, delay: 0 };
        }

        const baseDelay = 1000; // 1 second
        const maxRetries = 3;

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, 0); // Start with 1 second

        return {
            shouldRetry: true,
            maxRetries,
            delay,
            strategy: 'exponential_backoff'
        };
    }

    /**
     * Validate cache key
     * @param {string} key - Cache key to validate
     * @returns {Object} Validation result
     */
    static validateCacheKey(key) {
        const errors = [];
        const warnings = [];

        if (!key) {
            errors.push('Cache key is required');
            return { isValid: false, errors, warnings };
        }

        if (typeof key !== 'string') {
            errors.push('Cache key must be a string');
            return { isValid: false, errors, warnings };
        }

        if (key.length === 0) {
            errors.push('Cache key cannot be empty');
        }

        if (key.length > 200) {
            errors.push('Cache key cannot exceed 200 characters');
        }

        // Check for invalid characters in cache key
        const invalidChars = /[<>:"/\\|?*\s]/;
        if (invalidChars.test(key)) {
            errors.push('Cache key contains invalid characters');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get validation summary
     * @param {Object} validationResults - Array of validation results
     * @returns {Object} Validation summary
     */
    static getValidationSummary(validationResults) {
        const totalValidations = validationResults.length;
        const validCount = validationResults.filter(result => result.isValid).length;
        const invalidCount = totalValidations - validCount;
        const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0);
        const totalWarnings = validationResults.reduce((sum, result) => sum + result.warnings.length, 0);

        return {
            totalValidations,
            validCount,
            invalidCount,
            totalErrors,
            totalWarnings,
            successRate: totalValidations > 0 ? (validCount / totalValidations * 100).toFixed(1) : 0
        };
    }
}

export default TagValidationService;
