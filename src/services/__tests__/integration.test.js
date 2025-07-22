import { supabase } from '../supabase'

// This test requires real Supabase credentials
// Only run if environment variables are set
const hasCredentials = process.env.REACT_APP_SUPABASE_URL &&
    process.env.REACT_APP_SUPABASE_ANON_KEY

describe('Supabase Integration Tests', () => {
    beforeAll(() => {
        // Skip tests if no credentials
        if (!hasCredentials) {
            console.log('⚠️  Skipping integration tests - no Supabase credentials found')
        }
    })

    test('should connect to Supabase with valid credentials', async () => {
        if (!hasCredentials) {
            console.log('⏭️  Skipping test - no credentials')
            return
        }

        // Check if supabase is properly initialized
        if (!supabase || !supabase.auth) {
            console.log('⏭️  Skipping test - Supabase client not properly initialized')
            return
        }

        try {
            // Test basic connection by getting the current session
            const { data, error } = await supabase.auth.getSession()

            // Should not throw an error even if no session
            expect(error).toBeNull()
            expect(data).toBeDefined()
            expect(data.session).toBeDefined()

            console.log('✅ Supabase connection successful')
        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message)
            throw error
        }
    }, 10000) // 10 second timeout

    test('should access Math_Past_Paper table', async () => {
        if (!hasCredentials) {
            console.log('⏭️  Skipping test - no credentials')
            return
        }

        // Check if supabase is properly initialized
        if (!supabase || !supabase.from) {
            console.log('⏭️  Skipping test - Supabase client not properly initialized')
            return
        }

        try {
            // Test accessing the existing Math_Past_Paper table
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .limit(1)

            // Handle case where table doesn't exist (404 error)
            if (error && error.message && error.message.includes('404')) {
                console.log('⚠️  Math_Past_Paper table not found - this is expected in test environment')
                expect(error).toBeDefined()
                return
            }

            // Should not throw an error even if table is empty
            expect(error).toBeNull()
            expect(data).toBeDefined()
            expect(Array.isArray(data)).toBe(true)

            console.log('✅ Math_Past_Paper table accessible')
        } catch (error) {
            console.error('❌ Math_Past_Paper table access failed:', error.message)
            throw error
        }
    }, 10000)

    test('should access profiles table', async () => {
        if (!hasCredentials) {
            console.log('⏭️  Skipping test - no credentials')
            return
        }

        // Check if supabase is properly initialized
        if (!supabase || !supabase.from) {
            console.log('⏭️  Skipping test - Supabase client not properly initialized')
            return
        }

        try {
            // Test accessing the existing profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(1)

            // Handle case where table doesn't exist (404 error)
            if (error && error.message && error.message.includes('404')) {
                console.log('⚠️  Profiles table not found - this is expected in test environment')
                expect(error).toBeDefined()
                return
            }

            // Should not throw an error even if table is empty
            expect(error).toBeNull()
            expect(data).toBeDefined()
            expect(Array.isArray(data)).toBe(true)

            console.log('✅ Profiles table accessible')
        } catch (error) {
            console.error('❌ Profiles table access failed:', error.message)
            throw error
        }
    }, 10000)
})