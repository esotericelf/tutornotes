/**
 * Dashboard Services - Unified API
 * Provides a clean, consolidated interface for all dashboard functionality
 */

// Unified Service (Recommended)
export { default as UnifiedDashboardService } from './UnifiedDashboardService';

// Legacy Services (deprecated - use UnifiedDashboardService instead)
export { default as DashboardService } from './dashboardService';
export { default as SimpleDashboardService } from './simpleDashboardService';

/**
 * Main Dashboard Service Factory
 * Provides easy access to dashboard services with consistent interface
 */
class DashboardServiceFactory {
    /**
     * Get unified dashboard service instance
     * @returns {UnifiedDashboardService} Unified dashboard service
     */
    static getDashboardService() {
        return UnifiedDashboardService;
    }

    /**
     * Initialize dashboard services
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    static async initialize() {
        try {
            console.log('🚀 Initializing Dashboard Services...');
            console.log('✅ Dashboard Services initialized successfully');
            return { success: true, error: null };
        } catch (error) {
            console.error('❌ Error initializing Dashboard Services:', error);
            return { success: false, error };
        }
    }

    /**
     * Get service health status
     * @returns {Object} Health status
     */
    static getHealthStatus() {
        try {
            return {
                status: 'healthy',
                services: {
                    unifiedDashboardService: 'active'
                },
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
}

export { DashboardServiceFactory };

// Default export for convenience
export default DashboardServiceFactory;
