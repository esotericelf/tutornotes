/**
 * Math Paper Services - Unified API
 * This is the main entry point for all mathpaper services
 * Provides a clean, consolidated interface for all functionality
 */

// Import services for internal use
import UnifiedTagService from './UnifiedTagService';
import UnifiedQuestionService from './UnifiedQuestionService';
import UnifiedURLService from './UnifiedURLService';
import UnifiedAnalyticsService from './UnifiedAnalyticsService';
import BaseService from './BaseService';
import TagCacheService from './tagCacheService';
import TagValidationService from './tagValidationService';
import TagErrorHandler from './tagErrorHandler';

// Unified Services
export { default as UnifiedTagService } from './UnifiedTagService';
export { default as UnifiedQuestionService } from './UnifiedQuestionService';
export { default as UnifiedURLService } from './UnifiedURLService';
export { default as UnifiedAnalyticsService } from './UnifiedAnalyticsService';

// Base Service
export { default as BaseService } from './BaseService';

// Specialized Services (kept for specific use cases)
export { default as TagCacheService } from './tagCacheService';
export { default as TagValidationService } from './tagValidationService';
export { default as TagErrorHandler } from './tagErrorHandler';

// Specialized Services (for specific use cases)
export { default as PaginatedSearchService } from './paginatedSearchService';

/**
 * Main Service Factory
 * Provides easy access to all services with consistent interface
 */
class MathPaperServiceFactory {
    /**
     * Get tag service instance
     * @returns {UnifiedTagService} Tag service
     */
    static getTagService() {
        return UnifiedTagService;
    }

    /**
     * Get question service instance
     * @returns {UnifiedQuestionService} Question service
     */
    static getQuestionService() {
        return UnifiedQuestionService;
    }

    /**
     * Get URL service instance
     * @returns {UnifiedURLService} URL service
     */
    static getURLService() {
        return UnifiedURLService;
    }

    /**
     * Get analytics service instance
     * @returns {UnifiedAnalyticsService} Analytics service
     */
    static getAnalyticsService() {
        return UnifiedAnalyticsService;
    }

    /**
     * Get cache service instance
     * @returns {TagCacheService} Cache service
     */
    static getCacheService() {
        return TagCacheService;
    }

    /**
     * Get validation service instance
     * @returns {TagValidationService} Validation service
     */
    static getValidationService() {
        return TagValidationService;
    }

    /**
     * Get error handler service instance
     * @returns {TagErrorHandler} Error handler service
     */
    static getErrorHandlerService() {
        return TagErrorHandler;
    }

    /**
     * Initialize all services
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    static async initialize() {
        try {
            console.log('🚀 Initializing Math Paper Services...');

            // Preload cache
            await UnifiedTagService.preloadCache();

            console.log('✅ Math Paper Services initialized successfully');
            return { success: true, error: null };
        } catch (error) {
            console.error('❌ Error initializing Math Paper Services:', error);
            return { success: false, error };
        }
    }

    /**
     * Get service health status
     * @returns {Object} Health status
     */
    static getHealthStatus() {
        try {
            const cacheStats = TagCacheService.getStats();

            return {
                status: 'healthy',
                services: {
                    tagService: 'active',
                    questionService: 'active',
                    urlService: 'active',
                    analyticsService: 'active',
                    cacheService: 'active',
                    validationService: 'active',
                    errorHandlerService: 'active'
                },
                cache: cacheStats,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Clear all caches
     */
    static clearAllCaches() {
        TagCacheService.clear();
        console.log('🧹 All caches cleared');
    }

    /**
     * Clean expired cache items
     */
    static cleanExpiredCaches() {
        TagCacheService.cleanExpired();
        console.log('🧹 Expired cache items cleaned');
    }
}

export { MathPaperServiceFactory };

// Default export for convenience
export default MathPaperServiceFactory;
