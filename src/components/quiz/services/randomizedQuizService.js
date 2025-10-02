/**
 * Enhanced Quiz Service with Answer Randomization
 * This service handles fetching questions and randomizing answer options
 */

import { supabase } from '../../../services/supabase';
import { randomizeAnswerOptions, randomizeQuestions, deterministicRandomize, convertToOriginalAnswer } from '../utils/answerRandomizer';

class RandomizedQuizService {
    /**
     * Get questions for a quiz with randomized answer options
     * @param {Array} questionIds - Array of question IDs
     * @param {string} userId - User ID for deterministic randomization (optional)
     * @returns {Array} - Array of questions with randomized options
     */
    async getRandomizedQuestions(questionIds, userId = null) {
        try {
            // Fetch questions from database
            const { data: questions, error } = await supabase
                .from('quiz_questions')
                .select('*')
                .in('id', questionIds)
                .eq('is_active', true);

            if (error) throw error;

            if (!questions || questions.length === 0) {
                throw new Error('No questions found');
            }

            // Randomize answer options
            let randomizedQuestions;
            if (userId) {
                // Use deterministic randomization (same user sees same order)
                randomizedQuestions = questions.map(question =>
                    deterministicRandomize(question, userId)
                );
            } else {
                // Use random randomization (different order each time)
                randomizedQuestions = randomizeQuestions(questions);
            }

            return randomizedQuestions;
        } catch (error) {
            console.error('Error fetching randomized questions:', error);
            throw error;
        }
    }

    /**
     * Get a single question with randomized options
     * @param {string} questionId - Question ID
     * @param {string} userId - User ID for deterministic randomization (optional)
     * @returns {Object} - Question with randomized options
     */
    async getRandomizedQuestion(questionId, userId = null) {
        try {
            const { data: question, error } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('id', questionId)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            if (!question) {
                throw new Error('Question not found');
            }

            // Randomize answer options
            if (userId) {
                return deterministicRandomize(question, userId);
            } else {
                return randomizeAnswerOptions(question);
            }
        } catch (error) {
            console.error('Error fetching randomized question:', error);
            throw error;
        }
    }

    /**
     * Submit quiz attempt with proper answer conversion
     * @param {Object} attemptData - Attempt data
     * @param {Array} questions - Array of questions with _labelMapping
     * @returns {Object} - Submission result
     */
    async submitQuizAttempt(attemptData, questions) {
        // Try simple submission first
        return await this.submitQuizAttemptSimple(attemptData);
    }

    /**
     * Simple quiz submission without answer conversion (for debugging)
     * @param {Object} attemptData - Attempt data
     * @returns {Object} - Submission result
     */
    async submitQuizAttemptSimple(attemptData) {
        try {
            console.log('🔄 submitQuizAttemptSimple called with:', attemptData);

            // Check authentication status
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            console.log('🔐 Current user:', user?.id, 'Expected user:', attemptData.user_id);

            if (authError) {
                console.error('❌ Auth error:', authError);
                throw new Error('Authentication error: ' + authError.message);
            }

            if (!user) {
                throw new Error('User not authenticated');
            }

            if (user.id !== attemptData.user_id) {
                throw new Error('User ID mismatch');
            }

            // Prepare simple submission data
            const submissionData = {
                quiz_id: attemptData.quiz_id,
                user_id: attemptData.user_id,
                score: attemptData.score,
                max_score: attemptData.max_score,
                percentage: attemptData.percentage,
                time_taken_seconds: attemptData.time_taken_seconds,
                answers: attemptData.answers, // Store as-is for now
                is_completed: attemptData.is_completed,
                completed_at: attemptData.completed_at
            };

            console.log('📤 Submitting to database (simple):', submissionData);

            // Test database connection first
            console.log('🔍 Testing database connection...');
            console.log('🔍 Supabase URL:', process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Missing');
            console.log('🔍 Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

            const { data: testData, error: testError } = await supabase
                .from('quiz_attempts')
                .select('id')
                .limit(1);

            if (testError) {
                console.error('❌ Database connection test failed:', testError);
                throw new Error('Database connection failed: ' + testError.message);
            }
            console.log('✅ Database connection test passed');

            // Submit to database with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Database operation timed out after 30 seconds')), 30000);
            });

            const dbPromise = supabase
                .from('quiz_attempts')
                .insert(submissionData)
                .select()
                .single();

            console.log('⏳ Starting database insert...');
            const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

            if (error) {
                console.error('❌ Database error:', error);
                throw error;
            }

            console.log('✅ Database response:', data);
            return data;
        } catch (error) {
            console.error('❌ Error submitting quiz attempt (simple):', error);
            throw error;
        }
    }

