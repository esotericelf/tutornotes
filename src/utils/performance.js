// Performance optimization utilities

// Lazy loading utility for components
export const lazyLoadComponent = (importFunc) => {
    return React.lazy(importFunc);
};

// Image optimization utility
export const optimizeImage = (src, options = {}) => {
    const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'webp'
    } = options;

    // If using a CDN or image optimization service, add parameters here
    // Example: return `${src}?w=${width}&h=${height}&q=${quality}&f=${format}`;
    return src;
};

// Preload critical resources
export const preloadCriticalResources = () => {
    const criticalResources = [
        '/favicon.svg',
        '/manifest.json'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.svg') ? 'image' : 'fetch';
        document.head.appendChild(link);
    });
};

// Debounce utility for search inputs
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle utility for scroll events
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
};

// Web Vitals monitoring
export const reportWebVitals = (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(onPerfEntry);
            getFID(onPerfEntry);
            getFCP(onPerfEntry);
            getLCP(onPerfEntry);
            getTTFB(onPerfEntry);
        });
    }
};
