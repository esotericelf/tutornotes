/**
 * Tests for QuestionURLService
 * Comprehensive testing to ensure error-free URL generation and parsing
 */

import QuestionURLService from '../questionUrlService';

describe('QuestionURLService', () => {
    describe('generateQuestionURL', () => {
        test('should generate correct URL for valid parameters', () => {
            expect(QuestionURLService.generateQuestionURL(2023, 'I', 15)).toBe('/DSE_Math/2023/I/15');
            expect(QuestionURLService.generateQuestionURL(2020, 'II', 30)).toBe('/DSE_Math/2020/II/30');
            expect(QuestionURLService.generateQuestionURL(2012, 'I', 1)).toBe('/DSE_Math/2012/I/1');
            expect(QuestionURLService.generateQuestionURL(2025, 'II', 45)).toBe('/DSE_Math/2025/II/45');
        });

        test('should normalize paper to uppercase', () => {
            expect(QuestionURLService.generateQuestionURL(2023, 'i', 15)).toBe('/DSE_Math/2023/I/15');
            expect(QuestionURLService.generateQuestionURL(2023, 'ii', 30)).toBe('/DSE_Math/2023/II/30');
        });

        test('should throw error for invalid year', () => {
            expect(() => QuestionURLService.generateQuestionURL(2011, 'I', 15)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL(2026, 'I', 15)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL('2023', 'I', 15)).toThrow('Invalid question parameters');
        });

        test('should throw error for invalid paper', () => {
            expect(() => QuestionURLService.generateQuestionURL(2023, 'III', 15)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL(2023, '', 15)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL(2023, null, 15)).toThrow('Invalid question parameters');
        });

        test('should throw error for invalid question number', () => {
            expect(() => QuestionURLService.generateQuestionURL(2023, 'I', 0)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL(2023, 'I', 21)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL(2023, 'II', 46)).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.generateQuestionURL(2023, 'I', '15')).toThrow('Invalid question parameters');
        });
    });

    describe('parseQuestionURL', () => {
        test('should parse valid URLs correctly', () => {
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2023/I/15')).toEqual({
                year: 2023,
                paper: 'I',
                questionNo: 15
            });
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2020/II/30')).toEqual({
                year: 2020,
                paper: 'II',
                questionNo: 30
            });
        });

        test('should return null for invalid URLs', () => {
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2023/I')).toBeNull();
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2023/I/15/extra')).toBeNull();
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2023/III/15')).toBeNull();
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2011/I/15')).toBeNull();
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2023/I/21')).toBeNull();
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2023/II/46')).toBeNull();
            expect(QuestionURLService.parseQuestionURL('')).toBeNull();
            expect(QuestionURLService.parseQuestionURL(null)).toBeNull();
        });

        test('should handle edge cases', () => {
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2012/I/1')).toEqual({
                year: 2012,
                paper: 'I',
                questionNo: 1
            });
            expect(QuestionURLService.parseQuestionURL('/DSE_Math/2025/II/45')).toEqual({
                year: 2025,
                paper: 'II',
                questionNo: 45
            });
        });
    });

    describe('isValidQuestionParams', () => {
        test('should return true for valid parameters', () => {
            expect(QuestionURLService.isValidQuestionParams(2023, 'I', 15)).toBe(true);
            expect(QuestionURLService.isValidQuestionParams(2020, 'II', 30)).toBe(true);
            expect(QuestionURLService.isValidQuestionParams(2012, 'I', 1)).toBe(true);
            expect(QuestionURLService.isValidQuestionParams(2025, 'II', 45)).toBe(true);
        });

        test('should return false for invalid years', () => {
            expect(QuestionURLService.isValidQuestionParams(2011, 'I', 15)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2026, 'I', 15)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams('2023', 'I', 15)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023.5, 'I', 15)).toBe(false);
        });

        test('should return false for invalid papers', () => {
            expect(QuestionURLService.isValidQuestionParams(2023, 'III', 15)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, '', 15)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, null, 15)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, 'A', 15)).toBe(false);
        });

        test('should return false for invalid question numbers', () => {
            expect(QuestionURLService.isValidQuestionParams(2023, 'I', 0)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, 'I', 21)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, 'II', 46)).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, 'I', '15')).toBe(false);
            expect(QuestionURLService.isValidQuestionParams(2023, 'I', 15.5)).toBe(false);
        });
    });

    describe('getQuestionParamsFromRouter', () => {
        test('should extract valid parameters from router params', () => {
            const params = { year: '2023', paper: 'I', questionNo: '15' };
            expect(QuestionURLService.getQuestionParamsFromRouter(params)).toEqual({
                year: 2023,
                paper: 'I',
                questionNo: 15
            });
        });

        test('should return null for invalid router params', () => {
            expect(QuestionURLService.getQuestionParamsFromRouter({})).toBeNull();
            expect(QuestionURLService.getQuestionParamsFromRouter({ year: '2023' })).toBeNull();
            expect(QuestionURLService.getQuestionParamsFromRouter({ year: 'invalid', paper: 'I', questionNo: '15' })).toBeNull();
            expect(QuestionURLService.getQuestionParamsFromRouter(null)).toBeNull();
        });
    });

    describe('createQuestionFromParams', () => {
        test('should create question object from valid parameters', () => {
            const params = { year: 2023, paper: 'I', questionNo: 15 };
            const question = QuestionURLService.createQuestionFromParams(params);

            expect(question).toEqual({
                year: 2023,
                paper: 'I',
                question_no: 15,
                url: '/DSE_Math/2023/I/15',
                displayText: '2023 Paper I Question 15',
                shortDisplay: 'Q15'
            });
        });

        test('should throw error for invalid parameters', () => {
            expect(() => QuestionURLService.createQuestionFromParams({ year: 2011, paper: 'I', questionNo: 15 })).toThrow('Invalid question parameters');
            expect(() => QuestionURLService.createQuestionFromParams(null)).toThrow('Invalid question parameters');
        });
    });

    describe('isQuestionURL', () => {
        test('should return true for valid question URLs', () => {
            expect(QuestionURLService.isQuestionURL('/DSE_Math/2023/I/15')).toBe(true);
            expect(QuestionURLService.isQuestionURL('/DSE_Math/2020/II/30')).toBe(true);
        });

        test('should return false for invalid URLs', () => {
            expect(QuestionURLService.isQuestionURL('/DSE_Math')).toBe(false);
            expect(QuestionURLService.isQuestionURL('/DSE_Math/2023/I')).toBe(false);
            expect(QuestionURLService.isQuestionURL('/other/path')).toBe(false);
        });
    });

    describe('getValidYears', () => {
        test('should return array of valid years', () => {
            const years = QuestionURLService.getValidYears();
            expect(years).toHaveLength(14);
            expect(years[0]).toBe(2012);
            expect(years[13]).toBe(2025);
        });
    });

    describe('getValidQuestionNumbers', () => {
        test('should return correct question numbers for Paper I', () => {
            const numbers = QuestionURLService.getValidQuestionNumbers('I');
            expect(numbers).toHaveLength(20);
            expect(numbers[0]).toBe(1);
            expect(numbers[19]).toBe(20);
        });

        test('should return correct question numbers for Paper II', () => {
            const numbers = QuestionURLService.getValidQuestionNumbers('II');
            expect(numbers).toHaveLength(45);
            expect(numbers[0]).toBe(1);
            expect(numbers[44]).toBe(45);
        });

        test('should return empty array for invalid paper', () => {
            expect(QuestionURLService.getValidQuestionNumbers('III')).toEqual([]);
            expect(QuestionURLService.getValidQuestionNumbers('')).toEqual([]);
            expect(QuestionURLService.getValidQuestionNumbers(null)).toEqual([]);
        });
    });

    describe('generateAllQuestionURLs', () => {
        test('should generate correct number of URLs', () => {
            const urls = QuestionURLService.generateAllQuestionURLs();
            // 14 years × (20 questions for Paper I + 45 questions for Paper II) = 14 × 65 = 910 URLs
            expect(urls).toHaveLength(910);
        });

        test('should generate valid URLs', () => {
            const urls = QuestionURLService.generateAllQuestionURLs();
            urls.forEach(url => {
                expect(QuestionURLService.isQuestionURL(url)).toBe(true);
            });
        });
    });
});
