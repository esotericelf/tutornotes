/**
 * Base Service Class for Math Papers
 * Provides common functionality for all mathpaper services
 */

import { supabase } from '../supabase';

class BaseService {
    /**
     * Execute a database RPC call with error handling
     * @param {string} functionName - RPC function name
     * @param {Object} params - Function parameters
     * @returns {Promise<{data: any, error: Error|null}>}
     */
    static async executeRPC(functionName, params = {}) {
        try {
            const { data, error } = await supabase.rpc(functionName, params);

            if (error) {
                console.error(`🔍 BaseService: Error executing RPC ${functionName}:`, error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error(`🔍 BaseService: Unexpected error executing RPC ${functionName}:`, err);
            return { data: null, error: err };
        }
    }

    /**
     * Execute a database query with error handling
     * @param {Function} queryBuilder - Supabase query builder function
     * @returns {Promise<{data: any, error: Error|null}>}
     */
    static async executeQuery(queryBuilder) {
        try {
            const { data, error } = await queryBuilder;

            if (error) {
                console.error('Error executing query:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Unexpected error executing query:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Validate required parameters
     * @param {Object} params - Parameters to validate
     * @param {Array<string>} requiredFields - Required field names
     * @returns {Object} Validation result
     */
    static validateRequiredParams(params, requiredFields) {
        const errors = [];

        requiredFields.forEach(field => {
            if (params[field] === undefined || params[field] === null) {
                errors.push(`${field} is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create standardized error response
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {*} details - Additional error details
     * @returns {Object} Error response
     */
    static createErrorResponse(message, code = 'SERVICE_ERROR', details = null) {
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
     * Create standardized success response
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
     * Sanitize input parameters
     * @param {Object} params - Parameters to sanitize
     * @returns {Object} Sanitized parameters
     */
    static sanitizeParams(params) {
        const sanitized = {};

        Object.keys(params).forEach(key => {
            const value = params[key];

            if (typeof value === 'string') {
                sanitized[key] = value.trim();
            } else if (Array.isArray(value)) {
                sanitized[key] = value.filter(item =>
                    typeof item === 'string' ? item.trim().length > 0 : item !== null && item !== undefined
                );
            } else {
                sanitized[key] = value;
            }
        });

        return sanitized;
    }

    /**
     * Check if error is retryable
     * @param {Error} error - Error to check
     * @returns {boolean} Whether error is retryable
     */
    static isRetryableError(error) {
        if (!error) return false;

        const retryableMessages = [
            'timeout', 'network', 'connection', 'rate limit',
            'temporary', 'service unavailable'
        ];

        const message = error.message?.toLowerCase() || '';
        return retryableMessages.some(keyword => message.includes(keyword));
    }

    /**
     * Retry operation with exponential backoff
     * @param {Function} operation - Operation to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} Operation result
     */
    static async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries || !this.isRetryableError(error)) {
                    throw error;
                }

                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

export default BaseService;
