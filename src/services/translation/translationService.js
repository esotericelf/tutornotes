import mathPaperTranslations from '../../locales/mathPaperTranslations.json';
import homeTranslations from '../../locales/homeTranslations.json';
import changelogTranslations from '../../locales/changelogTranslations.json';
import { supabase } from '../supabase';

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
     * Get Chinese translations for database tags from Supabase
     * @param {string[]} englishTags - Array of English tags
     * @returns {Promise<string[]>} Array of Chinese translations
     */
    async getChineseTags(englishTags) {
        if (!englishTags || englishTags.length === 0) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('tag, tag_ch')
                .in('tag', englishTags)
                .eq('is_active', true);

            if (error) {
                console.error('Error fetching Chinese tag translations:', error);
                return englishTags; // Fallback to original tags
            }

            // Create a map for quick lookup
            const translationMap = {};
            data?.forEach(item => {
                if (item.tag_ch) {
                    translationMap[item.tag] = item.tag_ch;
                }
            });

            // Return translated tags, fallback to original if translation not found
            return englishTags.map(tag => translationMap[tag] || tag);
        } catch (err) {
            console.error('Error in getChineseTags:', err);
            return englishTags; // Fallback to original tags
        }
    }

    /**
     * Get English translations for Chinese tags from Supabase
     * @param {string[]} chineseTags - Array of Chinese tags
     * @returns {Promise<string[]>} Array of English translations
     */
    async getEnglishTags(chineseTags) {
        if (!chineseTags || chineseTags.length === 0) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('tag, tag_ch')
                .in('tag_ch', chineseTags)
                .eq('is_active', true);

            if (error) {
                console.error('Error fetching English tag translations:', error);
                return chineseTags; // Fallback to original tags
            }

            // Create a map for quick lookup
            const translationMap = {};
            data?.forEach(item => {
                if (item.tag_ch) {
                    translationMap[item.tag_ch] = item.tag;
                }
            });

            // Return translated tags, fallback to original if translation not found
            return chineseTags.map(tag => translationMap[tag] || tag);
        } catch (err) {
            console.error('Error in getEnglishTags:', err);
            return chineseTags; // Fallback to original tags
        }
    }

    /**
     * Translate a topic from English to Chinese
     * @param {string} englishTopic - English topic name
     * @returns {Promise<string>} Chinese topic translation
     */
    async translateTopic(englishTopic) {
        if (!englishTopic) {
            return englishTopic;
        }

        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('topic, topic_ch')
                .eq('topic', englishTopic)
                .eq('is_active', true)
                .limit(1);

            if (error) {
                console.error('Error querying topic translation:', error);
                return englishTopic; // Fallback to original
            }

            if (data && data.length > 0 && data[0].topic_ch) {
                const translated = data[0].topic_ch.trim();
                return translated || englishTopic;
            }

            return englishTopic; // Fallback to original
        } catch (err) {
            console.error('Error translating topic:', err);
            return englishTopic; // Fallback to original
        }
    }

    /**
     * Translate a tag from English to Chinese
     * @param {string} englishTag - English tag name
     * @returns {Promise<string>} Chinese tag translation
     */
    async translateTag(englishTag) {
        if (!englishTag) {
            return englishTag;
        }

        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('tag, tag_ch')
                .eq('tag', englishTag)
                .eq('is_active', true)
                .limit(1);

            if (error) {
                console.error('Error querying tag translation:', error);
                return englishTag; // Fallback to original
            }

            if (data && data.length > 0 && data[0].tag_ch) {
                const translated = data[0].tag_ch.trim();
                return translated || englishTag;
            }

            return englishTag; // Fallback to original
        } catch (err) {
            console.error('Error translating tag:', err);
            return englishTag; // Fallback to original
        }
    }

    /**
     * Translate topic and tag pair from English to Chinese
     * @param {string} topic - English topic name
     * @param {string} tag - English tag name
     * @returns {Promise<{topic: string, tag: string}>} Translated topic and tag
     */
    async translateTopicTag(topic, tag) {
        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('topic, tag, topic_ch, tag_ch')
                .eq('topic', topic)
                .eq('tag', tag)
                .eq('is_active', true)
                .limit(1);

            if (error) {
                console.error('Error querying topic_tags:', error);
                // Fallback: try to get translations separately
                const [translatedTopic, translatedTag] = await Promise.all([
                    this.translateTopic(topic),
                    this.translateTag(tag)
                ]);
                return { topic: translatedTopic, tag: translatedTag };
            }

            if (data && data.length > 0) {
                const item = data[0];
                return {
                    topic: (item.topic_ch && item.topic_ch.trim()) || topic,
                    tag: (item.tag_ch && item.tag_ch.trim()) || tag
                };
            }

            // If no exact match, try to get translations separately
            const [translatedTopic, translatedTag] = await Promise.all([
                this.translateTopic(topic),
                this.translateTag(tag)
            ]);
            return { topic: translatedTopic, tag: translatedTag };
        } catch (err) {
            console.error('Error translating topic and tag:', err);
            // Fallback: try to get translations separately
            const [translatedTopic, translatedTag] = await Promise.all([
                this.translateTopic(topic),
                this.translateTag(tag)
            ]);
            return { topic: translatedTopic, tag: translatedTag };
        }
    }

    /**
     * Look up English topic and tag from Chinese translations
     * @param {string} chineseTopic - Chinese topic name
     * @param {string} chineseTag - Chinese tag name
     * @returns {Promise<{topic: string, tag: string}>} English topic and tag
     */
    async lookupEnglishFromChinese(chineseTopic, chineseTag) {
        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('topic, tag, topic_ch, tag_ch')
                .eq('topic_ch', chineseTopic)
                .eq('tag_ch', chineseTag)
                .eq('is_active', true)
                .limit(1);

            if (error) {
                console.error('Error looking up English from Chinese:', error);
                // Fallback: try to look up separately
                const [englishTopic, englishTag] = await Promise.all([
                    this.lookupEnglishTopic(chineseTopic),
                    this.lookupEnglishTag(chineseTag)
                ]);
                return { topic: englishTopic || chineseTopic, tag: englishTag || chineseTag };
            }

            if (data && data.length > 0) {
                return {
                    topic: data[0].topic || chineseTopic,
                    tag: data[0].tag || chineseTag
                };
            }

            // If no exact match, try to look up separately
            const [englishTopic, englishTag] = await Promise.all([
                this.lookupEnglishTopic(chineseTopic),
                this.lookupEnglishTag(chineseTag)
            ]);
            return { topic: englishTopic || chineseTopic, tag: englishTag || chineseTag };
        } catch (err) {
            console.error('Error looking up English from Chinese:', err);
            return { topic: chineseTopic, tag: chineseTag };
        }
    }

    /**
     * Look up English topic from Chinese translation
     * @param {string} chineseTopic - Chinese topic name
     * @returns {Promise<string>} English topic name
     */
    async lookupEnglishTopic(chineseTopic) {
        if (!chineseTopic) return chineseTopic;

        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('topic, topic_ch')
                .eq('topic_ch', chineseTopic)
                .eq('is_active', true)
                .limit(1);

            if (error || !data || data.length === 0) {
                return chineseTopic;
            }

            return data[0].topic || chineseTopic;
        } catch (err) {
            console.error('Error looking up English topic:', err);
            return chineseTopic;
        }
    }

    /**
     * Look up English tag from Chinese translation
     * @param {string} chineseTag - Chinese tag name
     * @returns {Promise<string>} English tag name
     */
    async lookupEnglishTag(chineseTag) {
        if (!chineseTag) return chineseTag;

        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('tag, tag_ch')
                .eq('tag_ch', chineseTag)
                .eq('is_active', true)
                .limit(1);

            if (error || !data || data.length === 0) {
                return chineseTag;
            }

            return data[0].tag || chineseTag;
        } catch (err) {
            console.error('Error looking up English tag:', err);
            return chineseTag;
        }
    }
}

// Create singleton instance
const translationService = new TranslationService();

// Initialize on import
translationService.initialize();

export default translationService;
