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
 */
export const createTopicTagUrl = (topic, tag) => {
    // Encode topic and tag, replacing spaces with hyphens
    const encodedTopic = encodeURIComponent(topic).replace(/%20/g, '-')
    const encodedTag = encodeURIComponent(tag).replace(/%20/g, '-')
    return `/${encodedTopic}/${encodedTag}`
}

/**
 * Parse topic/tag URL parameters
 */
export const parseTopicTagUrl = (topicParam, tagParam) => {
    try {
        // Decode topic and tag (hyphens were spaces)
        const topic = decodeURIComponent(topicParam.replace(/-/g, '%20'))
        const tag = decodeURIComponent(tagParam.replace(/-/g, '%20'))
        return { topic, tag }
    } catch (e) {
        console.error('Error parsing topic/tag URL:', e)
        return null
    }
}

