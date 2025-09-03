-- Fix Google OAuth Profile Creation Trigger
-- This script updates the trigger function to better handle Google OAuth data

-- ============================================================================
-- STEP 1: CHECK CURRENT TRIGGER FUNCTION
-- ============================================================================

-- Check if the trigger function exists and what it contains
SELECT
    'Current Trigger Function' as step,
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ============================================================================
-- STEP 2: CREATE IMPROVED TRIGGER FUNCTION
-- ============================================================================

-- Create or replace the trigger function with better Google OAuth support
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        -- Check if profile already exists (prevent duplicates)
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
            -- Extract user data from multiple possible sources
            DECLARE
                user_full_name TEXT;
                user_avatar_url TEXT;
                user_email TEXT;
            BEGIN
                -- Try to get full name from various metadata fields
                user_full_name := COALESCE(
                    NEW.raw_user_meta_data->>'full_name',
                    NEW.raw_user_meta_data->>'name',
                    NEW.raw_user_meta_data->>'display_name',
                    NEW.raw_user_meta_data->>'given_name' || ' ' || COALESCE(NEW.raw_user_meta_data->>'family_name', ''),
                    ''
                );

                -- Try to get avatar URL from various metadata fields
                user_avatar_url := COALESCE(
                    NEW.raw_user_meta_data->>'avatar_url',
                    NEW.raw_user_meta_data->>'picture',
                    NEW.raw_user_meta_data->>'photoURL',
                    NEW.raw_user_meta_data->>'profile_picture',
                    ''
                );

                -- Get email
                user_email := COALESCE(NEW.email, '');

                -- Insert new profile record
                INSERT INTO profiles (id, full_name, avatar_url, username, role)
                VALUES (
                    NEW.id,
                    user_full_name,
                    user_avatar_url,
                    COALESCE(
                        NEW.raw_user_meta_data->>'username',
                        NEW.raw_user_meta_data->>'preferred_username',
                        CASE
                            WHEN user_email != '' THEN split_part(user_email, '@', 1)
                            ELSE 'user_' || substr(NEW.id::text, 1, 8)
                        END
                    ),
                    'user'
                );

                RAISE NOTICE 'Profile created for user % with name: %, avatar: %',
                    NEW.id, user_full_name, user_avatar_url;
            END;
        ELSE
            RAISE NOTICE 'Profile already exists for user %', NEW.id;
        END IF;
    ELSE
        RAISE NOTICE 'Profiles table does not exist - cannot create profile';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: VERIFY TRIGGER FUNCTION
-- ============================================================================

-- Check if function was created
SELECT
    'Verification: Function Created' as step,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ============================================================================
-- STEP 4: UPDATE EXISTING PROFILES WITH GOOGLE DATA
-- ============================================================================

-- Update existing profiles with Google OAuth data if available
UPDATE profiles
SET
    full_name = COALESCE(
        profiles.full_name,
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        u.raw_user_meta_data->>'display_name',
        u.raw_user_meta_data->>'given_name' || ' ' || COALESCE(u.raw_user_meta_data->>'family_name', '')
    ),
    avatar_url = COALESCE(
        profiles.avatar_url,
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture',
        u.raw_user_meta_data->>'photoURL'
    ),
    username = COALESCE(
        profiles.username,
        u.raw_user_meta_data->>'username',
        u.raw_user_meta_data->>'preferred_username',
        CASE
            WHEN u.email != '' THEN split_part(u.email, '@', 1)
            ELSE 'user_' || substr(u.id::text, 1, 8)
        END
    ),
    updated_at = NOW()
FROM auth.users u
WHERE profiles.id = u.id
AND u.raw_user_meta_data IS NOT NULL
AND (
    u.raw_user_meta_data->>'full_name' IS NOT NULL OR
    u.raw_user_meta_data->>'name' IS NOT NULL OR
    u.raw_user_meta_data->>'avatar_url' IS NOT NULL OR
    u.raw_user_meta_data->>'picture' IS NOT NULL
);

-- Show how many profiles were updated
SELECT
    'Profile Updates' as step,
    COUNT(*) as profiles_updated
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.raw_user_meta_data IS NOT NULL
AND (
    u.raw_user_meta_data->>'full_name' IS NOT NULL OR
    u.raw_user_meta_data->>'name' IS NOT NULL OR
    u.raw_user_meta_data->>'avatar_url' IS NOT NULL OR
    u.raw_user_meta_data->>'picture' IS NOT NULL
);

-- ============================================================================
-- STEP 5: SHOW CURRENT PROFILE DATA
-- ============================================================================

-- Display current profile data to verify updates
SELECT
    'Current Profiles' as step,
    p.id,
    p.full_name,
    p.avatar_url,
    p.username,
    p.role,
    p.updated_at,
    u.email,
    u.raw_user_meta_data
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.updated_at DESC
LIMIT 5;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Google OAuth trigger fix completed successfully!';
    RAISE NOTICE 'The trigger function now better extracts Google OAuth data.';
    RAISE NOTICE 'Existing profiles have been updated with available Google data.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test Google OAuth login again';
    RAISE NOTICE '2. Verify profile data is properly extracted';
    RAISE NOTICE '3. Check that avatars and names appear in the Dashboard';
END $$;
