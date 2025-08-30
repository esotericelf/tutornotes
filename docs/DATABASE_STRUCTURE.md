# Database Structure Documentation

## 📁 File Organization

The database files have been organized into a clean, logical structure:

```
tutornotes/
├── database/
│   ├── migrations/
│   │   └── create_discussions_table.sql    # Discussions table creation
│   ├── database_schema_math_papers_corrected.sql  # Math Past Paper schema
│   ├── database_indexes_optimization.sql   # Performance indexes
│   ├── optimized_search_functions.sql      # Search functionality
│   └── supabase_setup.sql                  # Basic Supabase configuration
├── scripts/
│   ├── setup_database.sh                   # Complete database setup
│   ├── deploy_discussions_table.sh         # Discussions table only
│   └── deploy_database_optimizations.sh    # Optimizations only
└── docs/
    ├── DATABASE_STRUCTURE.md               # This file
    ├── DEPLOYMENT.md                       # Deployment instructions
    ├── PROJECT_STRUCTURE.md                # Project overview
    ├── SUPABASE_SETUP_CHECKLIST.md         # Setup checklist
    └── TEST_SUMMARY.md                     # Testing documentation
```

## 🗄️ Database Tables

### 1. Math_Past_Paper
- **Purpose**: Stores math past paper questions and answers
- **Key Fields**: id, year, question_no, correct_answer, options, diagrams, solution
- **Features**: Full-text search, tagging system, visual content support

### 2. discussions
- **Purpose**: Stores user discussions and comments for questions
- **Key Fields**: id, question_id, user_id, comment, diagram, votes_count, parent
- **Features**: Nested replies, voting system, iframe diagram support

## 🚀 Quick Setup

### Option 1: Complete Setup (Recommended)
```bash
./scripts/setup_database.sh
```

### Option 2: Individual Components
```bash
# Discussions table only
./scripts/deploy_discussions_table.sh

# Database optimizations only
./scripts/deploy_database_optimizations.sh
```

### Option 3: Manual Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run files in this order:
   - `database/supabase_setup.sql`
   - `database/database_schema_math_papers_corrected.sql`
   - `database/migrations/create_discussions_table.sql`
   - `database/database_indexes_optimization.sql`
   - `database/optimized_search_functions.sql`

## 🔧 Key Features

### Discussions Table
- **Nested Replies**: Self-referencing `parent` field for threaded discussions
- **Voting System**: `votes_count` field for community voting
- **Visual Content**: `diagram` field for iframe links
- **User Integration**: Links to Supabase auth.users
- **Performance**: Optimized indexes for fast queries

### Search & Performance
- **Full-text Search**: Search across questions, answers, and solutions
- **Optimized Indexes**: Fast queries on common patterns
- **Row Level Security**: Secure access control
- **Performance Monitoring**: Built-in statistics and monitoring

## 📊 Usage Examples

### Get Discussion Threads
```sql
-- Get all discussions for a question with nested replies
SELECT * FROM get_discussion_threads(1);

-- Get discussions with user information
SELECT * FROM discussions_with_users WHERE question_id = 1;
```

### Search Math Papers
```sql
-- Search by keyword
SELECT * FROM search_math_papers_by_keyword('algebra');

-- Filter by year and paper
SELECT * FROM filter_math_papers_by_year_paper(2023, 'I');
```

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **User Authentication** integration with Supabase Auth
- **Permission-based Access** - users can only modify their own content
- **Public Read Access** - all authenticated users can read discussions

## 📈 Performance

- **Optimized Indexes** for common query patterns
- **Composite Indexes** for multi-column searches
- **Full-text Search** with GIN indexes
- **Performance Monitoring** with built-in statistics

## 🛠️ Maintenance

### Monitoring Performance
```sql
-- Check database performance
SELECT * FROM supabase_performance_stats;

-- Get performance baseline
SELECT * FROM get_performance_baseline();
```

### Adding New Features
1. Create new migration in `database/migrations/`
2. Update this documentation
3. Test thoroughly before deployment
4. Update setup scripts if needed

## 📚 Related Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Supabase Setup](SUPABASE_SETUP_CHECKLIST.md)
- [Testing Summary](TEST_SUMMARY.md)
