/**
 * Unified Question Service for Math Papers
 * Consolidates question loading, navigation, and URL handling
 */

import BaseService from './BaseService';
import { supabase } from '../supabase';

class UnifiedQuestionService extends BaseService {
    /**
     * Load a specific question by year, paper, and question number
     * @param {number} year - Question year
     * @param {string} paper - Paper type ('I' or 'II')
     * @param {number} questionNo - Question number
     * @returns {Promise<{data: Object|null, error: Error|null, url: string}>}
     */
    static async loadQuestion(year, paper, questionNo) {
        try {
            // Validate parameters
            if (!this.isValidQuestionParams(year, paper, questionNo)) {
                const error = new Error(`Invalid question parameters: year=${year}, paper=${paper}, questionNo=${questionNo}`);
                return {
                    data: null,
                    error: error,
                    url: this.generateQuestionURL(year, paper, questionNo)
                };
            }


            const result = await this.executeQuery(
                supabase
                    .from('Math_Past_Paper')
                    .select('*')
                    .eq('year', year)
                    .eq('paper', paper)
                    .eq('question_no', questionNo)
                    .maybeSingle()
            );

            if (result.error) {
                console.error('Database error loading question:', result.error);
                return {
                    data: null,
                    error: result.error,
                    url: this.generateQuestionURL(year, paper, questionNo)
                };
            }

            if (!result.data) {
                const notFoundError = new Error(`Question not found: ${year} Paper ${paper} Question ${questionNo}`);
                return {
                    data: null,
                    error: notFoundError,
                    url: this.generateQuestionURL(year, paper, questionNo)
                };
            }


            return {
                data: result.data,
                error: null,
                url: this.generateQuestionURL(year, paper, questionNo)
            };

        } catch (err) {
            console.error('Unexpected error loading question:', err);
            return {
                data: null,
                error: err,
                url: this.generateQuestionURL(year, paper, questionNo)
            };
        }
    }

