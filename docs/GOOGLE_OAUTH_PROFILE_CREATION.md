# Google OAuth Profile Creation

## Overview
This document explains how the application automatically creates user profiles when users sign in with Google OAuth.

## How It Works

### 1. Google OAuth Flow
When a user clicks "Continue with Google":
1. The `signInWithGoogle()` method in `AuthService` is called
2. Supabase redirects the user to Google for authentication
3. After successful authentication, Google redirects back to the application
4. Supabase creates an `auth.users` record with the Google user data

### 2. Automatic Profile Creation
The profile creation happens in multiple places to ensure reliability:

#### A. Database Trigger (Primary Method)
- A PostgreSQL trigger `on_auth_user_created` automatically fires when a new user is created
- The trigger function `handle_new_user()` extracts data from `raw_user_meta_data` and creates a profile
- This happens at the database level, ensuring profiles are always created

#### B. Application-Level Profile Creation (Backup Method)
- The `AuthContext` listens for `SIGNED_IN` events
- When a user signs in via OAuth, it calls `AuthService.handleOAuthCallback()`
- This method uses `ProfileService.createProfileFromGoogle()` to create/update the profile
- The `LoginPage` also has additional profile creation logic as a safety measure

### 3. Profile Data Sources
The system extracts profile information from multiple sources in order of priority:

1. **Google OAuth Data**: `full_name`, `picture` (avatar), `email`
2. **Supabase User Metadata**: `user_metadata.full_name`, `user_metadata.avatar_url`
3. **Fallback Values**: Generated username from email, default role

### 4. Profile Service Methods

#### `createProfileFromGoogle(user, googleData)`
- Creates or updates a user profile from Google OAuth data
- Handles both new users and existing users
- Automatically generates username from email if not provided
- Sets default role to 'user'

#### `upsertProfile(profileData)`
- Creates or updates a profile record
- Uses PostgreSQL `ON CONFLICT` for safe upserts
- Returns the created/updated profile

#### `getProfile(userId)`
- Retrieves a user's profile by ID
- Handles errors gracefully

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trigger Function
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Components and Hooks

### ProfileService
- Handles all profile-related database operations
- Located at `src/services/user/profileService.js`
- Provides methods for CRUD operations on profiles

### useProfile Hook
- React hook for easy profile management in components
- Automatically fetches and manages profile state
- Provides methods for updating profiles
- Located at `src/hooks/useProfile.js`

### ProfileDisplay Component
- Displays user profile information
- Shows avatar, name, role, and other profile data
- Located at `src/components/user/ProfileDisplay.js`

## Error Handling

### Graceful Degradation
- Profile creation failures don't break the authentication flow
- Users can still sign in even if profile creation fails
- Warnings are logged but don't prevent login

### Fallback Values
- If Google data is missing, sensible defaults are used
- Username is generated from email address
- Empty strings are used for missing optional fields

## Testing

### Unit Tests
- `ProfileService` has comprehensive test coverage
- Tests cover profile creation, updates, and error scenarios
- Located at `src/services/user/__tests__/profileService.test.js`

### Manual Testing
1. Sign in with Google OAuth
2. Check that profile is created in the database
3. Verify profile data is displayed in the Dashboard
4. Test profile updates and modifications

## Troubleshooting

### Common Issues

#### Profile Not Created
- Check database trigger is properly installed
- Verify `profiles` table exists and has correct permissions
- Check Supabase logs for trigger execution errors

#### Missing Profile Data
- Verify Google OAuth is configured correctly
- Check that required scopes are requested
- Ensure `raw_user_meta_data` contains expected fields

#### Permission Errors
- Verify Row Level Security (RLS) policies are correct
- Check that authenticated users have proper permissions
- Ensure service role has necessary access

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify Supabase authentication is working
3. Check database logs for trigger execution
4. Verify profile table structure and permissions

## Future Enhancements

### Planned Features
- Profile picture upload and management
- Additional profile fields (bio, location, etc.)
- Profile privacy settings
- Social media integration

### Potential Improvements
- Batch profile creation for multiple users
- Profile data validation and sanitization
- Profile backup and restore functionality
- Advanced profile search and filtering
