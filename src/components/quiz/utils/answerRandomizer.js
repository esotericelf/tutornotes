/**
 * Utility functions for randomizing answer options
 * This ensures the correct answer doesn't always appear in the same position
 */

/**
 * Randomizes the order of answer options while tracking the correct answer
 * @param {Object} question - Question object with options A, B, C, D
 * @returns {Object} - Randomized question with shuffled options and correct answer mapping
 */
export const randomizeAnswerOptions = (question) => {
    // Create array of options with their labels
    const options = [
        { label: 'A', text: question.option_a, diagram: question.option_a_diagram },
        { label: 'B', text: question.option_b, diagram: question.option_b_diagram },
        { label: 'C', text: question.option_c, diagram: question.option_c_diagram },
        { label: 'D', text: question.option_d, diagram: question.option_d_diagram }
    ];

    // Shuffle the options array
    const shuffledOptions = shuffleArray([...options]);

    // Create new labels for shuffled options
    const newLabels = ['A', 'B', 'C', 'D'];

    // Map old labels to new labels
    const labelMapping = {};
    shuffledOptions.forEach((option, index) => {
        labelMapping[option.label] = newLabels[index];
    });

    // Find the new correct answer label
    const newCorrectAnswer = labelMapping[question.correct_answer];

    // Create randomized question object
    const randomizedQuestion = {
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
        // Store the original mapping for reference
        _originalCorrectAnswer: question.correct_answer,
        _labelMapping: labelMapping
    };

    return randomizedQuestion;
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Converts user's selected answer back to original format for database storage
 * @param {string} userAnswer - User's selected answer (A, B, C, D)
 * @param {Object} question - Question object with _labelMapping
 * @returns {string} - Original answer label for database storage
 */
export const convertToOriginalAnswer = (userAnswer, question) => {
    if (!question._labelMapping) {
        return userAnswer; // No randomization was applied
    }

    // Find the original label for the user's answer
    for (const [originalLabel, newLabel] of Object.entries(question._labelMapping)) {
        if (newLabel === userAnswer) {
            return originalLabel;
        }
    }

    return userAnswer; // Fallback
};

/**
 * Batch randomizes multiple questions
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array of randomized question objects
 */
export const randomizeQuestions = (questions) => {
    return questions.map(question => randomizeAnswerOptions(question));
};

/**
 * Creates a deterministic randomization based on user ID and question ID
 * This ensures the same user sees the same order for the same question
 * @param {Object} question - Question object
 * @param {string} userId - User ID for deterministic randomization
 * @returns {Object} - Randomized question
 */
export const deterministicRandomize = (question, userId) => {
    // Create a seed based on user ID and question ID
    const seed = `${userId}-${question.id}`;
    const seedHash = hashString(seed);

    // Use seed for deterministic shuffling
    const options = [
        { label: 'A', text: question.option_a, diagram: question.option_a_diagram },
        { label: 'B', text: question.option_b, diagram: question.option_b_diagram },
        { label: 'C', text: question.option_c, diagram: question.option_c_diagram },
        { label: 'D', text: question.option_d, diagram: question.option_d_diagram }
    ];

    const shuffledOptions = deterministicShuffle(options, seedHash);
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
};

/**
 * Deterministic shuffle using a seed
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Seed for randomization
 * @returns {Array} - Shuffled array
 */
const deterministicShuffle = (array, seed) => {
    const shuffled = [...array];
    let currentSeed = seed;

    for (let i = shuffled.length - 1; i > 0; i--) {
        // Generate pseudo-random number from seed
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        const j = Math.floor((currentSeed / 233280) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

/**
 * Simple hash function for string to number conversion
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};
