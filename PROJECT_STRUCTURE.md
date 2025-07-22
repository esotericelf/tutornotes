# Tutor Notes - Project Structure

## Overview
This is a React.js application for managing tutor notes with Supabase as the backend database. The application is organized into 4 main departments:

1. **User Management** - Authentication and user profile management
2. **User Access to Data** - Read-only access to tutor notes and past papers
3. **Admin Modify Data** - Administrative functions for managing content
4. **User Discussion Block** - Discussion and commenting system

## Database Integration

### Existing Tables (Your Supabase Database)
- **`Math_Past_Paper`** - Math questions with multiple choice options and graphics
- **`profiles`** - User profiles with authentication integration

### Additional Tables (To be added)
- **`categories`** - For organizing tutor notes
- **`tutor_notes`** - General educational content
- **`user_favorites`** - User favorite notes
- **`discussions`** - Q&A threads
- **`discussion_replies`** - Discussion replies

## Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.js
│   │   ├── SignUpForm.js
│   │   ├── ForgotPassword.js
│   │   └── Profile.js
│   ├── user/            # User-facing components
│   │   ├── NoteCard.js
│   │   ├── NoteList.js
│   │   ├── NoteDetail.js
│   │   ├── SearchBar.js
│   │   ├── CategoryFilter.js
│   │   ├── PastPaperCard.js
│   │   ├── PastPaperList.js
│   │   └── QuestionViewer.js
│   ├── admin/           # Admin-only components
│   │   ├── NoteEditor.js
│   │   ├── UserManagement.js
│   │   ├── CategoryManager.js
│   │   ├── Dashboard.js
│   │   ├── PastPaperEditor.js
│   │   └── BulkUpload.js
│   ├── discussion/      # Discussion components
│   │   ├── DiscussionList.js
│   │   ├── DiscussionForm.js
│   │   ├── ReplyForm.js
│   │   └── DiscussionCard.js
│   └── common/          # Shared components
│       ├── Header.js
│       ├── Footer.js
│       ├── Loading.js
│       ├── ErrorBoundary.js
│       └── Modal.js
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   │   ├── Login.js
│   │   ├── SignUp.js
│   │   └── ForgotPassword.js
│   ├── user/            # User pages
│   │   ├── Home.js
│   │   ├── Notes.js
│   │   ├── NoteDetail.js
│   │   ├── Favorites.js
│   │   ├── PastPapers.js
│   │   ├── PastPaperDetail.js
│   │   └── Practice.js
│   ├── admin/           # Admin pages
│   │   ├── Dashboard.js
│   │   ├── NoteManagement.js
│   │   ├── UserManagement.js
│   │   ├── CategoryManagement.js
│   │   ├── PastPaperManagement.js
│   │   └── BulkUpload.js
│   └── discussion/      # Discussion pages
│       ├── Discussions.js
│       └── DiscussionDetail.js
├── services/            # API and business logic
│   ├── supabase.js      # Supabase client configuration
│   ├── auth/            # Authentication services
│   │   └── authService.js
│   ├── user/            # User data services (read-only)
│   │   ├── userDataService.js
│   │   └── pastPaperService.js
│   ├── admin/           # Admin services (CRUD operations)
│   │   ├── adminService.js
│   │   └── mathPastPaperAdminService.js
│   └── discussion/      # Discussion services
│       └── discussionService.js
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── hooks/               # Custom React hooks
│   ├── useNotes.js
│   ├── useDiscussions.js
│   ├── useAuth.js
│   └── usePastPapers.js
├── utils/               # Utility functions
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── styles/              # CSS and styling
│   ├── global.css
│   ├── components.css
│   └── variables.css
└── types/               # TypeScript types (if using TS)
    ├── auth.types.js
    ├── notes.types.js
    ├── pastPaper.types.js
    └── discussion.types.js
