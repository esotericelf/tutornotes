#!/bin/bash

# Comprehensive Database Setup Script
# This script sets up the entire database structure for the TutorNotes application

echo "🚀 Setting up TutorNotes Database..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo ""
    echo "Or run the SQL files manually in your Supabase dashboard:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Run the files in this order:"
    echo "   - database/supabase_setup.sql"
    echo "   - database/database_schema_math_papers_corrected.sql"
    echo "   - database/migrations/create_discussions_table.sql"
    echo "   - database/database_indexes_optimization.sql"
    echo "   - database/optimized_search_functions.sql"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "Please run this from your project root or use the manual method above."
    exit 1
fi

echo "✅ Supabase CLI found"
echo "📋 Setting up database structure..."

# Step 1: Basic Supabase setup
echo "📄 Step 1: Running Supabase setup..."
cat database/supabase_setup.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Supabase setup failed"
    exit 1
fi

# Step 2: Math Past Paper schema
echo "📄 Step 2: Setting up Math Past Paper schema..."
cat database/database_schema_math_papers_corrected.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Math Past Paper schema setup failed"
    exit 1
fi

# Step 3: Profiles table
echo "📄 Step 3: Creating profiles table..."
cat database/migrations/create_profiles_table.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Profiles table creation failed"
    exit 1
fi

# Step 4: Discussions table
echo "📄 Step 4: Creating discussions table..."
cat database/migrations/create_discussions_table.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Discussions table creation failed"
    exit 1
fi

# Step 5: Database indexes and optimizations
echo "📄 Step 5: Setting up database indexes and optimizations..."
cat database/database_indexes_optimization.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Database indexes setup failed"
    exit 1
fi

# Step 6: Search functions
echo "📄 Step 6: Setting up search functions..."
cat database/optimized_search_functions.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Search functions setup failed"
    exit 1
fi

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "📊 Database structure created:"
echo "   - Math_Past_Paper table with enhanced schema"
echo "   - profiles table for user management"
echo "   - discussions table with nested replies"
echo "   - Optimized indexes for performance"
echo "   - Search functions for content discovery"
echo "   - Row Level Security (RLS) policies"
echo ""
echo "🔧 Features available:"
echo "   - User registration and profile management"
echo "   - Full-text search on math papers"
echo "   - Nested discussion threads"
echo "   - User authentication integration"
echo "   - Performance monitoring"
echo ""
echo "🎯 Next steps:"
echo "1. Test the database in your application"
echo "2. Add sample data if needed"
echo "3. Monitor performance with: SELECT * FROM supabase_performance_stats;"
echo ""
echo "📚 Documentation available in docs/ directory"
