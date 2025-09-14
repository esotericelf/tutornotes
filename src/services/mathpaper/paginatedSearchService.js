/**
 * Paginated Search Service for Math Papers
 * This service uses the backend pagination functions to handle search efficiently
 */

import { supabase } from '../supabase';

class PaginatedSearchService {
    /**
     * Search math papers with pagination using backend function
     * @param {Object} options - Search options
     * @param {number} options.filterYear - Filter by year
     * @param {string} options.filterPaper - Filter by paper (I, II)
     * @param {number} options.filterQuestionNo - Filter by question number
     * @param {string[]} options.searchTags - Array of tags to search for
     * @param {number} options.page - Page number (1-based)
     * @param {number} options.pageSize - Number of items per page
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async searchMathPapers({
        filterYear = null,
        filterPaper = null,
        filterQuestionNo = null,
        searchTags = null,
        page = 1,
        pageSize = 10
    } = {}) {
        try {
            console.log('🔍 PaginatedSearchService: Searching with options:', {
                filterYear,
                filterPaper,
                filterQuestionNo,
                searchTags,
                page,
                pageSize
            });

            const { data, error } = await supabase.rpc('search_math_papers_paginated', {
                filter_year: filterYear,
                filter_paper: filterPaper,
                filter_question_no: filterQuestionNo,
                search_tags: searchTags,
                page_number: page,
                page_size: pageSize
            });

            if (error) {
                console.error('❌ PaginatedSearchService: Error in search:', error);
                return { data: null, error };
            }

            console.log('✅ PaginatedSearchService: Search successful:', {
                totalCount: data[0]?.total_count,
                totalPages: data[0]?.total_pages,
                currentPage: data[0]?.current_page,
                questionsCount: data[0]?.questions?.length || 0
            });

            return { data: data[0], error: null };

        } catch (err) {
            console.error('❌ PaginatedSearchService: Unexpected error:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Search math papers by tags only with pagination
     * @param {string[]} searchTags - Array of tags to search for
     * @param {number} page - Page number (1-based)
     * @param {number} pageSize - Number of items per page
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async searchByTags({ searchTags, page = 1, pageSize = 10 }) {
        try {
            console.log('🔍 PaginatedSearchService: Searching by tags:', { searchTags, page, pageSize });

            const { data, error } = await supabase.rpc('search_math_papers_by_tags_paginated', {
                search_tags: searchTags,
                page_number: page,
                page_size: pageSize
            });

            if (error) {
                console.error('❌ PaginatedSearchService: Error in tag search:', error);
                return { data: null, error };
            }

            console.log('✅ PaginatedSearchService: Tag search successful:', {
                totalCount: data[0]?.total_count,
                totalPages: data[0]?.total_pages,
                currentPage: data[0]?.current_page,
                questionsCount: data[0]?.questions?.length || 0
            });

            return { data: data[0], error: null };

        } catch (err) {
            console.error('❌ PaginatedSearchService: Unexpected error in tag search:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Search math papers by filters only with pagination
     * @param {Object} options - Filter options
     * @param {number} options.filterYear - Filter by year
     * @param {string} options.filterPaper - Filter by paper (I, II)
     * @param {number} options.filterQuestionNo - Filter by question number
     * @param {number} options.page - Page number (1-based)
     * @param {number} options.pageSize - Number of items per page
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async searchByFilters({
        filterYear = null,
        filterPaper = null,
        filterQuestionNo = null,
        page = 1,
        pageSize = 10
    } = {}) {
        try {
            console.log('🔍 PaginatedSearchService: Searching by filters:', {
                filterYear,
                filterPaper,
                filterQuestionNo,
                page,
                pageSize
            });

            const { data, error } = await supabase.rpc('search_math_papers_by_filters_paginated', {
                filter_year: filterYear,
                filter_paper: filterPaper,
                filter_question_no: filterQuestionNo,
                page_number: page,
                page_size: pageSize
            });

            if (error) {
                console.error('❌ PaginatedSearchService: Error in filter search:', error);
                return { data: null, error };
            }

            console.log('✅ PaginatedSearchService: Filter search successful:', {
                totalCount: data[0]?.total_count,
                totalPages: data[0]?.total_pages,
                currentPage: data[0]?.current_page,
                questionsCount: data[0]?.questions?.length || 0
            });

            return { data: data[0], error: null };

        } catch (err) {
            console.error('❌ PaginatedSearchService: Unexpected error in filter search:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get popular tags using existing backend function
     * @param {number} limit - Number of tags to return
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getPopularTags(limit = 15) {
        try {
            console.log('🔍 PaginatedSearchService: Getting popular tags:', { limit });

            const { data, error } = await supabase.rpc('get_popular_math_paper_tags', {
                limit_count: limit
            });

            if (error) {
                console.error('❌ PaginatedSearchService: Error getting popular tags:', error);
                return { data: null, error };
            }

            console.log('✅ PaginatedSearchService: Popular tags retrieved:', data?.length || 0);

            return { data, error: null };

        } catch (err) {
            console.error('❌ PaginatedSearchService: Unexpected error getting popular tags:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get all available tags using existing backend function
     * @param {number} limit - Number of tags to return
     * @returns {Promise<{data: Array, error: Error}>}
     */
    static async getAllTags(limit = 100) {
        try {
            console.log('🔍 PaginatedSearchService: Getting all tags:', { limit });

            const { data, error } = await supabase.rpc('get_all_tags_with_counts', {
                limit_count: limit
            });

            if (error) {
                console.error('❌ PaginatedSearchService: Error getting all tags:', error);
                return { data: null, error };
            }

            console.log('✅ PaginatedSearchService: All tags retrieved:', data?.length || 0);

            return { data, error: null };

        } catch (err) {
            console.error('❌ PaginatedSearchService: Unexpected error getting all tags:', err);
            return { data: null, error: err };
        }
    }
}

export default PaginatedSearchService;
