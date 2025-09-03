#!/usr/bin/env node

// Script to test Supabase OAuth configuration
import { createClient } from '@supabase/supabase.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase OAuth Configuration...\n')

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables:')
    console.log(`   REACT_APP_SUPABASE_URL: ${supabaseUrl ? '✅ SET' : '❌ NOT SET'}`)
    console.log(`   REACT_APP_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ SET' : '❌ NOT SET'}`)
    process.exit(1)
}

console.log('✅ Environment variables loaded')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)

try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('\n🔗 Testing Supabase connection...')

    // Test basic connection
    const { data, error } = await supabase.auth.getSession()

    if (error) {
        console.log('❌ Connection failed:', error.message)
    } else {
        console.log('✅ Supabase connection successful')
        console.log(`   Session: ${data.session ? 'Active' : 'None'}`)
    }

    console.log('\n📋 OAuth Configuration Test:')
    console.log('1. Test Google OAuth redirect URL construction...')

    const redirectUrl = `${new URL(supabaseUrl).origin}/dashboard`
    console.log(`   Expected redirect: ${redirectUrl}`)

    console.log('\n2. Verify these URLs are in your Supabase dashboard:')
    console.log(`   - Site URL: ${new URL(supabaseUrl).origin}`)
    console.log(`   - Redirect URLs: ${redirectUrl}`)

    console.log('\n3. Verify these URLs are in Google Cloud Console:')
    console.log(`   - ${supabaseUrl}/auth/v1/callback`)
    console.log(`   - ${redirectUrl}`)

} catch (error) {
    console.log('❌ Test failed:', error.message)
}

console.log('\n🎯 Next Steps:')
console.log('1. Check Supabase dashboard settings')
console.log('2. Verify Google Cloud Console redirect URIs')
console.log('3. Test OAuth flow in browser')
console.log('4. Check browser console for errors')
