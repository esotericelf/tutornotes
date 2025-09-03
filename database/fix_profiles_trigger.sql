-- Fix Profiles Table Trigger for User Registration
-- This script ensures that a profile record is created automatically when a user registers

-- ============================================================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================================================

-- Check if the trigger function exists
SELECT
    'Checking Trigger Function' as step,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Check if the trigger exists
SELECT
    'Checking Trigger' as step,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================================================
-- STEP 2: CREATE/FIX THE TRIGGER FUNCTION
-- ============================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        -- Check if profile already exists (prevent duplicates)
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
            -- Insert new profile record
            INSERT INTO profiles (id, full_name, avatar_url)
            VALUES (
                NEW.id,
                COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
                COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
            );
            RAISE NOTICE 'Profile created for user %', NEW.id;
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
-- STEP 3: CREATE/FIX THE TRIGGER
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 4: TEST THE TRIGGER
-- ============================================================================

-- Check if trigger was created
SELECT
    'Verification: Trigger Created' as step,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function was created
SELECT
    'Verification: Function Created' as step,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ============================================================================
-- STEP 5: MANUAL PROFILE CREATION FOR EXISTING USERS
-- ============================================================================

-- Create profiles for any existing users who don't have them
INSERT INTO profiles (id, full_name, avatar_url)
SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    COALESCE(u.raw_user_meta_data->>'avatar_url', '')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show how many profiles were created
SELECT
    'Manual Profile Creation' as step,
    COUNT(*) as profiles_created
FROM profiles;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Profile trigger fix completed successfully!';
    RAISE NOTICE 'New user registrations will now automatically create profile records.';
    RAISE NOTICE 'Existing users without profiles have been given profile records.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test user registration again';
    RAISE NOTICE '2. Verify profile record is created automatically';
    RAISE NOTICE '3. Check that existing users now have profiles';
END $$;
