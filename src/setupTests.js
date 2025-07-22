// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Only mock Supabase for unit tests, not integration tests
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    // Mock Supabase
    jest.mock('./services/supabase', () => ({
        supabase: {
            auth: {
                signUp: jest.fn(),
                signInWithPassword: jest.fn(),
                signOut: jest.fn(),
                getUser: jest.fn(),
                getSession: jest.fn(),
                resetPasswordForEmail: jest.fn(),
                updateUser: jest.fn(),
                onAuthStateChange: jest.fn(() => ({
                    data: { subscription: { unsubscribe: jest.fn() } }
                }))
            },
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(),
                        order: jest.fn(() => ({
                            limit: jest.fn(() => ({
                                order: jest.fn()
                            }))
                        }))
                    })),
                    order: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            order: jest.fn()
                        }))
                    })),
                    or: jest.fn(() => ({
                        order: jest.fn(() => ({
                            order: jest.fn()
                        }))
                    })),
                    gte: jest.fn(() => ({
                        lte: jest.fn(() => ({
                            order: jest.fn(() => ({
                                order: jest.fn()
                            }))
                        }))
                    })),
                    limit: jest.fn(() => ({
                        order: jest.fn()
                    }))
                })),
                insert: jest.fn(() => ({
                    select: jest.fn()
                })),
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn()
                    }))
                })),
                delete: jest.fn(() => ({
                    eq: jest.fn()
                }))
            }))
        }
    }))
}

// Mock environment variables
process.env.REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://test.supabase.co'
process.env.REACT_APP_SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'test-anon-key'
process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'