#!/usr/bin/env node

// Test script for redirect URL logic
console.log('🧪 Testing Redirect URL Logic...\n')

// Mock environment variables for testing
const mockEnv = {
    NODE_ENV: 'production',
    REACT_APP_SUPABASE_URL: 'https://abc123.supabase.co',
    REACT_APP_PRODUCTION_URL: 'https://mydomain.com'
}

// Mock the getProductionRedirectUrl logic
function getProductionRedirectUrl() {
    if (mockEnv.NODE_ENV !== 'production') {
        return 'http://localhost:3000/dashboard'
    }

    // Priority 1: Use explicit production URL environment variable
    if (mockEnv.REACT_APP_PRODUCTION_URL) {
        return `${mockEnv.REACT_APP_PRODUCTION_URL}/dashboard`
    }

    // Priority 2: Extract from Supabase URL (most reliable)
    const supabaseUrl = mockEnv.REACT_APP_SUPABASE_URL
    if (supabaseUrl) {
        try {
            const url = new URL(supabaseUrl)
            // Remove any auth-related paths and construct base URL
            const baseUrl = `https://${url.hostname}`
            return `${baseUrl}/dashboard`
        } catch (error) {
            console.warn('Failed to parse Supabase URL:', error)
        }
    }

    // Priority 3: Hardcoded fallback
    console.warn('No production URL found, using fallback')
    return 'https://yourdomain.com/dashboard'
}

console.log('📋 Test Cases:')
console.log('1. With REACT_APP_PRODUCTION_URL set:')
mockEnv.REACT_APP_PRODUCTION_URL = 'https://mydomain.com'
console.log(`   Result: ${getProductionRedirectUrl()}`)

console.log('\n2. Without REACT_APP_PRODUCTION_URL (using Supabase URL):')
delete mockEnv.REACT_APP_PRODUCTION_URL
console.log(`   Result: ${getProductionRedirectUrl()}`)

console.log('\n3. Development environment:')
mockEnv.NODE_ENV = 'development'
console.log(`   Result: ${getProductionRedirectUrl()}`)

console.log('\n4. Production with no env vars (fallback):')
mockEnv.NODE_ENV = 'production'
delete mockEnv.REACT_APP_SUPABASE_URL
console.log(`   Result: ${getProductionRedirectUrl()}`)

console.log('\n✅ Test completed!')
console.log('\n💡 To use in production:')
console.log('1. Set REACT_APP_PRODUCTION_URL=https://yourdomain.com in .env.local')
console.log('2. Or ensure REACT_APP_SUPABASE_URL is set correctly')
console.log('3. Update the hardcoded fallback in the code to your actual domain')
