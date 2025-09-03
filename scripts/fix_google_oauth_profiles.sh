#!/bin/bash

# Fix Google OAuth Profile Creation Script
# This script updates the database trigger to better handle Google OAuth data

echo "🔧 Fixing Google OAuth Profile Creation..."
echo ""

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if the SQL fix file exists
if [ ! -f "database/fix_google_oauth_trigger.sql" ]; then
    echo "❌ Google OAuth trigger fix SQL file not found"
    exit 1
fi

echo "✅ Project directory found"
echo "✅ SQL fix file found"
echo ""

# Check if supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    echo "📋 Running Google OAuth trigger fix..."

    # Run the SQL fix
    cat database/fix_google_oauth_trigger.sql | supabase db push

    if [ $? -eq 0 ]; then
        echo "✅ Google OAuth trigger fix applied successfully!"
    else
        echo "❌ Failed to apply Google OAuth trigger fix"
        echo "   Please run the SQL manually in your Supabase dashboard"
    fi
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "📋 Please run the SQL fix manually:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and paste the contents of: database/fix_google_oauth_trigger.sql"
    echo "4. Run the script"
fi

echo ""
echo "🎯 What this fix does:"
echo "   - Updates the database trigger to better extract Google OAuth data"
echo "   - Handles multiple possible field names for names and avatars"
echo "   - Updates existing profiles with available Google data"
echo "   - Improves username generation from email addresses"
echo ""
echo "🔧 After applying the fix:"
echo "   1. Test Google OAuth login again"
echo "   2. Check that profile data is properly extracted"
echo "   3. Verify that avatars and names appear in the Dashboard"
echo ""
echo "📖 For more details, see: docs/GOOGLE_OAUTH_PROFILE_CREATION.md"
