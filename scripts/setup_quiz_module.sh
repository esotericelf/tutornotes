#!/bin/bash

# Quiz Module Setup Script
# This script sets up the basic structure for the quiz module

echo "🚀 Setting up Quiz Module for tutornotes..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/components/quiz/{__tests__,components,services,hooks,types,utils,styles}

# Create component files
echo "⚛️ Creating component files..."
touch src/components/quiz/components/{QuizDashboard,QuizCreator,QuizTaker,QuestionEditor,QuizResults,GeoGebraEmbed}.js

# Create service files
echo "🔧 Creating service files..."
touch src/components/quiz/services/{quizService,questionService,attemptService,resultService}.js

# Create hook files
echo "🎣 Creating hook files..."
touch src/components/quiz/hooks/{useQuiz,useQuestion,useAttempt}.js

# Create utility files
echo "🛠️ Creating utility files..."
touch src/components/quiz/utils/{quizHelpers,scoring,validation}.js

# Create test files
echo "🧪 Creating test files..."
touch src/components/quiz/__tests__/{QuizDashboard,QuizCreator,QuizTaker}.test.js

# Create style files
echo "🎨 Creating style files..."
touch src/components/quiz/styles/quiz.css

# Create index file
echo "📝 Creating index file..."
cat > src/components/quiz/index.js << 'EOF'
// Quiz Module Entry Point
export { default as QuizDashboard } from './components/QuizDashboard';
export { default as QuizCreator } from './components/QuizCreator';
export { default as QuizTaker } from './components/QuizTaker';
export { default as QuestionEditor } from './components/QuestionEditor';
export { default as QuizResults } from './components/QuizResults';
export { default as GeoGebraEmbed } from './components/GeoGebraEmbed';

// Services
export { default as quizService } from './services/quizService';
export { default as questionService } from './services/questionService';
export { default as attemptService } from './services/attemptService';
export { default as resultService } from './services/resultService';

// Hooks
export { default as useQuiz } from './hooks/useQuiz';
export { default as useQuestion } from './hooks/useQuestion';
export { default as useAttempt } from './hooks/useAttempt';

// Types
export * from './types/quiz.types';
EOF

# Create package.json for quiz module (optional, for development)
echo "📦 Creating quiz module package.json..."
cat > src/components/quiz/package.json << 'EOF'
{
  "name": "@tutornotes/quiz-module",
  "version": "1.0.0",
  "description": "Quiz module for tutornotes application",
  "main": "index.js",
  "dependencies": {
    "@mui/material": "^7.2.0",
    "@mui/icons-material": "^7.2.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "peerDependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
EOF

# Create README for the quiz module
echo "📚 Creating quiz module README..."
cat > src/components/quiz/README.md << 'EOF'
# Quiz Module

This is the quiz module for the tutornotes application. It provides a complete quiz system with:

- Quiz creation and management
- Question editing with GeoGebra integration
- Quiz taking interface
- Results and analytics
- Admin controls

## Quick Start

1. The module is already integrated with the parent app
2. Use the components by importing from this directory
3. All services use the parent's Supabase connection
4. Styling inherits from the parent's Material-UI theme

## Development

- Components are in the `components/` directory
- Business logic is in the `services/` directory
- Custom hooks are in the `hooks/` directory
- Types and interfaces are in the `types/` directory

## Testing

Run tests with:
```bash
npm test -- src/components/quiz/
```
EOF

echo "✅ Quiz module structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run the database migration: database/migrations/create_quiz_tables.sql"
echo "2. Add quiz routes to your App.js"
echo "3. Add quiz navigation to your main menu"
echo "4. Start implementing the components"
echo ""
echo "📖 See docs/QUIZ_MODULE_INTEGRATION.md for detailed integration guide"
echo ""
echo "🎯 Happy coding!"
