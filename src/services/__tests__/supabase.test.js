import { supabase } from '../supabase'

describe('Supabase Configuration', () => {
    test('should have correct environment variables', () => {
        expect(process.env.REACT_APP_SUPABASE_URL).toBeDefined()
        expect(process.env.REACT_APP_SUPABASE_ANON_KEY).toBeDefined()
        expect(process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
    })

    test('should export supabase client', () => {
        expect(supabase).toBeDefined()
        expect(typeof supabase).toBe('object')
    })

    test('should have auth methods', () => {
        expect(supabase.auth).toBeDefined()
        expect(typeof supabase.auth.signUp).toBe('function')
        expect(typeof supabase.auth.signInWithPassword).toBe('function')
        expect(typeof supabase.auth.signOut).toBe('function')
    })

    test('should have database methods', () => {
        expect(supabase.from).toBeDefined()
        expect(typeof supabase.from).toBe('function')
    })
})