/**
 * Question Navigation Service
 * Handles finding next/previous questions in logical sequence
 * Sequence: 2012-2025 (earlier years are previous), Paper I before Paper II, question_no ascending
 */

import { supabase } from '../supabase';

class QuestionNavigationService {
    /**
     * Get the next question in sequence
     * @param {number} year - Current question year
     * @param {string} paper - Current question paper ('I' or 'II')
     * @param {number} questionNo - Current question number
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    static async getNextQuestion(year, paper, questionNo) {
        try {
            console.log(`🔍 Getting next question after: ${year} Paper ${paper} Question ${questionNo}`);

            const { data, error } = await supabase
                .rpc('get_next_question', {
                    current_year: year,
                    current_paper: paper,
                    current_question_no: questionNo
                });

            if (error) {
                console.error('Error getting next question:', error);
                return { data: null, error };
            }

            const nextQuestion = data && data.length > 0 ? data[0] : null;

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

    /**
     * Get the previous question in sequence
     * @param {number} year - Current question year
     * @param {string} paper - Current question paper ('I' or 'II')
     * @param {number} questionNo - Current question number
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    static async getPreviousQuestion(year, paper, questionNo) {
        try {
            console.log(`🔍 Getting previous question before: ${year} Paper ${paper} Question ${questionNo}`);

            const { data, error } = await supabase
                .rpc('get_previous_question', {
                    current_year: year,
                    current_paper: paper,
                    current_question_no: questionNo
                });

            if (error) {
                console.error('Error getting previous question:', error);
                return { data: null, error };
            }

            const previousQuestion = data && data.length > 0 ? data[0] : null;

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

    /**
     * Get navigation info for a question (next and previous)
     * @param {number} year - Current question year
     * @param {string} paper - Current question paper ('I' or 'II')
     * @param {number} questionNo - Current question number
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    static async getQuestionNavigation(year, paper, questionNo) {
        try {
            console.log(`🔍 Getting navigation info for: ${year} Paper ${paper} Question ${questionNo}`);

            const { data, error } = await supabase
                .rpc('get_question_navigation', {
                    current_year: year,
                    current_paper: paper,
                    current_question_no: questionNo
                });

            if (error) {
                console.error('Error getting question navigation:', error);
                return { data: null, error };
            }

            const navigationInfo = data && data.length > 0 ? data[0] : null;

            if (navigationInfo) {
                console.log(`✅ Navigation info: has_previous=${navigationInfo.has_previous}, has_next=${navigationInfo.has_next}`);
            }

            return { data: navigationInfo, error: null };

        } catch (err) {
            console.error('Unexpected error getting question navigation:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get the first question in the sequence
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    static async getFirstQuestion() {
        try {
            console.log('🔍 Getting first question in sequence');

            const { data, error } = await supabase
                .rpc('get_first_question');

            if (error) {
                console.error('Error getting first question:', error);
                return { data: null, error };
            }

            const firstQuestion = data && data.length > 0 ? data[0] : null;

            if (firstQuestion) {
                console.log(`✅ First question: ${firstQuestion.year} Paper ${firstQuestion.paper} Question ${firstQuestion.question_no}`);
            }

            return { data: firstQuestion, error: null };

        } catch (err) {
            console.error('Unexpected error getting first question:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get the last question in the sequence
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    static async getLastQuestion() {
        try {
            console.log('🔍 Getting last question in sequence');

            const { data, error } = await supabase
                .rpc('get_last_question');

            if (error) {
                console.error('Error getting last question:', error);
                return { data: null, error };
            }

            const lastQuestion = data && data.length > 0 ? data[0] : null;

            if (lastQuestion) {
                console.log(`✅ Last question: ${lastQuestion.year} Paper ${lastQuestion.paper} Question ${lastQuestion.question_no}`);
            }

            return { data: lastQuestion, error: null };

        } catch (err) {
            console.error('Unexpected error getting last question:', err);
            return { data: null, error: err };
        }
    }

    /**
     * Get all navigation info for a question (next, previous, first, last)
     * @param {number} year - Current question year
     * @param {string} paper - Current question paper ('I' or 'II')
     * @param {number} questionNo - Current question number
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    static async getAllNavigationInfo(year, paper, questionNo) {
        try {
            console.log(`🔍 Getting all navigation info for: ${year} Paper ${paper} Question ${questionNo}`);

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

            console.log('✅ All navigation info retrieved successfully');
            return { data: navigationInfo, error: null };

        } catch (err) {
            console.error('Unexpected error getting all navigation info:', err);
            return { data: null, error: err };
        }
    }
}

export default QuestionNavigationService;
