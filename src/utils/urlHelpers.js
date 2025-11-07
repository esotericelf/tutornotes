/**
 * URL encoding/decoding helpers for concept titles
 * Concept titles may contain special characters that need URL-safe encoding
 */

/**
 * Encode a concept title for use in URL
 * Uses URL encoding to preserve exact title including case and special characters
 */
export const encodeConceptTitle = (title) => {
    if (!title) return ''
    // Use encodeURIComponent to properly encode special characters
    // Replace spaces with hyphens for cleaner URLs
    return encodeURIComponent(title).replace(/%20/g, '-')
}

/**
 * Decode a concept title from URL
 */
export const decodeConceptTitle = (encodedTitle) => {
    if (!encodedTitle) return ''
    try {
        // Replace hyphens back to %20 then decode
        return decodeURIComponent(encodedTitle.replace(/-/g, '%20'))
    } catch (e) {
        console.error('Error decoding concept title:', e)
        // Fallback: try simple replacement
        return encodedTitle.replace(/-/g, ' ')
    }
}

/**
 * Create URL path for a topic/tag (without concept title)
 * @param {string} topic - English topic name
 * @param {string} tag - English tag name
 * @param {string} topicCh - Optional Chinese topic translation
 * @param {string} tagCh - Optional Chinese tag translation
 * @param {string} language - Current language ('zh' or 'en')
 * @returns {string} URL path
 */
export const createTopicTagUrl = (topic, tag, topicCh = null, tagCh = null, language = 'en') => {
    // Use Chinese translations if language is Chinese and translations exist
    const displayTopic = (language === 'zh' && topicCh && topicCh.trim()) ? topicCh : topic
    const displayTag = (language === 'zh' && tagCh && tagCh.trim()) ? tagCh : tag

    // Encode topic and tag, replacing spaces with hyphens
    // For Chinese characters, encodeURIComponent will properly encode them
    const encodedTopic = encodeURIComponent(displayTopic).replace(/%20/g, '-')
    const encodedTag = encodeURIComponent(displayTag).replace(/%20/g, '-')
    return `/${encodedTopic}/${encodedTag}`
}

/**
 * Parse topic/tag URL parameters
 * Handles both English and Chinese URLs
 * @param {string} topicParam - URL parameter for topic (can be English or Chinese)
 * @param {string} tagParam - URL parameter for tag (can be English or Chinese)
 * @returns {Promise<{topic: string, tag: string}>} English topic and tag names
 */
export const parseTopicTagUrl = async (topicParam, tagParam) => {
    try {
        // Decode topic and tag (hyphens were spaces)
        const decodedTopic = decodeURIComponent(topicParam.replace(/-/g, '%20'))
        const decodedTag = decodeURIComponent(tagParam.replace(/-/g, '%20'))

        // Check if decoded values contain Chinese characters
        const hasChinese = /[\u4e00-\u9fa5]/.test(decodedTopic) || /[\u4e00-\u9fa5]/.test(decodedTag)

        if (hasChinese) {
            // If Chinese, need to look up English equivalents from database
            // This will be handled by the component that uses this function
            // For now, return the decoded values and let the component handle translation lookup
            return { topic: decodedTopic, tag: decodedTag, isChinese: true }
        }

        // English URLs - return as-is
        return { topic: decodedTopic, tag: decodedTag, isChinese: false }
    } catch (e) {
        console.error('Error parsing topic/tag URL:', e)
        return null
    }
}

