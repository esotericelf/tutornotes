// Google Analytics utility functions

// Check if gtag is available
const isGtagAvailable = () => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track page views
export const trackPageView = (pagePath, pageTitle) => {
    if (isGtagAvailable()) {
        window.gtag('config', 'G-YVBQQPNEE7', {
            page_path: pagePath,
            page_title: pageTitle,
        });
    }
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
    if (isGtagAvailable()) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Track user interactions
export const trackUserInteraction = (interactionType, elementName, pageName) => {
    trackEvent('click', interactionType, `${elementName} - ${pageName}`);
};

// Track quiz interactions
export const trackQuizEvent = (eventType, quizId, questionNumber = null) => {
    const eventData = {
        event_category: 'Quiz',
        event_label: quizId,
    };

    if (questionNumber) {
        eventData.custom_parameter_1 = questionNumber;
    }

    if (isGtagAvailable()) {
        window.gtag('event', eventType, eventData);
    }
};

// Track math paper interactions
export const trackMathPaperEvent = (eventType, paperYear, paperType, questionNumber = null) => {
    const eventData = {
        event_category: 'Math Paper',
        event_label: `${paperYear} - ${paperType}`,
    };

    if (questionNumber) {
        eventData.custom_parameter_1 = questionNumber;
    }

    if (isGtagAvailable()) {
        window.gtag('event', eventType, eventData);
    }
};

// Track search events
export const trackSearch = (searchTerm, resultsCount) => {
    trackEvent('search', 'Site Search', searchTerm, resultsCount);
};

// Track login events
export const trackLogin = (method = 'email') => {
    trackEvent('login', 'Authentication', method);
};

// Track signup events
export const trackSignup = (method = 'email') => {
    trackEvent('sign_up', 'Authentication', method);
};

// Track error events
export const trackError = (errorType, errorMessage, pageName) => {
    trackEvent('exception', 'Error', `${errorType} - ${pageName}`, {
        description: errorMessage,
        fatal: false,
    });
};

// Track performance events
export const trackPerformance = (metricName, value, pageName) => {
    trackEvent('timing_complete', 'Performance', `${metricName} - ${pageName}`, value);
};

// Track educational content engagement
export const trackContentEngagement = (contentType, contentId, action) => {
    trackEvent(action, 'Content Engagement', `${contentType} - ${contentId}`);
};

// Initialize analytics (called on app start)
export const initializeAnalytics = () => {
    if (isGtagAvailable()) {
        // Track app initialization
        trackEvent('app_initialized', 'App Lifecycle', 'TutorNote');
    }
};

// Track route changes (for SPA)
export const trackRouteChange = (routePath, routeName) => {
    trackPageView(routePath, routeName);
};
