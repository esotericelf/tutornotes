/**
 * Question Loader Service for Math Papers
 * This service handles loading specific questions from the database
 * and integrates with the QuestionURLService
 */

import { supabase } from '../supabase';
import QuestionURLService from './questionUrlService';

class QuestionLoaderService {
    /**
     * Load a specific question by year, paper, and question number
     * @param {number} year - Question year
     * @param {string} paper - Paper type ('I' or 'II')
     * @param {number} questionNo - Question number
     * @returns {Promise<{data: Object|null, error: Error|null, url: string}>}
     */
    static async loadQuestion(year, paper, questionNo) {
        try {
            // Validate parameters first
            if (!QuestionURLService.isValidQuestionParams(year, paper, questionNo)) {
                const error = new Error(`Invalid question parameters: year=${year}, paper=${paper}, questionNo=${questionNo}`);
                return {
                    data: null,
                    error: error,
                    url: null
                };
            }

            console.log(`🔍 Loading question: ${year} Paper ${paper} Question ${questionNo}`);

            // Query the database for the specific question
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('year', year)
                .eq('paper', paper)
                .eq('question_no', questionNo)
                .single();

            if (error) {
                console.error('Database error loading question:', error);
                return {
                    data: null,
                    error: error,
                    url: QuestionURLService.generateQuestionURL(year, paper, questionNo)
                };
            }

            if (!data) {
                const notFoundError = new Error(`Question not found: ${year} Paper ${paper} Question ${questionNo}`);
                return {
                    data: null,
                    error: notFoundError,
                    url: QuestionURLService.generateQuestionURL(year, paper, questionNo)
                };
            }

            console.log(`✅ Successfully loaded question: ${data.id}`);

            return {
                data: data,
                error: null,
                url: QuestionURLService.generateQuestionURL(year, paper, questionNo)
            };

        } catch (err) {
            console.error('Unexpected error loading question:', err);
            return {
                data: null,
                error: err,
                url: QuestionURLService.generateQuestionURL(year, paper, questionNo)
            };
        }
    }

    /**
     * Load a question from URL parameters
     * @param {Object} params - {year, paper, questionNo} from URL
     * @returns {Promise<{data: Object|null, error: Error|null, url: string}>}
     */
    static async loadQuestionFromParams(params) {
        if (!params || !QuestionURLService.isValidQuestionParams(params.year, params.paper, params.questionNo)) {
            const error = new Error('Invalid question parameters');
            return {
                data: null,
                error: error,
                url: null
            };
        }

        return this.loadQuestion(params.year, params.paper, params.questionNo);
    }

    /**
     * Load a question from URL path
     * @param {string} urlPath - URL path like "/DSE_Math/2023/I/15"
     * @returns {Promise<{data: Object|null, error: Error|null, url: string}>}
     */
    static async loadQuestionFromURL(urlPath) {
        const params = QuestionURLService.parseQuestionURL(urlPath);

        if (!params) {
            const error = new Error(`Invalid URL format: ${urlPath}`);
            return {
                data: null,
                error: error,
                url: null
            };
        }

        return this.loadQuestion(params.year, params.paper, params.questionNo);
    }

    /**
     * Load multiple questions by year and paper
     * @param {number} year - Question year
     * @param {string} paper - Paper type ('I' or 'II')
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async loadQuestionsByYearAndPaper(year, paper) {
        try {
            // Validate year and paper
            if (!Number.isInteger(year) || year < 2012 || year > 2025) {
                throw new Error(`Invalid year: ${year}`);
            }

            if (!['I', 'II'].includes(paper)) {
                throw new Error(`Invalid paper: ${paper}`);
            }

            console.log(`🔍 Loading questions for: ${year} Paper ${paper}`);

            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('year', year)
                .eq('paper', paper)
                .order('question_no', { ascending: true });

            if (error) {
                console.error('Database error loading questions:', error);
                return {
                    data: null,
                    error: error
                };
            }

            console.log(`✅ Successfully loaded ${data?.length || 0} questions for ${year} Paper ${paper}`);

            return {
                data: data || [],
                error: null
            };

        } catch (err) {
            console.error('Unexpected error loading questions:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Load questions by year only
     * @param {number} year - Question year
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    static async loadQuestionsByYear(year) {
        try {
            if (!Number.isInteger(year) || year < 2012 || year > 2025) {
                throw new Error(`Invalid year: ${year}`);
            }

            console.log(`🔍 Loading all questions for year: ${year}`);

            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('year', year)
                .order('paper', { ascending: true })
                .order('question_no', { ascending: true });

            if (error) {
                console.error('Database error loading questions by year:', error);
                return {
                    data: null,
                    error: error
                };
            }

            console.log(`✅ Successfully loaded ${data?.length || 0} questions for year ${year}`);

            return {
                data: data || [],
                error: null
            };

        } catch (err) {
            console.error('Unexpected error loading questions by year:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Check if a question exists in the database
     * @param {number} year - Question year
     * @param {string} paper - Paper type ('I' or 'II')
     * @param {number} questionNo - Question number
     * @returns {Promise<{exists: boolean, error: Error|null}>}
     */
    static async questionExists(year, paper, questionNo) {
        try {
            if (!QuestionURLService.isValidQuestionParams(year, paper, questionNo)) {
                return {
                    exists: false,
                    error: new Error('Invalid question parameters')
                };
            }

            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('id')
                .eq('year', year)
                .eq('paper', paper)
                .eq('question_no', questionNo)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
                return {
                    exists: false,
                    error: error
                };
            }

            return {
                exists: !!data,
                error: null
            };

        } catch (err) {
            return {
                exists: false,
                error: err
            };
        }
    }

    /**
     * Get question statistics (total questions by year/paper)
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getQuestionStatistics() {
        try {
            console.log('🔍 Loading question statistics...');

            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('year, paper, question_no')
                .order('year', { ascending: false })
                .order('paper', { ascending: true })
                .order('question_no', { ascending: true });

            if (error) {
                console.error('Database error loading statistics:', error);
                return {
                    data: null,
                    error: error
                };
            }

            // Process statistics
            const stats = {
                totalQuestions: data?.length || 0,
                byYear: {},
                byPaper: { 'I': 0, 'II': 0 },
                byYearAndPaper: {}
            };

            data?.forEach(question => {
                const { year, paper } = question;

                // By year
                stats.byYear[year] = (stats.byYear[year] || 0) + 1;

                // By paper
                stats.byPaper[paper] = (stats.byPaper[paper] || 0) + 1;

                // By year and paper
                const key = `${year}-${paper}`;
                stats.byYearAndPaper[key] = (stats.byYearAndPaper[key] || 0) + 1;
            });

            console.log('✅ Successfully loaded question statistics');

            return {
                data: stats,
                error: null
            };

        } catch (err) {
            console.error('Unexpected error loading statistics:', err);
            return {
                data: null,
                error: err
            };
        }
    }
}

export default QuestionLoaderService;