```

## Database Schema

### Existing Tables (Your Database)

1. **Math_Past_Paper** - Math questions
   - id (bigint, primary key)
   - created_at (timestamp)
   - year (integer)
   - question_no (smallint)
   - correct_answer (text)
   - option_a, option_b, option_c, option_d (text)
   - option_a_graph, option_b_graphic, option_c_graphic, option_d_graphic (ARRAY)
   - user_id (uuid, foreign key to auth.users)

2. **profiles** - User profiles
   - id (uuid, primary key, foreign key to auth.users)
   - updated_at (timestamp)
   - username (text, unique)
   - full_name (text)
   - avatar_url (text)
   - website (text)
   - role (text) - 'admin', 'user'

### Additional Tables (To be added)

3. **categories** - Note categories
   - id (uuid, primary key)
   - name (text, unique)
   - description (text)
   - color (text)
   - created_at (timestamp)

4. **tutor_notes** - General educational content
   - id (uuid, primary key)
   - title (text)
   - content (text)
   - category (text, foreign key to categories.name)
   - author_id (uuid, foreign key to profiles.id)
   - is_public (boolean)
   - tags (text[])
   - created_at (timestamp)
   - updated_at (timestamp)

5. **user_favorites** - User favorite notes
   - id (uuid, primary key)
   - user_id (uuid, foreign key to profiles.id)
   - note_id (uuid, foreign key to tutor_notes.id)
   - created_at (timestamp)

6. **discussions** - Discussion threads
   - id (uuid, primary key)
   - note_id (uuid, foreign key to tutor_notes.id)
   - user_id (uuid, foreign key to profiles.id)
   - title (text)
   - content (text)
   - is_resolved (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)
   - resolved_at (timestamp)

7. **discussion_replies** - Discussion replies
   - id (uuid, primary key)
   - discussion_id (uuid, foreign key to discussions.id)
   - user_id (uuid, foreign key to profiles.id)
   - content (text)
   - created_at (timestamp)
   - updated_at (timestamp)

## Service Layer Architecture

### 1. AuthService (src/services/auth/authService.js)
- User registration and login
- Password reset
- Profile management
- Session management

### 2. UserDataService (src/services/user/userDataService.js)
- Read-only access to public tutor notes
- Search and filter functionality
- Category browsing
- Favorite management

### 3. PastPaperService (src/services/user/pastPaperService.js)
- Read-only access to math past papers
- Search by year, question number
- Random question generation
- Statistics and analytics

### 4. AdminService (src/services/admin/adminService.js)
- Full CRUD operations on tutor notes
- Category management
- User management
- System statistics

### 5. MathPastPaperAdminService (src/services/admin/mathPastPaperAdminService.js)
- Full CRUD operations on math past papers
- Bulk upload functionality
- Graphics management
- Detailed statistics

### 6. DiscussionService (src/services/discussion/discussionService.js)
- Discussion creation and management
- Reply system
- Discussion resolution
- Search discussions

## Key Features

### Math Past Papers
- **Browse by Year**: View questions from specific years
- **Browse by Question Number**: View all questions of a specific number
- **Search Content**: Search through questions and options
- **Random Practice**: Get random questions for practice
- **Graphics Support**: Display mathematical graphics and diagrams
- **Statistics**: View comprehensive statistics

### General Tutor Notes
- **Category Organization**: Organize content by subjects
- **Public/Private Notes**: Control visibility of content
- **Search & Filter**: Advanced search capabilities
- **Favorites System**: Save important notes
- **Discussion System**: Q&A on specific notes

### Admin Features
- **Content Management**: Full CRUD operations
- **Bulk Operations**: Upload multiple questions at once
- **User Management**: Manage user roles and permissions
- **Analytics**: Detailed statistics and insights
- **Quality Control**: Identify missing content or graphics

## Authentication Flow

1. **AuthContext** manages global authentication state
2. **AuthService** handles all authentication operations
3. **Protected routes** ensure proper access control
4. **Role-based access** for admin functions

## Environment Variables

Create a `.env` file with:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run `database_schema_additional.sql` in your Supabase SQL editor
4. Start development server: `npm start`
5. Build for production: `npm run build`

## Security Considerations

- Row Level Security (RLS) policies in Supabase
- Environment variable protection
- Input validation and sanitization
- Role-based component rendering
- Secure API endpoints
- Graphics upload validation