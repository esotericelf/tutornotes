#!/bin/bash

echo "🚀 Google OAuth Setup for Tutor Notes"
echo "======================================"
echo ""

echo "📋 Prerequisites:"
echo "1. Supabase project created"
echo "2. Google Cloud Console access"
echo "3. Domain or localhost for development"
echo ""

echo "🔧 Step 1: Google Cloud Console Setup"
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create/select a project"
echo "3. Enable Google+ API and IAM API"
echo "4. Configure OAuth consent screen"
echo "5. Create OAuth 2.0 Client ID"
echo "6. Add redirect URIs:"
echo "   - https://pjcjnmqoaajtotqqqsxs.supabase.co/auth/v1/callback"
echo "   - http://localhost:3000/auth/callback"
echo ""

echo "🔧 Step 2: Supabase Configuration"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project: pjcjnmqoaajtotqqqsxs"
echo "3. Go to Authentication → Providers"
echo "4. Enable Google provider"
echo "5. Add your Google Client ID and Secret"
echo ""

echo "🔧 Step 3: Environment Setup"
echo "1. Copy env.template to .env.local"
echo "2. Add your Supabase URL and anon key"
echo "3. Add your Google Client ID (optional)"
echo ""

echo "🔧 Step 4: Test Setup"
echo "1. Run: npm start"
echo "2. Go to login page"
echo "3. Click 'Continue with Google'"
echo "4. Complete OAuth flow"
echo ""

echo "📚 For detailed instructions, see: docs/GOOGLE_OAUTH_SETUP.md"
echo ""

echo "❓ Need help? Check:"
echo "- Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google"
echo "- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2"
echo ""

echo "✅ Setup complete! Your Google OAuth should now work."
