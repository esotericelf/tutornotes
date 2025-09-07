/**
 * Practice Quiz Service
 * Handles topic selection, question generation, and test creation for practice quizzes
 */

import { supabase } from '../../../services/supabase';
import { randomizeQuestions } from '../utils/answerRandomizer';

class PracticeQuizService {
    /**
     * Get all distinct topics from topic_tags table
     * @returns {Promise<Array>} - Array of distinct topics
     */
    async getDistinctTopics() {
        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('topic')
                .eq('content_type', 'master_tag')
                .eq('is_active', true);

            if (error) throw error;

            // Get distinct topics
            const distinctTopics = [...new Set(data.map(item => item.topic))];
            return distinctTopics.sort();
        } catch (error) {
            console.error('Error fetching distinct topics:', error);
            throw error;
        }
    }

    /**
     * Get all tags for a specific topic
     * @param {string} topic - Topic name
     * @returns {Promise<Array>} - Array of tags for the topic
     */
    async getTagsForTopic(topic) {
        try {
            const { data, error } = await supabase
                .from('topic_tags')
                .select('tag')
                .eq('topic', topic)
                .eq('content_type', 'master_tag')
                .eq('is_active', true);

            if (error) throw error;

            // Get distinct tags
            const distinctTags = [...new Set(data.map(item => item.tag))];
            return distinctTags.sort();
        } catch (error) {
            console.error('Error fetching tags for topic:', error);
            throw error;
        }
    }

    /**
     * Get questions by topic and tag
     * @param {string} topic - Topic name
     * @param {string} tag - Tag name (optional)
     * @param {number} limit - Maximum number of questions to return
     * @returns {Promise<Array>} - Array of question IDs
     */
    async getQuestionsByTopicAndTag(topic, tag = null, limit = 50) {
        try {
            // First, try to get questions that are already tagged with this topic/tag
            let query = supabase
                .from('topic_tags')
                .select('content_id')
                .eq('topic', topic)
                .eq('content_type', 'quiz_question')
                .eq('is_active', true);

            if (tag) {
                query = query.eq('tag', tag);
            }

            const { data, error } = await query.limit(limit);

            if (error) throw error;

            // If we have tagged questions, return them
            if (data && data.length > 0) {
                const questionIds = data.map(item => item.content_id);
                console.log(`Found ${questionIds.length} tagged questions for topic: ${topic}${tag ? `, tag: ${tag}` : ''}`);
                return questionIds;
            }

            // If no tagged questions exist, try to find questions by subject_area or tags array
            console.log(`No tagged questions found for topic: ${topic}${tag ? `, tag: ${tag}` : ''}. Searching by subject_area...`);
            
            // Try to match by subject_area field in quiz_questions table
            let questionsQuery = supabase
                .from('quiz_questions')
                .select('id')
                .eq('is_active', true);

            // Try to match topic with subject_area (case-insensitive)
            questionsQuery = questionsQuery.ilike('subject_area', `%${topic}%`);

            const { data: subjectQuestions, error: subjectError } = await questionsQuery.limit(limit);

            if (subjectError) {
                console.warn('Error searching by subject_area:', subjectError);
            }

            if (subjectQuestions && subjectQuestions.length > 0) {
                const questionIds = subjectQuestions.map(q => q.id);
                console.log(`Found ${questionIds.length} questions by subject_area for topic: ${topic}`);
                return questionIds;
            }

            // If still no questions found, try searching in the tags array
            console.log(`No questions found by subject_area. Searching by tags array...`);
            
            let tagQuery = supabase
                .from('quiz_questions')
                .select('id')
                .eq('is_active', true)
                .contains('tags', [topic]);
            
            // If a specific tag is provided, also filter by that tag
            if (tag) {
                tagQuery = tagQuery.contains('tags', [tag]);
            }
            
            const { data: tagQuestions, error: tagError } = await tagQuery.limit(limit);

            if (tagError) {
                console.warn('Error searching by tags array:', tagError);
            }

            if (tagQuestions && tagQuestions.length > 0) {
                const questionIds = tagQuestions.map(q => q.id);
                console.log(`Found ${questionIds.length} questions by tags array for topic: ${topic}`);
                return questionIds;
            }

            // If still no questions found, return empty array
            console.log(`No questions found for topic: ${topic}${tag ? `, tag: ${tag}` : ''}`);
            return [];
        } catch (error) {
            console.error('Error fetching questions by topic and tag:', error);
            throw error;
        }
    }

    /**
     * Generate a practice quiz with available questions (up to 10, or as many as available)
     * @param {string} topic - Topic name
     * @param {string} tag - Tag name (optional)
     * @param {string} userId - User ID for deterministic randomization
     * @returns {Promise<Object>} - Quiz object with questions
     */
    async generatePracticeQuiz(topic, tag = null, userId = null) {
        try {
            // Get available questions
            const questionIds = await this.getQuestionsByTopicAndTag(topic, tag, 100);

            if (questionIds.length === 0) {
                throw new Error(`No questions found for topic: ${topic}${tag ? ` and tag: ${tag}` : ''}`);
            }

            // Select questions - use all available if less than 10, otherwise randomly select 10
            const targetCount = Math.min(10, questionIds.length);
            const selectedQuestionIds = this.selectRandomQuestions(questionIds, targetCount);

            console.log(`Selected ${selectedQuestionIds.length} questions out of ${questionIds.length} available for topic: ${topic}`);

            // Fetch full question data
            const { data: questions, error } = await supabase
                .from('quiz_questions')
                .select('*')
                .in('id', selectedQuestionIds)
                .eq('is_active', true);

            if (error) throw error;

            if (!questions || questions.length === 0) {
                throw new Error('No questions found in database');
            }

            // Randomize answer options
            const randomizedQuestions = userId
                ? questions.map(question => this.deterministicRandomize(question, userId))
                : randomizeQuestions(questions);

            // Create test object
            const test = {
                // ID will be generated by database when saved
                title: `Practice Quiz: ${topic}${tag ? ` - ${tag}` : ''} (${randomizedQuestions.length} questions)`,
                topic,
                tag,
                questions: randomizedQuestions,
                questionIds: selectedQuestionIds,
                totalQuestions: randomizedQuestions.length,
                createdAt: new Date().toISOString(),
                userId
            };

            return test;
        } catch (error) {
            console.error('Error generating practice quiz:', error);
            throw error;
        }
    }

    /**
     * Save a practice quiz test to the database
     * @param {Object} test - Test object
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Saved test data
     */
    async savePracticeTest(test, userId) {
        try {
            const testData = {
                // Remove custom ID - let database generate UUID
                title: test.title,
                description: `Practice quiz for ${test.topic}${test.tag ? ` - ${test.tag}` : ''}`,
                questions: test.questionIds,
                tags: test.tag ? [test.tag] : [],
                time_limit_minutes: 30,
                passing_score: 70,
                is_public: false,
                created_by: userId,
                is_active: true
            };

            const { data, error } = await supabase
                .from('quiz_quizzes')
                .insert([testData])
                .select()
                .single();

            if (error) throw error;

            // Return the test object with the database-generated ID
            return {
                ...test,
                id: data.id
            };
        } catch (error) {
            console.error('Error saving practice test:', error);
            throw error;
        }
    }

    /**
     * Get user's practice quiz history
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of tests to return
     * @returns {Promise<Array>} - Array of practice tests
     */
    async getPracticeQuizHistory(userId, limit = 20) {
        try {
            const { data, error } = await supabase
                .from('quiz_quizzes')
                .select(`
                    *,
                    quiz_attempts!inner(
                        id,
                        score,
                        max_score,
                        percentage,
                        completed_at,
                        is_completed
                    )
                `)
                .eq('created_by', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching practice quiz history:', error);
            throw error;
        }
    }

    /**
     * Select random questions from available pool
     * @param {Array} questionIds - Array of question IDs
     * @param {number} count - Number of questions to select
     * @returns {Array} - Array of selected question IDs
     */
    selectRandomQuestions(questionIds, count) {
        if (questionIds.length <= count) {
            return questionIds;
        }

        const shuffled = [...questionIds];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, count);
    }


    /**
     * Deterministic randomization for consistent user experience
     * @param {Object} question - Question object
     * @param {string} userId - User ID
     * @returns {Object} - Randomized question
     */
    deterministicRandomize(question, userId) {
        // Simple deterministic randomization based on user ID and question ID
        const seed = `${userId}-${question.id}`;
        const seedHash = this.hashString(seed);

        const options = [
            { label: 'A', text: question.option_a, diagram: question.option_a_diagram },
            { label: 'B', text: question.option_b, diagram: question.option_b_diagram },
            { label: 'C', text: question.option_c, diagram: question.option_c_diagram },
            { label: 'D', text: question.option_d, diagram: question.option_d_diagram }
        ];

        const shuffledOptions = this.deterministicShuffle(options, seedHash);
        const newLabels = ['A', 'B', 'C', 'D'];

        const labelMapping = {};
        shuffledOptions.forEach((option, index) => {
            labelMapping[option.label] = newLabels[index];
        });

        const newCorrectAnswer = labelMapping[question.correct_answer];

        return {
            ...question,
            option_a: shuffledOptions[0].text,
            option_a_diagram: shuffledOptions[0].diagram,
            option_b: shuffledOptions[1].text,
            option_b_diagram: shuffledOptions[1].diagram,
            option_c: shuffledOptions[2].text,
            option_c_diagram: shuffledOptions[2].diagram,
            option_d: shuffledOptions[3].text,
            option_d_diagram: shuffledOptions[3].diagram,
            correct_answer: newCorrectAnswer,
            _originalCorrectAnswer: question.correct_answer,
            _labelMapping: labelMapping
        };
    }

    /**
     * Deterministic shuffle using a seed
     * @param {Array} array - Array to shuffle
     * @param {number} seed - Seed for randomization
     * @returns {Array} - Shuffled array
     */
    deterministicShuffle(array, seed) {
        const shuffled = [...array];
        let currentSeed = seed;

        for (let i = shuffled.length - 1; i > 0; i--) {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            const j = Math.floor((currentSeed / 233280) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Simple hash function for string to number conversion
     * @param {string} str - String to hash
     * @returns {number} - Hash value
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

export default new PracticeQuizService();
