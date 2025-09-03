#!/bin/bash

# Simple Google OAuth Profile Fix Script
# This script fixes the immediate issue with the profiles table

echo "🔧 Applying Simple Google OAuth Profile Fix..."
echo ""

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if the SQL fix file exists
if [ ! -f "database/fix_google_oauth_trigger_simple.sql" ]; then
    echo "❌ Simplified Google OAuth trigger fix SQL file not found"
    exit 1
fi

echo "✅ Project directory found"
echo "✅ Simplified SQL fix file found"
echo ""

echo "📋 This script will:"
echo "   1. Check the current profiles table structure"
echo "   2. Update the trigger function to better handle Google OAuth data"
echo "   3. Update existing profiles with available Google data"
echo "   4. Show the results"
echo ""

echo "⚠️  IMPORTANT: You need to run this SQL manually in your Supabase dashboard"
echo ""

echo "📋 Manual Steps:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of: database/fix_google_oauth_trigger_simple.sql"
echo "4. Run the script"
echo ""

echo "🎯 What this fix does:"
echo "   - Updates the database trigger to better extract Google OAuth data"
echo "   - Handles multiple possible field names for names and avatars"
echo "   - Updates existing profiles with available Google data"
echo "   - Improves username generation from email addresses"
echo "   - Only uses columns that actually exist in your profiles table"
echo ""

echo "🔧 After applying the fix:"
echo "   1. Test Google OAuth login again"
echo "   2. Check that profile data is properly extracted"
echo "   3. Verify that avatars and names appear in the Dashboard"
echo ""

echo "📖 For more details, see: docs/GOOGLE_OAUTH_PROFILE_CREATION.md"
echo ""

echo "📄 SQL File Contents Preview:"
echo "=================================="
head -20 database/fix_google_oauth_trigger_simple.sql
echo "..."
echo "=================================="
echo ""
echo "📁 Full SQL file: database/fix_google_oauth_trigger_simple.sql"
