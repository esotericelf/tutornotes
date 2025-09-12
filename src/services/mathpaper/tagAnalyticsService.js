/**
 * Tag Analytics Service for Math Papers
 * This service provides comprehensive analytics and statistics for tags
 */

import TagService from './tagService';
import URLTagService from './urlTagService';

class TagAnalyticsService {
    /**
     * Get comprehensive tag analytics
     * @param {string} tag - Tag to analyze
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async getTagAnalytics(tag) {
        try {
            if (!tag || tag.trim().length === 0) {
                return {
                    data: null,
                    error: new Error('Tag is required for analytics')
                };
            }

            console.log('📊 Getting analytics for tag:', tag);

            // Get basic tag statistics
            const statsResult = await TagService.getTagStatistics(tag.trim());
            if (statsResult.error) {
                console.error('Error getting tag statistics:', statsResult.error);
                return statsResult;
            }

            const stats = statsResult.data;
            if (!stats) {
                return {
                    data: null,
                    error: new Error(`No data found for tag: ${tag}`)
                };
            }

            // Get papers for this tag to analyze patterns
            const papersResult = await TagService.getMathPapersByTags([tag.trim()], 100);
            if (papersResult.error) {
                console.error('Error getting papers for analytics:', papersResult.error);
                return papersResult;
            }

            const papers = papersResult.data || [];

            // Calculate additional analytics
            const analytics = {
                // Basic statistics
                ...stats,

                // Enhanced analytics
                analytics: {
                    // Year distribution analysis
                    yearDistribution: this.analyzeYearDistribution(papers),

                    // Paper type analysis
                    paperTypeDistribution: this.analyzePaperTypeDistribution(papers),

                    // Question number patterns
                    questionNumberPatterns: this.analyzeQuestionNumberPatterns(papers),

                    // Tag co-occurrence analysis
                    tagCoOccurrence: this.analyzeTagCoOccurrence(papers, tag.trim()),

                    // Difficulty trends (based on question numbers)
                    difficultyTrends: this.analyzeDifficultyTrends(papers),

                    // Recent activity
                    recentActivity: this.analyzeRecentActivity(papers),

                    // Search popularity
                    searchPopularity: this.calculateSearchPopularity(stats)
                },

                // URL information
                url: URLTagService.createURLWithTags([tag.trim()]),
                encodedTag: URLTagService.encodeTagsForURL([tag.trim()])
            };

            console.log('✅ Tag analytics generated successfully');

            return {
                data: analytics,
                error: null
            };

        } catch (err) {
            console.error('Unexpected error getting tag analytics:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Analyze year distribution of papers
     * @param {Array} papers - Array of papers
     * @returns {Object} Year distribution analysis
     */
    static analyzeYearDistribution(papers) {
        const yearCounts = {};
        const years = [];

        papers.forEach(paper => {
            const year = paper.year;
            yearCounts[year] = (yearCounts[year] || 0) + 1;
            if (!years.includes(year)) {
                years.push(year);
            }
        });

        const sortedYears = years.sort((a, b) => a - b);
        const yearData = sortedYears.map(year => ({
            year,
            count: yearCounts[year],
            percentage: ((yearCounts[year] / papers.length) * 100).toFixed(1)
        }));

        return {
            totalYears: sortedYears.length,
            yearRange: {
                earliest: Math.min(...sortedYears),
                latest: Math.max(...sortedYears),
                span: Math.max(...sortedYears) - Math.min(...sortedYears) + 1
            },
            yearData,
            averagePerYear: (papers.length / sortedYears.length).toFixed(1),
            trend: this.calculateTrend(yearData)
        };
    }

    /**
     * Analyze paper type distribution
     * @param {Array} papers - Array of papers
     * @returns {Object} Paper type distribution
     */
    static analyzePaperTypeDistribution(papers) {
        const paperCounts = {};

        papers.forEach(paper => {
            const paperType = paper.paper;
            paperCounts[paperType] = (paperCounts[paperType] || 0) + 1;
        });

        const paperTypes = Object.keys(paperCounts);
        const paperData = paperTypes.map(type => ({
            type,
            count: paperCounts[type],
            percentage: ((paperCounts[type] / papers.length) * 100).toFixed(1)
        }));

        return {
            totalTypes: paperTypes.length,
            paperData,
            mostCommon: paperData.reduce((max, current) =>
                current.count > max.count ? current : max, paperData[0] || {})
        };
    }

    /**
     * Analyze question number patterns
     * @param {Array} papers - Array of papers
     * @returns {Object} Question number patterns
     */
    static analyzeQuestionNumberPatterns(papers) {
        const questionNumbers = papers.map(paper => paper.question_no);
        const sortedQuestions = questionNumbers.sort((a, b) => a - b);

        return {
            totalQuestions: questionNumbers.length,
            range: {
                min: Math.min(...questionNumbers),
                max: Math.max(...questionNumbers),
                span: Math.max(...questionNumbers) - Math.min(...questionNumbers) + 1
            },
            average: (questionNumbers.reduce((sum, num) => sum + num, 0) / questionNumbers.length).toFixed(1),
            median: this.calculateMedian(sortedQuestions),
            distribution: this.calculateQuestionDistribution(questionNumbers)
        };
    }

