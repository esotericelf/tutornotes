# Quiz Module Integration Guide

## Overview
This guide explains how to integrate the Quiz Module as a child project within your existing tutornotes application, inheriting the parent's design system while maintaining modularity.

## Integration Steps

### 1. **Database Setup**
First, run the database migration to create the quiz tables:

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U postgres -d postgres -f database/migrations/create_quiz_tables.sql
```

### 2. **Project Structure**
The quiz module follows this structure within your existing project:

```
src/components/quiz/
├── __tests__/                    # Test files
├── components/                    # Quiz-specific components
│   ├── QuizDashboard.js         # Main quiz dashboard
│   ├── QuizCreator.js           # Admin: Create/edit quizzes
│   ├── QuizTaker.js            # User: Take quizzes
│   ├── QuestionEditor.js        # Admin: Edit questions
│   ├── QuizResults.js           # Display results
│   └── GeoGebraEmbed.js        # Reusable GeoGebra component
├── services/                     # Quiz business logic
│   ├── quizService.js           # Quiz CRUD operations
│   ├── questionService.js       # Question management
│   ├── attemptService.js        # Quiz attempts
│   └── resultService.js         # Results and analytics
├── hooks/                        # Custom hooks
│   ├── useQuiz.js               # Quiz state management
│   ├── useQuestion.js           # Question state
│   └── useAttempt.js            # Attempt tracking
├── types/                        # TypeScript-like definitions
│   └── quiz.types.js            # Quiz data structures
├── utils/                        # Helper functions
│   ├── quizHelpers.js           # Quiz utilities
│   ├── scoring.js               # Score calculation
│   └── validation.js            # Input validation
└── styles/                       # Quiz-specific styles
    └── quiz.css                 # Custom quiz styles
```

### 3. **Routing Integration**
Add quiz routes to your main App.js:

```jsx
// In src/App.js
import QuizDashboard from './components/quiz/components/QuizDashboard';
import QuizCreator from './components/quiz/components/QuizCreator';
import QuizTaker from './components/quiz/components/QuizTaker';

// Add these routes within your existing Routes component
<Route path="/quiz" element={<QuizDashboard />} />
<Route path="/quiz/create" element={<ProtectedRoute><QuizCreator /></ProtectedRoute>} />
<Route path="/quiz/:id" element={<QuizTaker />} />
<Route path="/quiz/:id/edit" element={<ProtectedRoute><QuizCreator /></ProtectedRoute>} />
```

### 4. **Navigation Integration**
Add quiz menu items to your main navigation:

```jsx
// In your navigation component
<MenuItem component={Link} to="/quiz">
  <QuizIcon />
  Quizzes
</MenuItem>

// For admin users
{userRole === 'admin' && (
  <MenuItem component={Link} to="/quiz/create">
    <AddIcon />
    Create Quiz
  </MenuItem>
)}
```

### 5. **Authentication Integration**
The quiz module automatically uses your existing AuthContext:

```jsx
// In quiz components
import { useAuth } from '../../../contexts/AuthContext';

const { user, userRole } = useAuth();

// Role-based access control
if (userRole === 'admin') {
  // Show admin features
}
```

### 6. **Database Integration**
The quiz module leverages your existing Supabase connection:

```jsx
// In quiz services
import { supabase } from '../../../services/supabase';

// All database operations use the same connection
const { data, error } = await supabase
  .from('quiz_quizzes')
  .select('*');
```

## Design System Inheritance

### Colors and Theme
```jsx
// Quiz components automatically inherit your Material-UI theme
<Button variant="contained" color="primary">
  Take Quiz
</Button>

<Card sx={{
  backgroundColor: 'background.paper',
  borderColor: 'divider'
}}>
  {/* Card content */}
</Card>
```

### Typography
```jsx
// Use the same typography variants as your parent app
<Typography variant="h4" component="h1" gutterBottom>
  Quiz Dashboard
</Typography>

<Typography variant="body1" color="text.secondary">
  Quiz description
</Typography>
```

### Layout and Spacing
```jsx
// Follow the same spacing patterns
<Container maxWidth="lg" sx={{ py: 4 }}>
  <Box sx={{ mb: 4 }}>
    {/* Content with consistent margins */}
  </Box>
