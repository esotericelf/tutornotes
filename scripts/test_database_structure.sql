-- Test Database Structure for Quiz Module
-- Run this first to verify your database setup

-- Check if profiles table exists and has correct structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Profiles table exists';

        -- Check if profiles table has the expected columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') THEN
            RAISE NOTICE '✅ Profiles table has id column';
        ELSE
            RAISE NOTICE '❌ Profiles table missing id column';
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
            RAISE NOTICE '✅ Profiles table has role column';
        ELSE
            RAISE NOTICE '❌ Profiles table missing role column';
        END IF;

        -- Show profiles table structure
        RAISE NOTICE 'Profiles table structure:';
        RAISE NOTICE 'Columns: %', (
            SELECT string_agg(column_name || ' ' || data_type, ', ')
            FROM information_schema.columns
            WHERE table_name = 'profiles' AND table_schema = 'public'
        );

    ELSE
        RAISE NOTICE '❌ Profiles table does not exist. Please run create_profiles_table.sql first.';
    END IF;
END $$;

-- Check if auth.users table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
        RAISE NOTICE '✅ Auth users table exists';
    ELSE
        RAISE NOTICE '❌ Auth users table does not exist';
    END IF;
END $$;

-- Check if we can access the current user
DO $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        RAISE NOTICE '✅ Auth context is working, current user: %', auth.uid();
    ELSE
        RAISE NOTICE '⚠️ Auth context not available (this is normal if not authenticated)';
    END IF;
END $$;

-- Show current database user and permissions
SELECT
    current_user as current_user,
    session_user as session_user,
    current_database() as current_database,
    current_schema as current_schema;
