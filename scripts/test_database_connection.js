#!/usr/bin/env node

// Test Database Connection and Profile Creation
// This script helps verify that the database is working correctly

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testDatabaseConnection() {
    console.log('🧪 Testing Database Connection and Profile Creation...\n')

    // Check environment variables
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing Supabase environment variables')
        console.error('   Please check your .env file')
        return
    }

    console.log('✅ Environment variables found')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)

    try {
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        console.log('✅ Supabase client created')

        // Test basic connection
        console.log('\n📡 Testing basic connection...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
            console.error('❌ Session error:', sessionError.message)
        } else {
            console.log('✅ Basic connection successful')
            console.log(`   Session: ${session ? 'Active' : 'None'}`)
        }

        // Test profiles table access
        console.log('\n📋 Testing profiles table access...')
        try {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .limit(5)

            if (profilesError) {
                console.error('❌ Profiles table error:', profilesError.message)
                console.error('   This might indicate a permissions or table structure issue')
            } else {
                console.log('✅ Profiles table accessible')
                console.log(`   Found ${profiles.length} profile(s)`)

                if (profiles.length > 0) {
                    console.log('   Sample profile structure:')
                    console.log(JSON.stringify(profiles[0], null, 2))
                }
            }
        } catch (error) {
            console.error('❌ Profiles table access failed:', error.message)
        }

        // Test auth.users table access (if possible)
        console.log('\n👥 Testing auth.users table access...')
        try {
            const { data: users, error: usersError } = await supabase
                .from('auth.users')
                .select('id, email, created_at')
                .limit(5)

            if (usersError) {
                console.log('⚠️  Auth users table access limited (this is normal)')
                console.log(`   Error: ${usersError.message}`)
            } else {
                console.log('✅ Auth users table accessible')
                console.log(`   Found ${users.length} user(s)`)
            }
        } catch (error) {
            console.log('⚠️  Auth users table access limited (this is normal)')
        }

        // Test RLS policies
        console.log('\n🔒 Testing Row Level Security...')
        try {
            // Try to insert a test profile (this should fail due to RLS)
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: '00000000-0000-0000-0000-000000000000',
                    full_name: 'Test User',
                    username: 'testuser'
                })

            if (insertError && insertError.message.includes('new row violates row-level security policy')) {
                console.log('✅ RLS policies are working correctly')
            } else if (insertError) {
                console.log('⚠️  RLS policy test inconclusive:', insertError.message)
            } else {
                console.log('⚠️  RLS policies might not be properly configured')
            }
        } catch (error) {
            console.log('⚠️  RLS test failed:', error.message)
        }

        console.log('\n🎯 Database Connection Test Complete!')
        console.log('\n📚 Next steps:')
        console.log('   1. Check the console output above for any errors')
        console.log('   2. If profiles table is accessible, the issue might be in the application')
        console.log('   3. If profiles table has errors, check your database setup')
        console.log('   4. Run the application and check browser console for profile creation logs')

    } catch (error) {
        console.error('❌ Database connection test failed:', error.message)
        console.error('\n🔧 Troubleshooting tips:')
        console.error('   1. Check your Supabase project is running')
        console.error('   2. Verify your environment variables are correct')
        console.error('   3. Check your internet connection')
        console.error('   4. Verify your Supabase project settings')
    }
}

// Run the test
testDatabaseConnection().catch(console.error)
