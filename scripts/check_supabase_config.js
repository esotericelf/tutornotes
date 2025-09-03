#!/usr/bin/env node

// Script to check Supabase configuration
console.log('🔍 Checking Supabase Configuration...\n')

// Check environment variables
const requiredEnvVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
]

console.log('📋 Environment Variables:')
requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
        console.log(`✅ ${varName}: ${value}`)
    } else {
        console.log(`❌ ${varName}: NOT SET`)
    }
})

console.log('\n🌐 Current Environment:')
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

console.log('\n📝 Supabase Dashboard Checklist:')
console.log('1. Go to Authentication > URL Configuration')
console.log('   - Site URL should be your production domain')
console.log('   - Redirect URLs should include /dashboard')
console.log('\n2. Go to Authentication > Providers > Google')
console.log('   - Google OAuth should be enabled')
console.log('   - Client ID and Secret should be set')
console.log('\n3. Check Google Cloud Console')
console.log('   - Redirect URIs should include Supabase callback URL')

console.log('\n🔗 Expected Redirect URLs:')
console.log('- https://yourdomain.com/dashboard')
console.log('- https://yourdomain.com/auth/callback')
console.log('- http://localhost:3000/dashboard (dev)')

console.log('\n💡 If redirects still fail:')
console.log('1. Check browser console for OAuth errors')
console.log('2. Verify Supabase project is in same region as your app')
console.log('3. Ensure CORS settings allow your domain')
console.log('4. Check if your domain has valid SSL certificate')
