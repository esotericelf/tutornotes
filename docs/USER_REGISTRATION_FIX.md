# User Registration Fix

## Problem
User registration was failing because the application expected a `profiles` table to exist in the database, but this table was missing.

## Root Cause
When a user registers through Supabase Auth, a record is created in the `auth.users` table, but the application also needs a corresponding record in a `profiles` table to store user profile information like username, full name, avatar, role, etc.

## Solution
Created the missing `profiles` table with the following features:

### Table Structure
- `id` (UUID) - Primary key, references `auth.users(id)`
- `username` (TEXT) - Unique username
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - Profile picture URL
- `website` (TEXT) - User's website
- `role` (TEXT) - User role ('admin' or 'user')
- `created_at` (TIMESTAMPTZ) - Account creation time
- `updated_at` (TIMESTAMPTZ) - Last update time

### Key Features
1. **Automatic Profile Creation**: Trigger automatically creates a profile when a user registers
2. **Row Level Security**: Users can only access their own profiles
3. **Admin Access**: Admins can view and manage all profiles
4. **Performance Indexes**: Optimized for common queries
5. **Data Integrity**: Foreign key constraints ensure data consistency

## Files Created/Modified

### New Files
- `database/migrations/create_profiles_table.sql` - Profiles table creation script
- `scripts/deploy_profiles_table.sh` - Deployment script for profiles table
- `docs/USER_REGISTRATION_FIX.md` - This documentation

### Modified Files
- `scripts/setup_database.sh` - Updated to include profiles table creation

## How to Deploy

### Option 1: Quick Fix (Profiles Table Only)
```bash
./scripts/deploy_profiles_table.sh
```

### Option 2: Complete Database Setup
```bash
./scripts/setup_database.sh
```

### Option 3: Manual Deployment
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/migrations/create_profiles_table.sql`
4. Run the script

## Verification
After deployment, you can verify the fix by:

1. **Testing Registration**: Try registering a new user
2. **Checking Database**: Verify a profile record was created
3. **Running Query**: Check if profiles exist:
   ```sql
   SELECT * FROM profiles;
   ```

## Expected Behavior
- User registration should now work successfully
- A profile record is automatically created for each new user
- Users can access their profile information
- Admins can manage all user profiles

## Troubleshooting
If registration still fails:

1. **Check Environment Variables**: Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set
2. **Verify Table Creation**: Check if the profiles table exists in your database
3. **Check RLS Policies**: Ensure Row Level Security policies are properly configured
4. **Review Console Logs**: Check browser console for specific error messages

## Related Documentation
- `docs/SUPABASE_SETUP_CHECKLIST.md` - Complete setup checklist
- `docs/DATABASE_STRUCTURE.md` - Database structure overview
- `docs/PROJECT_STRUCTURE.md` - Project architecture
