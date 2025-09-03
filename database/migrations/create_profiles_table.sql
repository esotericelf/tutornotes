-- Create Profiles Table
-- This table stores user profile information linked to auth.users
-- This script is safe and will not overwrite existing data

-- Check if profiles table already exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Profiles table already exists - skipping creation';
    ELSE
        RAISE NOTICE 'Creating profiles table...';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance (only if table exists and columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        -- Check if username column exists before creating index
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
        END IF;

        -- Check if role column exists before creating index
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
        END IF;

        -- Check if created_at column exists before creating index
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
        END IF;

        RAISE NOTICE 'Profiles indexes created successfully (only for existing columns)';
    END IF;
END $$;

-- Enable Row Level Security (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        -- Allow users to read their own profile
        DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
        CREATE POLICY "Allow users to read their own profile" ON profiles
        FOR SELECT TO authenticated USING (auth.uid() = id);

        -- Allow users to update their own profile
        DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
        CREATE POLICY "Allow users to update their own profile" ON profiles
        FOR UPDATE TO authenticated USING (auth.uid() = id);

        -- Allow admins to read all profiles
        DROP POLICY IF EXISTS "Allow admins to read all profiles" ON profiles;
        CREATE POLICY "Allow admins to read all profiles" ON profiles
        FOR SELECT TO authenticated USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );

        -- Allow admins to update all profiles
        DROP POLICY IF EXISTS "Allow admins to update all profiles" ON profiles;
        CREATE POLICY "Allow admins to update all profiles" ON profiles
        FOR UPDATE TO authenticated USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );

        RAISE NOTICE 'Profiles RLS policies created successfully';
    END IF;
END $$;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        INSERT INTO profiles (id, full_name, avatar_url)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant permissions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        GRANT SELECT, UPDATE ON profiles TO authenticated;
        GRANT ALL ON profiles TO service_role;

        -- Create a view for easy access to user profiles with auth data
        CREATE OR REPLACE VIEW profiles_with_auth AS
        SELECT
            p.id,
            p.username,
            p.full_name,
            p.avatar_url,
            p.website,
            p.role,
            p.created_at,
            p.updated_at,
            u.email,
            u.email_confirmed_at,
            u.last_sign_in_at
        FROM profiles p
        LEFT JOIN auth.users u ON p.id = u.id;

        -- Grant permissions on the view
        GRANT SELECT ON profiles_with_auth TO authenticated;

        RAISE NOTICE 'Profiles permissions and view created successfully';
    END IF;
END $$;

-- Verification query
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Profiles table verification: % profiles found', (SELECT COUNT(*) FROM profiles);
    ELSE
        RAISE NOTICE 'Profiles table does not exist yet';
    END IF;
END $$;
