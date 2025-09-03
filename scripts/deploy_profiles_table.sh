#!/bin/bash

# Deploy Profiles Table Script
# This script creates the missing profiles table for user registration

echo "🚀 Deploying Profiles Table..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo ""
    echo "Or run the SQL file manually in your Supabase dashboard:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and paste the contents of: database/migrations/create_profiles_table.sql"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "Please run this from your project root or use the manual method above."
    exit 1
fi

echo "✅ Supabase CLI found"
echo "📋 Creating profiles table..."

# Deploy the profiles table
echo "📄 Running profiles table creation..."
cat database/migrations/create_profiles_table.sql | supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Profiles table creation failed"
    exit 1
fi

echo ""
echo "✅ Profiles table deployed successfully!"
echo ""
echo "📊 What was created:"
echo "   - profiles table with user profile data"
echo "   - Automatic profile creation on user registration"
echo "   - Row Level Security (RLS) policies"
echo "   - Performance indexes"
echo "   - Admin and user role management"
echo ""
echo "🔧 Features now available:"
echo "   - User registration will automatically create profiles"
echo "   - Profile management for users"
echo "   - Admin role management"
echo "   - Secure profile access"
echo ""
echo "🎯 Next steps:"
echo "1. Test user registration in your application"
echo "2. Verify profiles are created automatically"
echo "3. Check that existing users can access their profiles"
echo ""
echo "📚 Documentation available in docs/ directory"
