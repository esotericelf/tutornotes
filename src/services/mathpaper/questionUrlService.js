/**
 * Question URL Service for Math Papers
 * This service handles URL generation and parsing for individual questions
 * Format: /DSE_Math/{year}/{paper}/{questionNo}
 * Example: /DSE_Math/2023/I/15
 */

class QuestionURLService {
    /**
     * Generate URL for a specific question
     * @param {number} year - Question year (2012-2025)
     * @param {string} paper - Paper type ('I' or 'II')
     * @param {number} questionNo - Question number (1-20 for Paper I, 1-45 for Paper II)
     * @returns {string} URL path like "/DSE_Math/2023/I/15"
     * @throws {Error} If parameters are invalid
     */
    static generateQuestionURL(year, paper, questionNo) {
        // Validate parameters before generating URL
        if (!this.isValidQuestionParams(year, paper, questionNo)) {
            throw new Error(`Invalid question parameters: year=${year}, paper=${paper}, questionNo=${questionNo}`);
        }

        // Ensure paper is uppercase for consistency
        const normalizedPaper = paper.toUpperCase();

        return `/DSE_Math/${year}/${normalizedPaper}/${questionNo}`;
    }

    /**
     * Parse question parameters from URL path
     * @param {string} urlPath - URL path like "/DSE_Math/2023/I/15"
     * @returns {Object|null} {year, paper, questionNo} or null if invalid
     */
    static parseQuestionURL(urlPath) {
        if (!urlPath || typeof urlPath !== 'string') {
            return null;
        }

        // Use strict regex to match the exact pattern
        const match = urlPath.match(/^\/DSE_Math\/(\d{4})\/(I|II)\/(\d+)$/);

        if (!match) {
            return null;
        }

        const [, yearStr, paper, questionNoStr] = match;
        const year = parseInt(yearStr, 10);
        const questionNo = parseInt(questionNoStr, 10);

        // Validate the parsed values
        if (!this.isValidQuestionParams(year, paper, questionNo)) {
            return null;
        }

        return {
            year: year,
            paper: paper.toUpperCase(),
            questionNo: questionNo
        };
    }

    /**
     * Validate question parameters
     * @param {number} year - Question year
     * @param {string} paper - Paper type
     * @param {number} questionNo - Question number
     * @returns {boolean} True if valid, false otherwise
     */
    static isValidQuestionParams(year, paper, questionNo) {
        // Check if year is a valid integer within range
        if (!Number.isInteger(year) || year < 2012 || year > 2025) {
            return false;
        }

        // Check if paper is valid
        if (!paper || typeof paper !== 'string') {
            return false;
        }

        const normalizedPaper = paper.toUpperCase();
        if (!['I', 'II'].includes(normalizedPaper)) {
            return false;
        }

        // Check if question number is valid
        if (!Number.isInteger(questionNo) || questionNo < 1) {
            return false;
        }

        // Check question number limits based on paper type
        if (normalizedPaper === 'I' && questionNo > 20) {
            return false;
        }

        if (normalizedPaper === 'II' && questionNo > 45) {
            return false;
        }

        return true;
    }

    /**
     * Get question parameters from React Router params
     * @param {Object} params - React Router params object
     * @returns {Object|null} {year, paper, questionNo} or null if invalid
     */
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

    /**
     * Create a question object from URL parameters
     * @param {Object} params - {year, paper, questionNo}
     * @returns {Object} Question object with URL and display properties
     */
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

    /**
     * Check if a URL path is a question URL
     * @param {string} urlPath - URL path to check
     * @returns {boolean} True if it's a question URL
     */
    static isQuestionURL(urlPath) {
        return this.parseQuestionURL(urlPath) !== null;
    }

    /**
     * Get all valid years for URL generation
     * @returns {Array<number>} Array of valid years
     */
    static getValidYears() {
        return Array.from({ length: 14 }, (_, i) => 2012 + i);
    }

    /**
     * Get valid question numbers for a paper type
     * @param {string} paper - Paper type ('I' or 'II')
     * @returns {Array<number>} Array of valid question numbers
     */
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

    /**
     * Generate all possible question URLs for testing
     * @returns {Array<string>} Array of all valid question URLs
     */
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

export default QuestionURLService;
