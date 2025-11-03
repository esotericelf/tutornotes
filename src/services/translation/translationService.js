import mathPaperTranslations from '../../locales/mathPaperTranslations.json';
import homeTranslations from '../../locales/homeTranslations.json';
import changelogTranslations from '../../locales/changelogTranslations.json';

class TranslationService {
    /**
     * Merge two translation objects, with the second one taking precedence for overlapping keys
     * @param {object} main - Main translations object
     * @param {object} additional - Additional translations object
     * @returns {object} Merged translations
     */
    mergeTranslations(main, additional) {
        const merged = {};

        // Get all language codes from both objects
        const allLanguages = new Set([
            ...Object.keys(main),
            ...Object.keys(additional)
        ]);

        allLanguages.forEach(lang => {
            merged[lang] = {
                ...main[lang],
                ...additional[lang]
            };
        });

        return merged;
    }

    constructor() {
        this.currentLanguage = 'en';
        // Merge all translation files - later files take precedence
        this.translations = this.mergeTranslations(
            this.mergeTranslations(mathPaperTranslations, homeTranslations),
            changelogTranslations
        );
    }

    /**
     * Set the current language
     * @param {string} language - Language code (e.g., 'en', 'zh')
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            // Update document language
            document.documentElement.lang = language;
            // Save to localStorage
            localStorage.setItem('language', language);
        } else {
            console.warn(`Language ${language} not supported. Available languages:`, Object.keys(this.translations));
        }
    }

    /**
     * Get the current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if current language is Chinese
     * @returns {boolean}
     */
    isChinese() {
        return this.currentLanguage === 'zh';
    }

    /**
     * Check if current language is English
     * @returns {boolean}
     */
    isEnglish() {
        return this.currentLanguage === 'en';
    }

    /**
     * Get available languages
     * @returns {string[]} Array of available language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Translate a key with optional parameters
     * @param {string} key - Translation key (supports dot notation)
     * @param {object} params - Parameters for string interpolation
     * @param {string} fallback - Fallback text if translation not found
     * @returns {string} Translated text
     */
    t(key, params = {}, fallback = null) {
        const translation = this.getNestedValue(this.translations[this.currentLanguage], key);

        if (!translation) {
            console.warn(`Translation not found for key: ${key} in language: ${this.currentLanguage}`);
            return fallback || key;
        }

        // Handle string interpolation
        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            return this.interpolateString(translation, params);
        }

        return translation;
    }

    /**
     * Get nested value from object using dot notation
     * @param {object} obj - Object to search
     * @param {string} path - Dot notation path
     * @returns {any} Value at path or undefined
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Interpolate parameters into string
     * @param {string} str - String with placeholders
     * @param {object} params - Parameters to interpolate
     * @returns {string} Interpolated string
     */
    interpolateString(str, params) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Get all translations for a specific section
     * @param {string} section - Section key (e.g., 'filters', 'results')
     * @returns {object} Translations for the section
     */
    getSection(section) {
        return this.translations[this.currentLanguage][section] || {};
    }

    /**
     * Initialize translation service with saved language preference
     */
    initialize() {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.setLanguage(savedLanguage);
        } else {
            // Default to Chinese on first visit
            this.setLanguage('zh');
        }
    }

    /**
     * Get Chinese translations for database tags
     * This method can be extended to fetch from Supabase functions
     * @param {string[]} englishTags - Array of English tags
     * @returns {Promise<string[]>} Array of Chinese translations
     */
    async getChineseTags(englishTags) {
        // For now, return the same tags
        // This can be extended to use the Supabase Chinese tag functions
        return englishTags;
    }

    /**
     * Get English translations for Chinese tags
     * @param {string[]} chineseTags - Array of Chinese tags
     * @returns {Promise<string[]>} Array of English translations
     */
    async getEnglishTags(chineseTags) {
        // For now, return the same tags
        // This can be extended to use the Supabase tag translation functions
        return chineseTags;
    }
}

// Create singleton instance
const translationService = new TranslationService();

// Initialize on import
translationService.initialize();

export default translationService;
