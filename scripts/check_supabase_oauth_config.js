#!/usr/bin/env node

// Script to check Supabase OAuth configuration
console.log('🔍 Supabase OAuth Configuration Check\n')

// Your Supabase project details
const SUPABASE_PROJECT_ID = 'pjcjnmqoaajtotqqqsxs'
const SUPABASE_URL = 'https://pjcjnmqoaajtotqqqsxs.supabase.co'

console.log('📋 Your Supabase Project:')
console.log(`   Project ID: ${SUPABASE_PROJECT_ID}`)
console.log(`   URL: ${SUPABASE_URL}`)

console.log('\n🔧 Supabase Dashboard Settings to Check:')
console.log(`   1. Go to: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`)
console.log('   2. Navigate to: Authentication → URL Configuration')
console.log('   3. Check these settings:')

console.log('\n   📍 Site URL:')
console.log('      ❌ WRONG: http://localhost:3000')
console.log('      ❌ WRONG: https://localhost:3000')
console.log('      ✅ CORRECT: https://yourdomain.com (your actual production domain)')
console.log('      ✅ CORRECT: https://yourapp.netlify.app (if using Netlify)')

console.log('\n   🔗 Redirect URLs:')
console.log('      ❌ MISSING: /dashboard')
console.log('      ❌ MISSING: https://yourdomain.com/dashboard')
console.log('      ✅ REQUIRED: https://yourdomain.com/dashboard')
console.log('      ✅ REQUIRED: https://yourdomain.com/auth/callback')

console.log('\n   🔐 OAuth Providers:')
console.log('      ✅ Google: Should be ENABLED')
console.log('      ✅ Google Client ID: Should be set')
console.log('      ✅ Google Client Secret: Should be set')

console.log('\n🌐 Google Cloud Console Settings:')
console.log('   1. Go to: https://console.cloud.google.com/')
console.log('   2. Navigate to: APIs & Services → Credentials')
console.log('   3. Find your OAuth 2.0 Client ID')
console.log('   4. Check Authorized redirect URIs:')

console.log('\n   🔗 Authorized redirect URIs must include:')
console.log(`      ✅ ${SUPABASE_URL}/auth/v1/callback`)
console.log('      ✅ https://yourdomain.com/auth/callback (your production domain)')

console.log('\n🚨 Common Issues:')
console.log('   1. Site URL still set to localhost in Supabase')
console.log('   2. Missing /dashboard in Supabase redirect URLs')
console.log('   3. Wrong redirect URI in Google Cloud Console')
console.log('   4. OAuth provider not enabled in Supabase')

console.log('\n💡 Quick Fix Steps:')
console.log('   1. Update Supabase Site URL to your production domain')
console.log('   2. Add /dashboard to Supabase redirect URLs')
console.log('   3. Verify Google OAuth is enabled and configured')
console.log('   4. Check Google Cloud Console redirect URIs')

console.log('\n🔍 To Debug:')
console.log('   1. Check browser console for OAuth redirect URL logs')
console.log('   2. Look for "AuthService: Google OAuth redirect URL:" messages')
console.log('   3. Verify the URL shown is NOT localhost')

console.log('\n📞 Need Help?')
console.log('   - Check your Netlify app URL for the correct production domain')
console.log('   - Verify your custom domain if you have one')
console.log('   - Make sure all URLs use HTTPS in production')
