import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../store/slices/uiSlice';
import translationService from '../services/translation/translationService';

/**
 * Custom hook for translation functionality
 * @returns {object} Translation utilities and state
 */
export const useTranslation = () => {
    const dispatch = useDispatch();
    const currentLanguage = useSelector(state => state.ui.language);
    const [isLoading, setIsLoading] = useState(false);

    // Sync translation service with Redux state
    useEffect(() => {
        if (translationService.getCurrentLanguage() !== currentLanguage) {
            translationService.setLanguage(currentLanguage);
        }
    }, [currentLanguage]);

    /**
     * Translate a key with optional parameters
     * @param {string} key - Translation key (supports dot notation)
     * @param {object} params - Parameters for string interpolation
     * @param {string} fallback - Fallback text if translation not found
     * @returns {string} Translated text
     */
    const t = useCallback((key, params = {}, fallback = null) => {
        return translationService.t(key, params, fallback);
    }, []);

    /**
     * Change the current language
     * @param {string} newLanguage - New language code
     */
    const changeLanguage = useCallback(async (newLanguage) => {
        if (newLanguage === currentLanguage) return;

        setIsLoading(true);
        try {
            dispatch(setLanguage(newLanguage));
            translationService.setLanguage(newLanguage);

            // Update meta tags for SEO
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.content = t('seo.description');
            }

            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.content = t('seo.keywords');
            }

        } catch (error) {
            console.error('Error changing language:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentLanguage, dispatch, t]);

    /**
     * Get the current language
     * @returns {string} Current language code
     */
    const getCurrentLanguage = useCallback(() => {
        return currentLanguage;
    }, [currentLanguage]);

    /**
     * Check if current language is Chinese
     * @returns {boolean}
     */
    const isChinese = useCallback(() => {
        return currentLanguage === 'zh';
    }, [currentLanguage]);

    /**
     * Check if current language is English
     * @returns {boolean}
     */
    const isEnglish = useCallback(() => {
        return currentLanguage === 'en';
    }, [currentLanguage]);

    /**
     * Get available languages
     * @returns {string[]} Array of available language codes
     */
    const getAvailableLanguages = useCallback(() => {
        return translationService.getAvailableLanguages();
    }, []);

    /**
     * Get all translations for a specific section
     * @param {string} section - Section key
     * @returns {object} Translations for the section
     */
    const getSection = useCallback((section) => {
        return translationService.getSection(section);
    }, [currentLanguage]);

    /**
     * Get Chinese translations for database tags
     * @param {string[]} englishTags - Array of English tags
     * @returns {Promise<string[]>} Array of Chinese translations
     */
    const getChineseTags = useCallback(async (englishTags) => {
        return await translationService.getChineseTags(englishTags);
    }, []);

    /**
     * Get English translations for Chinese tags
     * @param {string[]} chineseTags - Array of Chinese tags
     * @returns {Promise<string[]>} Array of English translations
     */
    const getEnglishTags = useCallback(async (chineseTags) => {
        return await translationService.getEnglishTags(chineseTags);
    }, []);

    return {
        t,
        changeLanguage,
        getCurrentLanguage,
        isChinese,
        isEnglish,
        getAvailableLanguages,
        getSection,
        getChineseTags,
        getEnglishTags,
        currentLanguage,
        isLoading
    };
};

export default useTranslation;