    /**
     * Analyze tag co-occurrence
     * @param {Array} papers - Array of papers
     * @param {string} targetTag - The tag being analyzed
     * @returns {Object} Tag co-occurrence analysis
     */
    static analyzeTagCoOccurrence(papers, targetTag) {
        const tagCounts = {};
        let totalCoOccurrences = 0;

        papers.forEach(paper => {
            if (paper.tags && Array.isArray(paper.tags)) {
                paper.tags.forEach(tag => {
                    if (tag !== targetTag) {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                        totalCoOccurrences++;
                    }
                });
            }
        });

        const coOccurrenceData = Object.entries(tagCounts)
            .map(([tag, count]) => ({
                tag,
                count,
                percentage: ((count / papers.length) * 100).toFixed(1),
                strength: ((count / totalCoOccurrences) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 co-occurring tags

        return {
            totalCoOccurrences,
            uniqueCoOccurringTags: Object.keys(tagCounts).length,
            topCoOccurrences: coOccurrenceData,
            averageCoOccurrences: (totalCoOccurrences / papers.length).toFixed(1)
        };
    }

    /**
     * Analyze difficulty trends (based on question numbers)
     * @param {Array} papers - Array of papers
     * @returns {Object} Difficulty trends
     */
    static analyzeDifficultyTrends(papers) {
        const difficultyRanges = {
            easy: { min: 1, max: 10, count: 0 },
            medium: { min: 11, max: 20, count: 0 },
            hard: { min: 21, max: 45, count: 0 }
        };

        papers.forEach(paper => {
            const questionNo = paper.question_no;
            if (questionNo >= 1 && questionNo <= 10) {
                difficultyRanges.easy.count++;
            } else if (questionNo >= 11 && questionNo <= 20) {
                difficultyRanges.medium.count++;
            } else if (questionNo >= 21 && questionNo <= 45) {
                difficultyRanges.hard.count++;
            }
        });

        const total = papers.length;
        const difficultyData = Object.entries(difficultyRanges).map(([level, data]) => ({
            level,
            count: data.count,
            percentage: total > 0 ? ((data.count / total) * 100).toFixed(1) : '0.0'
        }));

        return {
            difficultyData,
            mostCommonDifficulty: difficultyData.reduce((max, current) =>
                current.count > max.count ? current : max, difficultyData[0] || {}),
            difficultyDistribution: difficultyData
        };
    }

    /**
     * Analyze recent activity
     * @param {Array} papers - Array of papers
     * @returns {Object} Recent activity analysis
     */
    static analyzeRecentActivity(papers) {
        const currentYear = new Date().getFullYear();
        const recentYears = [currentYear - 2, currentYear - 1, currentYear];

        const recentActivity = recentYears.map(year => {
            const yearPapers = papers.filter(paper => paper.year === year);
            return {
                year,
                count: yearPapers.length,
                percentage: papers.length > 0 ? ((yearPapers.length / papers.length) * 100).toFixed(1) : '0.0'
            };
        });

        const totalRecent = recentActivity.reduce((sum, activity) => sum + activity.count, 0);

        return {
            recentActivity,
            totalRecent,
            recentPercentage: papers.length > 0 ? ((totalRecent / papers.length) * 100).toFixed(1) : '0.0',
            isActive: totalRecent > 0,
            trend: this.calculateRecentTrend(recentActivity)
        };
    }

    /**
     * Calculate search popularity score
     * @param {Object} stats - Tag statistics
     * @returns {Object} Search popularity metrics
     */
    static calculateSearchPopularity(stats) {
        const totalPapers = stats.total_papers || 0;
        const relatedTagsCount = stats.related_tags?.length || 0;

        // Calculate popularity score based on multiple factors
        const popularityScore = Math.min(100,
            (totalPapers * 2) + // Base score from total papers
            (relatedTagsCount * 1.5) + // Bonus for related tags
            (stats.most_common_years?.length || 0) * 2 // Bonus for year diversity
        );

        let popularityLevel;
        if (popularityScore >= 80) popularityLevel = 'Very High';
        else if (popularityScore >= 60) popularityLevel = 'High';
        else if (popularityScore >= 40) popularityLevel = 'Medium';
        else if (popularityScore >= 20) popularityLevel = 'Low';
        else popularityLevel = 'Very Low';

        return {
            score: Math.round(popularityScore),
            level: popularityLevel,
            factors: {
                totalPapers,
                relatedTagsCount,
                yearDiversity: stats.most_common_years?.length || 0
            }
        };
    }

    /**
     * Calculate trend from year data
     * @param {Array} yearData - Array of year data
     * @returns {string} Trend direction
     */
    static calculateTrend(yearData) {
        if (yearData.length < 2) return 'Insufficient Data';

        const recent = yearData.slice(-3); // Last 3 years
        const older = yearData.slice(0, -3); // Earlier years

        if (recent.length === 0 || older.length === 0) return 'Insufficient Data';

        const recentAvg = recent.reduce((sum, year) => sum + year.count, 0) / recent.length;
        const olderAvg = older.reduce((sum, year) => sum + year.count, 0) / older.length;

        const change = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (change > 10) return 'Increasing';
        if (change < -10) return 'Decreasing';
        return 'Stable';
    }

    /**
     * Calculate recent trend
     * @param {Array} recentActivity - Recent activity data
     * @returns {string} Recent trend
     */
    static calculateRecentTrend(recentActivity) {
        if (recentActivity.length < 2) return 'Insufficient Data';

        const counts = recentActivity.map(activity => activity.count);
        const isIncreasing = counts.every((count, index) =>
            index === 0 || count >= counts[index - 1]
        );
        const isDecreasing = counts.every((count, index) =>
            index === 0 || count <= counts[index - 1]
        );

        if (isIncreasing) return 'Increasing';
        if (isDecreasing) return 'Decreasing';
        return 'Fluctuating';
    }

    /**
     * Calculate median
     * @param {Array} sortedArray - Sorted array of numbers
     * @returns {number} Median value
     */
    static calculateMedian(sortedArray) {
        if (sortedArray.length === 0) return 0;

        const mid = Math.floor(sortedArray.length / 2);
        return sortedArray.length % 2 === 0
            ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
            : sortedArray[mid];
    }

    /**
     * Calculate question distribution
     * @param {Array} questionNumbers - Array of question numbers
     * @returns {Object} Question distribution
     */
    static calculateQuestionDistribution(questionNumbers) {
        const ranges = [
            { name: '1-10', min: 1, max: 10, count: 0 },
            { name: '11-20', min: 11, max: 20, count: 0 },
            { name: '21-30', min: 21, max: 30, count: 0 },
            { name: '31-40', min: 31, max: 40, count: 0 },
            { name: '41-45', min: 41, max: 45, count: 0 }
        ];

        questionNumbers.forEach(num => {
            const range = ranges.find(r => num >= r.min && num <= r.max);
            if (range) range.count++;
        });

        return ranges.map(range => ({
            ...range,
            percentage: questionNumbers.length > 0 ?
                ((range.count / questionNumbers.length) * 100).toFixed(1) : '0.0'
        }));
    }

    /**
     * Get tag comparison analytics
     * @param {Array<string>} tags - Array of tags to compare
     * @returns {Promise<{data: Object, error: Error}>}
     */
    static async getTagComparisonAnalytics(tags) {
        try {
            if (!tags || tags.length < 2) {
                return {
                    data: null,
                    error: new Error('At least 2 tags required for comparison')
                };
            }

            console.log('📊 Getting comparison analytics for tags:', tags);

            const comparisonData = await Promise.all(
                tags.map(async (tag) => {
                    const result = await this.getTagAnalytics(tag);
                    return {
                        tag,
                        data: result.data,
                        error: result.error
                    };
                })
            );

            const validData = comparisonData.filter(item => !item.error);
            const errors = comparisonData.filter(item => item.error);

            if (validData.length === 0) {
                return {
                    data: null,
                    error: new Error('No valid data found for comparison')
                };
            }

            const comparison = {
                tags: tags,
                validTags: validData.map(item => item.tag),
                errors: errors.map(item => ({ tag: item.tag, error: item.error.message })),
                comparison: {
                    totalPapers: validData.map(item => item.data.total_papers),
                    yearRanges: validData.map(item => item.data.year_range),
                    popularityScores: validData.map(item => item.data.analytics.searchPopularity.score),
                    difficultyDistributions: validData.map(item => item.data.analytics.difficultyTrends),
                    recentActivity: validData.map(item => item.data.analytics.recentActivity)
                },
                summary: this.generateComparisonSummary(validData)
            };

            console.log('✅ Tag comparison analytics generated successfully');

            return {
                data: comparison,
                error: null
            };

        } catch (err) {
            console.error('Unexpected error getting tag comparison analytics:', err);
            return {
                data: null,
                error: err
            };
        }
    }

    /**
     * Generate comparison summary
     * @param {Array} validData - Array of valid tag data
     * @returns {Object} Comparison summary
     */
    static generateComparisonSummary(validData) {
        const totalPapers = validData.map(item => item.data.total_papers);
        const popularityScores = validData.map(item => item.data.analytics.searchPopularity.score);

        return {
            mostPopular: validData.reduce((max, current) =>
                current.data.total_papers > max.data.total_papers ? current : max, validData[0]),
            highestScore: validData.reduce((max, current) =>
                current.data.analytics.searchPopularity.score > max.data.analytics.searchPopularity.score ? current : max, validData[0]),
            totalPapersSum: totalPapers.reduce((sum, count) => sum + count, 0),
            averagePapers: (totalPapers.reduce((sum, count) => sum + count, 0) / totalPapers.length).toFixed(1),
            averagePopularity: (popularityScores.reduce((sum, score) => sum + score, 0) / popularityScores.length).toFixed(1)
        };
    }
}

export default TagAnalyticsService;
