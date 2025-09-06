# Quiz Database Troubleshooting Guide

## 🚨 Error: "column 'user_id' does not exist"

### Problem
When running `create_quiz_tables.sql`, you encounter:
```
ERROR: 42703: column "user_id" does not exist
```

### Root Cause
The error occurs because the quiz migration references a `profiles` table that either:
1. Doesn't exist yet, or
2. Has a different column structure than expected

### Solution Steps

#### Step 1: Verify Database Structure
First, run the test script to check your current database setup:

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U postgres -d postgres -f scripts/test_database_structure.sql
```

This will show you:
- ✅ Whether the profiles table exists
- ✅ What columns it has
- ✅ Whether auth context is working

#### Step 2: Fix the Original Migration
The original `create_quiz_tables.sql` had incorrect column references. Use the fixed version instead:

```bash
# Use the corrected migration file:
psql -h your-supabase-host -U postgres -d postgres -f database/migrations/create_quiz_tables_fixed.sql
```

#### Step 3: Alternative - Manual Fix
If you prefer to fix the original file, here are the key changes needed:

```sql
-- Change these lines in create_quiz_tables.sql:

-- 1. Fix foreign key references
created_by UUID REFERENCES profiles(id),  -- NOT auth.users(id)

-- 2. Fix RLS policy references
WHERE id = auth.uid() AND role = 'admin'  -- NOT user_id = auth.uid()
```

### Expected Database Structure

Your `profiles` table should have this structure:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),  -- This is the key column
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Common Issues and Fixes

#### Issue 1: Profiles Table Missing
**Error**: `Profiles table does not exist`
**Solution**: Run `create_profiles_table.sql` first

#### Issue 2: Wrong Column Names
**Error**: `column "user_id" does not exist`
**Solution**: Use `create_quiz_tables_fixed.sql` or fix column references

#### Issue 3: Permission Denied
**Error**: `permission denied for table profiles`
**Solution**: Ensure you're connected as the correct user with proper permissions

#### Issue 4: Auth Context Not Working
**Error**: `function auth.uid() does not exist`
**Solution**: Ensure you're connected to the correct database with auth extensions

### Complete Setup Sequence

1. **First**: Run profiles table creation
   ```bash
   psql -h your-supabase-host -U postgres -d postgres -f database/migrations/create_profiles_table.sql
   ```

2. **Second**: Test database structure
   ```bash
   psql -h your-supabase-host -U postgres -d postgres -f scripts/test_database_structure.sql
   ```

3. **Third**: Create quiz tables
   ```bash
   psql -h your-supabase-host -U postgres -d postgres -f database/migrations/create_quiz_tables_fixed.sql
   ```

### Verification Commands

After successful setup, verify with these commands:

```sql
-- Check if tables exist
\dt quiz_*

-- Check table structure
\d quiz_questions
\d quiz_quizzes
\d quiz_attempts
\d quiz_results

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE 'quiz_%';

-- Test basic operations
SELECT COUNT(*) FROM quiz_questions;
SELECT COUNT(*) FROM quiz_quizzes;
```

### Still Having Issues?

If you continue to have problems:

1. **Check Supabase Dashboard**: Verify table creation in the Supabase web interface
2. **Check Logs**: Look for error messages in Supabase logs
3. **Verify Connection**: Ensure you're connecting to the correct database
4. **Check Permissions**: Verify your database user has the necessary privileges

### Quick Fix Script

If you want to quickly reset and start over:

```sql
-- Drop existing quiz tables (if any)
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_quizzes CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;

-- Then run the fixed migration
\i database/migrations/create_quiz_tables_fixed.sql
```

### Success Indicators

When everything works correctly, you should see:
```
✅ Profiles table found, proceeding with quiz tables creation...
✅ Quiz tables created successfully!
✅ RLS policies configured!
✅ Permissions granted!
🎯 You can now start using the quiz module!
```

### Next Steps

After successful database setup:
1. ✅ Quiz tables are ready
2. ✅ RLS policies are configured
3. ✅ Permissions are granted
4. 🚀 Start building your quiz components!

The quiz module will now work seamlessly with your existing authentication and user management system.