    /**
     * Load a question from URL parameters
     * @param {Object} params - {year, paper, questionNo} from URL
     * @returns {Promise<{data: Object|null, error: Error|null, url: string}>}
     */
    static async loadQuestionFromParams(params) {
        if (!params || !this.isValidQuestionParams(params.year, params.paper, params.questionNo)) {
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
        const params = this.parseQuestionURL(urlPath);

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
    static async loadQuestionsByYearAndPaper(year, paper, questionNo = null) {
        try {
            if (!Number.isInteger(year) || year < 2012 || year > 2025) {
                throw new Error(`Invalid year: ${year}`);
            }

            if (!['I', 'II'].includes(paper)) {
                throw new Error(`Invalid paper: ${paper}`);
            }


            let query = supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('year', year)
                .eq('paper', paper);

            if (questionNo) {
                query = query.eq('question_no', parseInt(questionNo));
            }

            query = query.order('question_no', { ascending: true });

            const result = await this.executeQuery(query);

            if (result.error) {
                console.error('Database error loading questions:', result.error);
                return { data: null, error: result.error };
            }


            return { data: result.data || [], error: null };

        } catch (err) {
            console.error('Unexpected error loading questions:', err);
            return { data: null, error: err };
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

            const result = await this.executeQuery(
                supabase
                    .from('Math_Past_Paper')
                    .select('*')
                    .eq('year', year)
                    .order('paper', { ascending: true })
                    .order('question_no', { ascending: true })
            );

            if (result.error) {
                console.error('Database error loading questions by year:', result.error);
                return { data: null, error: result.error };
            }

            console.log(`✅ Successfully loaded ${result.data?.length || 0} questions for year ${year}`);

            return { data: result.data || [], error: null };

        } catch (err) {
            console.error('Unexpected error loading questions by year:', err);
            return { data: null, error: err };
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
            if (!this.isValidQuestionParams(year, paper, questionNo)) {
                return {
                    exists: false,
                    error: new Error('Invalid question parameters')
                };
            }

            const result = await this.executeQuery(
                supabase
                    .from('Math_Past_Paper')
                    .select('id')
                    .eq('year', year)
                    .eq('paper', paper)
                    .eq('question_no', questionNo)
                    .maybeSingle()
            );

            if (result.error) {
                return { exists: false, error: result.error };
            }

            return { exists: !!result.data, error: null };

        } catch (err) {
            return { exists: false, error: err };
        }
    }

    /**
     * Get question statistics (total questions by year/paper)
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    static async getQuestionStatistics() {
        try {
            console.log('🔍 Loading question statistics...');

            const result = await this.executeQuery(
                supabase
                    .from('Math_Past_Paper')
                    .select('year, paper, question_no')
                    .order('year', { ascending: false })
                    .order('paper', { ascending: true })
                    .order('question_no', { ascending: true })
            );

            if (result.error) {
                console.error('Database error loading statistics:', result.error);
                return { data: null, error: result.error };
            }

            // Process statistics
            const stats = {
                totalQuestions: result.data?.length || 0,
                byYear: {},
                byPaper: { 'I': 0, 'II': 0 },
                byYearAndPaper: {}
            };

            result.data?.forEach(question => {
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

            return { data: stats, error: null };

        } catch (err) {
            console.error('Unexpected error loading statistics:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Navigation methods
     */
    static async getNextQuestion(year, paper, questionNo) {
        try {
            console.log(`🔍 Getting next question after: ${year} Paper ${paper} Question ${questionNo}`);

            const result = await this.executeRPC('get_next_question', {
                current_year: year,
                current_paper: paper,
                current_question_no: questionNo
            });

            if (result.error) {
                console.error('Error getting next question:', result.error);
                return { data: null, error: result.error };
            }

            const nextQuestion = result.data && result.data.length > 0 ? result.data[0] : null;

            if (nextQuestion) {
                console.log(`✅ Next question found: ${nextQuestion.year} Paper ${nextQuestion.paper} Question ${nextQuestion.question_no}`);
            } else {
                console.log('ℹ️ No next question found (this is the last question)');
            }

            return { data: nextQuestion, error: null };

        } catch (err) {
            console.error('Unexpected error getting next question:', err);
            return { data: null, error: err };
        }
    }

    static async getPreviousQuestion(year, paper, questionNo) {
        try {
            console.log(`🔍 Getting previous question before: ${year} Paper ${paper} Question ${questionNo}`);

            const result = await this.executeRPC('get_previous_question', {
                current_year: year,
                current_paper: paper,
                current_question_no: questionNo
            });

            if (result.error) {
                console.error('Error getting previous question:', result.error);
                return { data: null, error: result.error };
            }

            const previousQuestion = result.data && result.data.length > 0 ? result.data[0] : null;

            if (previousQuestion) {
                console.log(`✅ Previous question found: ${previousQuestion.year} Paper ${previousQuestion.paper} Question ${previousQuestion.question_no}`);
            } else {
                console.log('ℹ️ No previous question found (this is the first question)');
            }

            return { data: previousQuestion, error: null };

        } catch (err) {
            console.error('Unexpected error getting previous question:', err);
            return { data: null, error: err };
        }
    }

    static async getQuestionNavigation(year, paper, questionNo) {
        try {

            const result = await this.executeRPC('get_question_navigation', {
                current_year: year,
                current_paper: paper,
                current_question_no: questionNo
            });

            if (result.error) {
                console.error('Error getting question navigation:', result.error);
                return { data: null, error: result.error };
            }

            const navigationInfo = result.data && result.data.length > 0 ? result.data[0] : null;

            if (navigationInfo) {
            }

            return { data: navigationInfo, error: null };

        } catch (err) {
            console.error('Unexpected error getting question navigation:', err);
            return { data: null, error: err };
        }
    }

    static async getFirstQuestion() {
        try {

            const result = await this.executeRPC('get_first_question');

            if (result.error) {
                console.error('Error getting first question:', result.error);
                return { data: null, error: result.error };
            }

            const firstQuestion = result.data && result.data.length > 0 ? result.data[0] : null;

            if (firstQuestion) {
            }

            return { data: firstQuestion, error: null };

        } catch (err) {
            console.error('Unexpected error getting first question:', err);
            return { data: null, error: err };
        }
    }

    static async getLastQuestion() {
        try {

            const result = await this.executeRPC('get_last_question');

            if (result.error) {
                console.error('Error getting last question:', result.error);
                return { data: null, error: result.error };
            }

            const lastQuestion = result.data && result.data.length > 0 ? result.data[0] : null;

            if (lastQuestion) {
            }

            return { data: lastQuestion, error: null };

        } catch (err) {
            console.error('Unexpected error getting last question:', err);
            return { data: null, error: err };
        }
    }

    static async getAllNavigationInfo(year, paper, questionNo) {
        try {

            // Get all navigation info in parallel
            const [navigationResult, firstResult, lastResult] = await Promise.all([
                this.getQuestionNavigation(year, paper, questionNo),
                this.getFirstQuestion(),
                this.getLastQuestion()
            ]);

            if (navigationResult.error || firstResult.error || lastResult.error) {
                const errors = [navigationResult.error, firstResult.error, lastResult.error].filter(Boolean);
                console.error('Error getting navigation info:', errors);
                return { data: null, error: errors[0] };
            }

            const navigationInfo = {
                has_previous: navigationResult.data?.has_previous || false,
                has_next: navigationResult.data?.has_next || false,
                previous_question: navigationResult.data?.previous_question || null,
                next_question: navigationResult.data?.next_question || null,
                first_question: firstResult.data ? {
                    year: firstResult.data.year,
                    paper: firstResult.data.paper,
                    question_no: firstResult.data.question_no
                } : null,
                last_question: lastResult.data ? {
                    year: lastResult.data.year,
                    paper: lastResult.data.paper,
                    question_no: lastResult.data.question_no
                } : null
            };

            return { data: navigationInfo, error: null };

        } catch (err) {
            console.error('Unexpected error getting all navigation info:', err);
            return { data: null, error: err };
        }
    }

    /**
     * URL handling methods
     */
    static generateQuestionURL(year, paper, questionNo) {
        if (!this.isValidQuestionParams(year, paper, questionNo)) {
            throw new Error(`Invalid question parameters: year=${year}, paper=${paper}, questionNo=${questionNo}`);
        }

        const normalizedPaper = paper.toUpperCase();
        return `/DSE_Math/${year}/${normalizedPaper}/${questionNo}`;
    }

    static parseQuestionURL(urlPath) {
        if (!urlPath || typeof urlPath !== 'string') {
            return null;
        }

        const match = urlPath.match(/^\/DSE_Math\/(\d{4})\/(I|II)\/(\d+)$/);

        if (!match) {
            return null;
        }

        const [, yearStr, paper, questionNoStr] = match;
        const year = parseInt(yearStr, 10);
        const questionNo = parseInt(questionNoStr, 10);

        if (!this.isValidQuestionParams(year, paper, questionNo)) {
            return null;
        }

        return {
            year: year,
            paper: paper.toUpperCase(),
            questionNo: questionNo
        };
    }

    static isValidQuestionParams(year, paper, questionNo) {
        if (!Number.isInteger(year) || year < 2012 || year > 2025) {
            return false;
        }

        if (!paper || typeof paper !== 'string') {
            return false;
        }

        const normalizedPaper = paper.toUpperCase();
        if (!['I', 'II'].includes(normalizedPaper)) {
            return false;
        }

        if (!Number.isInteger(questionNo) || questionNo < 1) {
            return false;
        }

        if (normalizedPaper === 'I' && questionNo > 20) {
            return false;
        }

        if (normalizedPaper === 'II' && questionNo > 45) {
            return false;
        }

        return true;
    }

    static getQuestionParamsFromRouter(params) {
        if (!params || typeof params !== 'object') {
            return null;
        }

        const { year, paper, questionNo } = params;

        if (!year || !paper || !questionNo) {
            return null;
        }

        const yearNum = parseInt(year, 10);
        const questionNoNum = parseInt(questionNo, 10);

        if (isNaN(yearNum) || isNaN(questionNoNum)) {
            return null;
        }

        return this.isValidQuestionParams(yearNum, paper, questionNoNum)
            ? { year: yearNum, paper: paper.toUpperCase(), questionNo: questionNoNum }
            : null;
    }

    static createQuestionFromParams(params) {
        if (!params || !this.isValidQuestionParams(params.year, params.paper, params.questionNo)) {
            throw new Error('Invalid question parameters');
        }

        return {
            year: params.year,
            paper: params.paper,
            question_no: params.questionNo,
            url: this.generateQuestionURL(params.year, params.paper, params.questionNo),
            displayText: `${params.year} Paper ${params.paper} Question ${params.questionNo}`,
            shortDisplay: `Q${params.questionNo}`
        };
    }

    static isQuestionURL(urlPath) {
        return this.parseQuestionURL(urlPath) !== null;
    }

    static getValidYears() {
        return Array.from({ length: 14 }, (_, i) => 2012 + i);
    }

    static getValidQuestionNumbers(paper) {
        if (!paper || typeof paper !== 'string') {
            return [];
        }

        const normalizedPaper = paper.toUpperCase();
        if (normalizedPaper === 'I') {
            return Array.from({ length: 20 }, (_, i) => i + 1);
        } else if (normalizedPaper === 'II') {
            return Array.from({ length: 45 }, (_, i) => i + 1);
        }

        return [];
    }

    static generateAllQuestionURLs() {
        const urls = [];
        const years = this.getValidYears();
        const papers = ['I', 'II'];

        years.forEach(year => {
            papers.forEach(paper => {
                const questionNumbers = this.getValidQuestionNumbers(paper);
                questionNumbers.forEach(questionNo => {
                    urls.push(this.generateQuestionURL(year, paper, questionNo));
                });
            });
        });

        return urls;
    }
}

export default UnifiedQuestionService;
