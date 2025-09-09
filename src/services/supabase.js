import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client with enhanced configuration for web compatibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Ensure auth works across different environments
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Add debug logging for web vs mobile issues
        debug: process.env.NODE_ENV === 'development'
    },
    // Add global configuration for better web compatibility
    global: {
        headers: {
            'X-Client-Info': 'tutornotes-web'
        }
    },
    // Ensure realtime works properly
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Debug: Log client configuration (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log('Supabase client configured for:', typeof navigator !== 'undefined' ? 'web' : 'server');
}

// Export for use in other services
export default supabase