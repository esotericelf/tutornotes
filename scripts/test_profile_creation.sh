#!/bin/bash

# Test Profile Creation Script
# This script helps verify that the Google OAuth profile creation is working

echo "🧪 Testing Profile Creation System..."
echo ""

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project directory found"
echo ""

# Check if profiles table exists in database
echo "📋 Checking database setup..."

# Check if the profiles table migration exists
if [ -f "database/migrations/create_profiles_table.sql" ]; then
    echo "✅ Profiles table migration script found"
else
    echo "❌ Profiles table migration script not found"
    echo "   Please run: ./scripts/setup_database.sh"
    exit 1
fi

# Check if ProfileService exists
if [ -f "src/services/user/profileService.js" ]; then
    echo "✅ ProfileService found"
else
    echo "❌ ProfileService not found"
    exit 1
fi

# Check if useProfile hook exists
if [ -f "src/hooks/useProfile.js" ]; then
    echo "✅ useProfile hook found"
else
    echo "❌ useProfile hook not found"
    exit 1
fi

# Check if ProfileDisplay component exists
if [ -f "src/components/user/ProfileDisplay.js" ]; then
    echo "✅ ProfileDisplay component found"
else
    echo "❌ ProfileDisplay component not found"
    exit 1
fi

# Check if tests pass
echo ""
echo "🧪 Running ProfileService tests..."
npm test -- --testPathPattern=profileService.test.js --watchAll=false --silent --passWithNoTests

# Check the actual test results (ignore coverage warnings)
if npm test -- --testPathPattern=profileService.test.js --watchAll=false --silent --passWithNoTests 2>&1 | grep -q "Test Suites: 1 passed"; then
    echo "✅ ProfileService tests passed"
else
    echo "❌ ProfileService tests failed"
    echo "   Please fix the failing tests before proceeding"
    exit 1
fi

echo ""
echo "🎯 Profile Creation System Status: READY"
echo ""
echo "📚 What happens when a user signs in with Google:"
echo "   1. User clicks 'Continue with Google'"
echo "   2. Google OAuth flow completes"
echo "   3. Supabase creates auth.users record"
echo "   4. Database trigger creates profiles record"
echo "   5. Application creates/updates profile via ProfileService"
echo "   6. Profile is displayed in Dashboard"
echo ""
echo "🔧 To test the system:"
echo "   1. Start your development server: npm start"
echo "   2. Navigate to /login"
echo "   3. Click 'Continue with Google'"
echo "   4. Complete Google authentication"
echo "   5. Check that you're redirected to /dashboard"
echo "   6. Verify your profile appears in the sidebar"
echo ""
echo "📊 Database verification:"
echo "   - Check your Supabase dashboard"
echo "   - Look for the profiles table"
echo "   - Verify a profile record was created for your user"
echo ""
echo "🐛 If profiles aren't being created:"
echo "   1. Check browser console for errors"
echo "   2. Verify database trigger is installed"
echo "   3. Check Supabase authentication logs"
echo "   4. Ensure profiles table has correct permissions"
echo ""
echo "📖 Documentation: docs/GOOGLE_OAUTH_PROFILE_CREATION.md"