</Container>
```

## Component Development

### 1. **Quiz Dashboard**
- Main entry point for the quiz module
- Displays available quizzes with filtering and search
- Inherits parent's card design and grid layout

### 2. **Quiz Creator (Admin)**
- Form to create and edit quizzes
- Question management interface
- GeoGebra diagram integration

### 3. **Quiz Taker**
- Interface for users to take quizzes
- Timer and progress tracking
- Real-time answer validation

### 4. **Quiz Results**
- Score display and analytics
- Question-by-question breakdown
- Performance insights

## GeoGebra Integration

### 1. **GeoGebraEmbed Component**
```jsx
// Reusable component for GeoGebra diagrams
<GeoGebraEmbed
  url="https://www.geogebra.org/material/iframe/id/12345"
  width="100%"
  height="400px"
  allowScale={true}
  showToolbar={false}
/>
```

### 2. **Diagram Storage**
- Store GeoGebra URLs in the database
- Support for both question and answer diagrams
- Responsive design for mobile devices

## Testing Strategy

### 1. **Unit Tests**
```bash
# Test quiz components
npm test -- src/components/quiz/

# Test quiz services
npm test -- src/components/quiz/services/
```

### 2. **Integration Tests**
- Test quiz creation flow
- Test quiz taking process
- Test result calculation

### 3. **E2E Tests**
- Complete user journey testing
- Admin workflow testing
- Mobile responsiveness testing

## Performance Considerations

### 1. **Lazy Loading**
```jsx
// Lazy load quiz components
const QuizDashboard = lazy(() => import('./components/quiz/components/QuizDashboard'));

<Suspense fallback={<CircularProgress />}>
  <QuizDashboard />
</Suspense>
```

### 2. **Pagination**
- Implement pagination for large quiz lists
- Use virtual scrolling for long question lists
- Optimize database queries with proper indexing

### 3. **Caching**
- Cache quiz data in React Query or SWR
- Implement optimistic updates for better UX
- Cache GeoGebra diagrams when possible

## Security Considerations

### 1. **Row Level Security (RLS)**
- All quiz tables have RLS enabled
- Users can only access their own attempts
- Admins have full access to all quizzes

### 2. **Input Validation**
- Validate all user inputs on both client and server
- Sanitize GeoGebra URLs and content
- Prevent XSS attacks in quiz content

### 3. **Rate Limiting**
- Limit quiz attempts per user
- Prevent rapid-fire quiz submissions
- Implement cooldown periods

## Deployment

### 1. **Build Integration**
- Quiz components are included in the main build
- No separate build process required
- Tree-shaking removes unused code

### 2. **Environment Variables**
```bash
# Add to your .env file if needed
REACT_APP_GEOGEBRA_BASE_URL=https://www.geogebra.org
REACT_APP_QUIZ_FEATURES_ENABLED=true
```

### 3. **Netlify Configuration**
- No additional configuration needed
- Quiz module deploys with main app
- Same build command and publish directory

## Maintenance and Updates

### 1. **Independent Development**
- Quiz module can be developed independently
- Changes don't affect other parts of the app
- Easy to rollback quiz-specific changes

### 2. **Version Control**
- Quiz module changes are tracked separately
- Clear commit messages for quiz updates
- Branch strategy for quiz features

### 3. **Monitoring**
- Track quiz performance metrics
- Monitor user engagement
- Alert on quiz-related errors

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase connection in parent app
   - Check RLS policies are properly set
   - Ensure database tables exist

2. **Styling Inconsistencies**
   - Verify Material-UI theme inheritance
   - Check CSS specificity conflicts
   - Ensure consistent spacing values

3. **Authentication Issues**
   - Verify AuthContext is properly imported
   - Check user role permissions
   - Ensure RLS policies match user roles

### Debug Tools
```jsx
// Add to quiz components for debugging
console.log('Quiz data:', quizData);
console.log('User role:', userRole);
console.log('Auth state:', { user, isAuthenticated });
```

## Future Enhancements

### 1. **Advanced Features**
- Quiz templates and themes
- Advanced analytics and reporting
- Social features (sharing, commenting)
- Mobile app integration

### 2. **Scalability**
- Microservice architecture for quiz engine
- CDN for GeoGebra diagrams
- Real-time collaboration features
- AI-powered question generation

### 3. **Integration**
- LMS integration (Canvas, Blackboard)
- Third-party quiz platforms
- API for external applications
- Webhook support for events

This integration approach ensures that your quiz module seamlessly fits into your existing tutornotes application while maintaining clean separation of concerns and inheriting all the design and infrastructure benefits of the parent project.