    /**
     * Submit quiz attempt with proper answer conversion (original method)
     * @param {Object} attemptData - Attempt data
     * @param {Array} questions - Array of questions with _labelMapping
     * @returns {Object} - Submission result
     */
    async submitQuizAttemptWithConversion(attemptData, questions) {
        try {
            console.log('🔄 submitQuizAttempt called with:', { attemptData, questions: questions?.length });

            // Convert user answers back to original format for storage
            const convertedAnswers = attemptData.answers.map((answer, index) => {
                const question = questions[index];
                const originalAnswer = convertToOriginalAnswer(answer.selected_answer, question);
                console.log(`Converting answer ${index}: ${answer.selected_answer} -> ${originalAnswer}`);
                return {
                    question_id: answer.question_id,
                    selected_answer: originalAnswer,
                    is_correct: answer.is_correct
                };
            });

            console.log('🔄 Converted answers:', convertedAnswers);

            // Prepare submission data with correct field names for database
            const submissionData = {
                quiz_id: attemptData.quiz_id,
                user_id: attemptData.user_id,
                score: attemptData.score,
                max_score: attemptData.max_score,
                percentage: attemptData.percentage,
                time_taken_seconds: attemptData.time_taken_seconds,
                answers: convertedAnswers, // Store as JSONB
                is_completed: attemptData.is_completed,
                completed_at: attemptData.completed_at
            };

            console.log('📤 Submitting to database:', submissionData);

            // Check authentication status
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            console.log('🔐 Current user:', user?.id, 'Expected user:', submissionData.user_id);

            if (authError) {
                console.error('❌ Auth error:', authError);
                throw new Error('Authentication error: ' + authError.message);
            }

            if (!user) {
                throw new Error('User not authenticated');
            }

            if (user.id !== submissionData.user_id) {
                throw new Error('User ID mismatch');
            }

            // Submit to database with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Database operation timed out after 30 seconds')), 30000);
            });

            const dbPromise = supabase
                .from('quiz_attempts')
                .insert(submissionData)
                .select()
                .single();

            const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

            if (error) {
                console.error('❌ Database error:', error);
                throw error;
            }

            console.log('✅ Database response:', data);
            return data;
        } catch (error) {
            console.error('❌ Error submitting quiz attempt:', error);
            throw error;
        }
    }

    /**
     * Get quiz results with original answer format
     * @param {string} attemptId - Attempt ID
     * @returns {Object} - Quiz results
     */
    async getQuizResults(attemptId) {
        try {
            console.log('Fetching quiz results for attemptId:', attemptId);

            const { data: attempt, error } = await supabase
                .from('quiz_attempts')
                .select(`
                    *,
                    quiz:quiz_quizzes(*)
                `)
                .eq('id', attemptId)
                .single();

            console.log('Supabase response - attempt:', attempt);
            console.log('Supabase response - error:', error);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (!attempt) {
                console.error('No attempt found for ID:', attemptId);
                throw new Error('No attempt found');
            }

            // Get the questions to show results
            const questionIds = attempt.quiz.questions;
            const { data: questions, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .in('id', questionIds);

            if (questionsError) throw questionsError;

            // Debug: Log the raw attempt data to understand the structure
            console.log('Raw attempt data:', attempt);
            console.log('Raw answers data:', attempt.answers);
            console.log('Answers type:', typeof attempt.answers);
            console.log('Is answers array?', Array.isArray(attempt.answers));

            // Process answers to match the expected format for QuizResults component
            let processedAnswers = [];

            if (Array.isArray(attempt.answers)) {
                // New format: answers is an array of objects
                processedAnswers = questions.map((question, index) => {
                    const answerData = attempt.answers[index] || {};
                    return {
                        question_id: question.id,
                        selected_answer: answerData.selected_answer || null,
                        is_correct: answerData.is_correct || false
                    };
                });
            } else if (attempt.answers && typeof attempt.answers === 'object') {
                // Old format: answers might be an object with question IDs as keys
                processedAnswers = questions.map((question, index) => {
                    const answerData = attempt.answers[question.id] || attempt.answers[index] || {};
                    return {
                        question_id: question.id,
                        selected_answer: answerData.selected_answer || answerData.selected_option || null,
                        is_correct: answerData.is_correct || false
                    };
                });
            } else {
                // Fallback: create empty answers if no answers data exists
                processedAnswers = questions.map((question) => ({
                    question_id: question.id,
                    selected_answer: null,
                    is_correct: false
                }));
            }

            // Create a properly formatted attempt object
            const formattedAttempt = {
                ...attempt,
                answers: processedAnswers
            };

            return {
                attempt: formattedAttempt,
                questions
            };
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            throw error;
        }
    }
}

const randomizedQuizService = new RandomizedQuizService();
export default randomizedQuizService;
