-- Current Database State - Diagnostic Script
-- This file captures the current state of the database for future reference

-- 1. Current User Count and Status
SELECT
    'Current User Status' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- 2. All Users with Their Profile Status
SELECT
    'User Profile Status' as check_type,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    CASE
        WHEN p.id IS NOT NULL THEN 'Profile Exists'
        ELSE 'Profile Missing'
    END as profile_status,
    p.id as profile_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 3. Trigger Function Status
SELECT
    'Trigger Function Status' as check_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 4. Trigger Attachment Status
SELECT
    'Trigger Attachment Status' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Profiles Table Structure
SELECT
    'Profiles Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. RLS Policies on Profiles Table
SELECT
    'Profiles RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- 7. Key Tables Status
SELECT
    'Key Tables Status' as check_type,
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'discussions', 'Math_Past_Paper')
ORDER BY tablename;

