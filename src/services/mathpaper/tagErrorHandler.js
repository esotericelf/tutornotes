/**
 * Tag Error Handler Service for Math Papers
 * This service provides comprehensive error handling and recovery strategies
 */

import TagValidationService from './tagValidationService';

class TagErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
    }

    /**
     * Handle and process errors
     * @param {Error} error - Error to handle
     * @param {Object} context - Context information
     * @returns {Object} Processed error response
     */
    static handleError(error, context = {}) {
        const errorHandler = new TagErrorHandler();
        return errorHandler.processError(error, context);
    }

    /**
     * Process error and create appropriate response
     * @param {Error} error - Error to process
     * @param {Object} context - Context information
     * @returns {Object} Processed error response
     */
    processError(error, context = {}) {
        // Log the error
        this.logError(error, context);

        // Classify the error
        const errorClassification = this.classifyError(error);

        // Create user-friendly error message
        const userMessage = this.createUserMessage(error, errorClassification);

        // Determine if error is retryable
        const retryStrategy = TagValidationService.createRetryStrategy(error);

        // Create error response
        const errorResponse = {
            success: false,
            error: {
                message: userMessage,
                code: errorClassification.code,
                type: errorClassification.type,
                severity: errorClassification.severity,
                retryable: retryStrategy.shouldRetry,
                retryStrategy: retryStrategy.shouldRetry ? retryStrategy : null,
                timestamp: new Date().toISOString(),
                context: this.sanitizeContext(context)
            }
        };

        // Add technical details in development mode
        if (process.env.NODE_ENV === 'development') {
            errorResponse.error.technical = {
                originalError: error.message,
                stack: error.stack,
                name: error.name
            };
        }

        return errorResponse;
    }

    /**
     * Classify error type and severity
     * @param {Error} error - Error to classify
     * @returns {Object} Error classification
     */
    classifyError(error) {
        if (!error) {
            return {
                type: 'UNKNOWN',
                code: 'UNKNOWN_ERROR',
                severity: 'HIGH'
            };
        }

        const message = error.message?.toLowerCase() || '';
        const name = error.name || '';

        // Network/Connection errors
        if (message.includes('network') || message.includes('connection') ||
            message.includes('fetch') || message.includes('timeout')) {
            return {
                type: 'NETWORK',
                code: 'NETWORK_ERROR',
                severity: 'MEDIUM'
            };
        }

        // Authentication/Authorization errors
        if (message.includes('unauthorized') || message.includes('forbidden') ||
            message.includes('authentication') || message.includes('permission')) {
            return {
                type: 'AUTH',
                code: 'AUTH_ERROR',
                severity: 'HIGH'
            };
        }

        // Validation errors
        if (message.includes('validation') || message.includes('invalid') ||
            message.includes('required') || message.includes('format')) {
            return {
                type: 'VALIDATION',
                code: 'VALIDATION_ERROR',
                severity: 'LOW'
            };
        }

        // Database errors
        if (message.includes('database') || message.includes('sql') ||
            message.includes('query') || message.includes('constraint')) {
            return {
                type: 'DATABASE',
                code: 'DATABASE_ERROR',
                severity: 'HIGH'
            };
        }

        // Rate limiting errors
        if (message.includes('rate limit') || message.includes('too many requests') ||
            message.includes('quota')) {
            return {
                type: 'RATE_LIMIT',
                code: 'RATE_LIMIT_ERROR',
                severity: 'MEDIUM'
            };
        }

        // Service unavailable errors
        if (message.includes('service unavailable') || message.includes('maintenance') ||
            message.includes('temporary')) {
            return {
                type: 'SERVICE',
                code: 'SERVICE_ERROR',
                severity: 'MEDIUM'
            };
        }

        // Default classification
        return {
            type: 'UNKNOWN',
            code: 'UNKNOWN_ERROR',
            severity: 'HIGH'
        };
    }

    /**
     * Create user-friendly error message
     * @param {Error} error - Original error
     * @param {Object} classification - Error classification
     * @returns {string} User-friendly message
     */
    createUserMessage(error, classification) {
        const messages = {
            NETWORK: 'Unable to connect to the server. Please check your internet connection and try again.',
            AUTH: 'Authentication required. Please log in and try again.',
            VALIDATION: 'Please check your input and try again.',
            DATABASE: 'A database error occurred. Please try again later.',
            RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
            SERVICE: 'Service temporarily unavailable. Please try again later.',
            UNKNOWN: 'An unexpected error occurred. Please try again.'
        };

        return messages[classification.type] || messages.UNKNOWN;
    }

    /**
     * Log error for debugging
     * @param {Error} error - Error to log
     * @param {Object} context - Context information
     */
    logError(error, context = {}) {
        const errorLogEntry = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                name: error.name,
                stack: error.stack
            },
            context: this.sanitizeContext(context),
            classification: this.classifyError(error)
        };

        this.errorLog.push(errorLogEntry);

        // Maintain log size limit
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Tag Error Handler:', errorLogEntry);
        }
    }

    /**
     * Sanitize context information
     * @param {Object} context - Context to sanitize
     * @returns {Object} Sanitized context
     */
    sanitizeContext(context) {
        if (!context || typeof context !== 'object') {
            return {};
        }

        const sanitized = { ...context };

        // Remove sensitive information
        const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
        sensitiveKeys.forEach(key => {
            if (sanitized[key]) {
                sanitized[key] = '[REDACTED]';
            }
        });

        // Limit context size
        const contextString = JSON.stringify(sanitized);
        if (contextString.length > 1000) {
            return { message: 'Context too large, truncated' };
        }

        return sanitized;
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const stats = {
            totalErrors: this.errorLog.length,
            errorTypes: {},
            errorCodes: {},
            severityCounts: { LOW: 0, MEDIUM: 0, HIGH: 0 },
            recentErrors: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(entry => {
            const { type, code, severity } = entry.classification;

            // Count by type
            stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;

            // Count by code
            stats.errorCodes[code] = (stats.errorCodes[code] || 0) + 1;

            // Count by severity
            stats.severityCounts[severity] = (stats.severityCounts[severity] || 0) + 1;
        });

        return stats;
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * Handle validation errors
     * @param {Object} validationResult - Validation result
     * @returns {Object} Error response
     */
    static handleValidationError(validationResult) {
        const errorHandler = new TagErrorHandler();

        const error = new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        error.name = 'ValidationError';

        return errorHandler.processError(error, {
            validationResult,
            type: 'validation'
        });
    }

    /**
     * Handle network errors
     * @param {Error} error - Network error
     * @param {Object} context - Context information
     * @returns {Object} Error response
     */
    static handleNetworkError(error, context = {}) {
        const errorHandler = new TagErrorHandler();

        return errorHandler.processError(error, {
            ...context,
            type: 'network'
        });
    }

    /**
     * Handle database errors
     * @param {Error} error - Database error
     * @param {Object} context - Context information
     * @returns {Object} Error response
     */
    static handleDatabaseError(error, context = {}) {
        const errorHandler = new TagErrorHandler();

        return errorHandler.processError(error, {
            ...context,
            type: 'database'
        });
    }

    /**
     * Create fallback response
     * @param {string} operation - Operation that failed
     * @returns {Object} Fallback response
     */
    static createFallbackResponse(operation) {
        const fallbackMessages = {
            search: 'Search is temporarily unavailable. Please try again later.',
            popularTags: 'Popular tags are temporarily unavailable.',
            autocomplete: 'Tag suggestions are temporarily unavailable.',
            statistics: 'Tag statistics are temporarily unavailable.',
            analytics: 'Tag analytics are temporarily unavailable.'
        };

        return {
            success: false,
            error: {
                message: fallbackMessages[operation] || 'Service temporarily unavailable.',
                code: 'FALLBACK_RESPONSE',
                type: 'FALLBACK',
                severity: 'MEDIUM',
                retryable: true,
                timestamp: new Date().toISOString()
            },
            fallback: true
        };
    }

    /**
     * Retry operation with exponential backoff
     * @param {Function} operation - Operation to retry
     * @param {Object} retryStrategy - Retry strategy
     * @returns {Promise} Operation result
     */
    static async retryOperation(operation, retryStrategy) {
        const { maxRetries, delay, strategy } = retryStrategy;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }

                // Calculate delay based on strategy
                let currentDelay = delay;
                if (strategy === 'exponential_backoff') {
                    currentDelay = delay * Math.pow(2, attempt);
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, currentDelay));
            }
        }
    }

    /**
     * Create error recovery suggestions
     * @param {Object} errorResponse - Error response
     * @returns {Array} Recovery suggestions
     */
    static createRecoverySuggestions(errorResponse) {
        const suggestions = [];

        if (errorResponse.error.type === 'NETWORK') {
            suggestions.push('Check your internet connection');
            suggestions.push('Try refreshing the page');
            suggestions.push('Wait a moment and try again');
        } else if (errorResponse.error.type === 'VALIDATION') {
            suggestions.push('Check your input for errors');
            suggestions.push('Try using different search terms');
            suggestions.push('Clear your search and start over');
        } else if (errorResponse.error.type === 'RATE_LIMIT') {
            suggestions.push('Wait a few minutes before trying again');
            suggestions.push('Reduce the frequency of your requests');
        } else if (errorResponse.error.type === 'SERVICE') {
            suggestions.push('Try again in a few minutes');
            suggestions.push('Check if the service is under maintenance');
        }

        return suggestions;
    }
}

export default TagErrorHandler;
