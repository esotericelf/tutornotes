// SEO Configuration for TutorNote

export const SEO_CONFIG = {
    // Site Information
    siteName: 'TutorNote',
    siteDescription: 'Comprehensive DSE Math Past Papers, practice quizzes, and educational resources for Hong Kong students',
    siteUrl: process.env.REACT_APP_PRODUCTION_URL || 'https://tutornotes.com.hk',
    siteImage: '/favicon.svg',

    // Default Meta Tags
    defaultTitle: 'TutorNote - DSE Math Past Papers for Hong Kong Students',
    defaultDescription: 'Comprehensive DSE Math Past Papers, practice quizzes, and educational resources for Hong Kong students. Access past papers, track progress, and improve your math skills.',
    defaultKeywords: 'DSE, Math, Past Papers, Hong Kong, Education, Tutoring, Mathematics, HKDSE, Secondary School, Exam Preparation',

    // Social Media
    twitterHandle: '@TutorNote',
    facebookAppId: '', // Add your Facebook App ID if you have one

    // Analytics (add your tracking IDs)
    googleAnalyticsId: 'G-YVBQQPNEE7', // GA4 tracking ID
    googleTagManagerId: '', // Add your GTM ID if you have one

    // Page-specific SEO data
    pages: {
        home: {
            title: 'TutorNote - DSE Math Past Papers for Hong Kong Students',
            description: 'Comprehensive DSE Math Past Papers, practice quizzes, and educational resources for Hong Kong students. Access past papers, track progress, and improve your math skills.',
            keywords: 'DSE, Math, Past Papers, Hong Kong, Education, Tutoring, Mathematics, HKDSE, Secondary School, Exam Preparation, Practice Quizzes',
            url: '/'
        },
        mathpaper: {
            title: 'DSE Math Past Papers - Practice Questions & Solutions | TutorNote',
            description: 'Access comprehensive DSE Math past papers with detailed solutions. Practice with real exam questions, track your progress, and improve your mathematics skills for the Hong Kong DSE exam.',
            keywords: 'DSE Math, Past Papers, Mathematics, Hong Kong, Exam Practice, Solutions, HKDSE, Secondary School, Math Questions',
            url: '/mathpaper'
        },
        login: {
            title: 'Login - TutorNote',
            description: 'Sign in to your TutorNote account to access DSE Math past papers, practice quizzes, and track your learning progress.',
            keywords: 'Login, Sign In, TutorNote, DSE Math, Account',
            url: '/login'
        },
        dashboard: {
            title: 'Dashboard - TutorNote',
            description: 'Access your personalized learning dashboard with progress tracking, practice quizzes, and DSE Math resources.',
            keywords: 'Dashboard, Progress, Learning, DSE Math, TutorNote',
            url: '/dashboard'
        },
        quiz: {
            title: 'Practice Quizzes - DSE Math | TutorNote',
            description: 'Test your knowledge with interactive DSE Math practice quizzes. Track your progress and identify areas for improvement.',
            keywords: 'Practice Quiz, DSE Math, Test, Practice, Mathematics, Hong Kong',
            url: '/quiz/take'
        }
    },

    // FAQ Data for structured data
    faqs: [
        {
            question: 'What is TutorNote?',
            answer: 'TutorNote is an online platform providing comprehensive DSE Math past papers, practice quizzes, and educational resources specifically designed for Hong Kong students preparing for the HKDSE Mathematics examination.'
        },
        {
            question: 'How can I access DSE Math past papers?',
            answer: 'You can access DSE Math past papers by visiting our Math Papers section, where you can filter by year, paper type, and question number. All past papers are available for free practice.'
        },
        {
            question: 'Are the practice quizzes interactive?',
            answer: 'Yes, our practice quizzes are fully interactive with immediate feedback, progress tracking, and detailed explanations for each question to help you understand the concepts better.'
        },
        {
            question: 'Is TutorNote free to use?',
            answer: 'Yes, TutorNote is completely free to use. All past papers, practice quizzes, and educational resources are available at no cost to help Hong Kong students succeed in their DSE Math examination.'
        }
    ]
};

// Helper function to get SEO data for a specific page
export const getSEOData = (pageKey) => {
    return SEO_CONFIG.pages[pageKey] || SEO_CONFIG.pages.home;
};

// Helper function to get full URL
export const getFullUrl = (path) => {
    return `${SEO_CONFIG.siteUrl}${path}`;
};
