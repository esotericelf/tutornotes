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
        try {
            // Convert user answers back to original format
            const convertedAnswers = attemptData.answers.map((answer, index) => {
                const question = questions[index];
                return {
                    question_id: answer.question_id,
                    selected_answer: convertToOriginalAnswer(answer.selected_answer, question),
                    is_correct: answer.is_correct
                };
            });

            // Update attempt data with converted answers
            const submissionData = {
                ...attemptData,
                answers: convertedAnswers
            };

            // Submit to database
            const { data, error } = await supabase
                .from('quiz_attempts')
                .insert(submissionData)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error submitting quiz attempt:', error);
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
            const { data: attempt, error } = await supabase
                .from('quiz_attempts')
                .select(`
                    *,
                    quiz:quiz_quizzes(*)
                `)
                .eq('id', attemptId)
                .single();

            if (error) throw error;

            // Get the questions to show results
            const questionIds = attempt.quiz.questions;
            const { data: questions, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .in('id', questionIds);

            if (questionsError) throw questionsError;

            return {
                attempt,
                questions
            };
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            throw error;
        }
    }
}

export default new RandomizedQuizService();
