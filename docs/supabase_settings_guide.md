# Supabase Settings Guide for Database Optimization

This guide covers the essential Supabase settings you need to configure for optimal database performance with the indexing optimizations.

## 🔧 Required Supabase Settings

### 1. **Enable Row Level Security (RLS) - If Not Already Enabled**

Go to your Supabase Dashboard → Authentication → Policies and ensure RLS is enabled for your tables:

```sql
-- Enable RLS on main tables (if not already enabled)
ALTER TABLE "Math_Past_Paper" ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
```

### 2. **Configure RLS Policies for Optimized Functions**

Create policies that allow the optimized functions to work properly:

```sql
-- Policy for Math_Past_Paper (read access for all authenticated users)
CREATE POLICY "Allow authenticated users to read math papers" ON "Math_Past_Paper"
FOR SELECT TO authenticated USING (true);

-- Policy for discussions
CREATE POLICY "Allow authenticated users to read discussions" ON discussions
FOR SELECT TO authenticated USING (true);

-- Policy for tutor_notes (public notes)
CREATE POLICY "Allow authenticated users to read public tutor notes" ON tutor_notes
FOR SELECT TO authenticated USING (is_public = true);

-- Policy for user_favorites (user's own favorites)
CREATE POLICY "Allow users to read their own favorites" ON user_favorites
FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

### 3. **Enable Required Extensions**

Go to Supabase Dashboard → Database → Extensions and enable:

- **`pg_stat_statements`** (for performance monitoring)
- **`pg_trgm`** (for trigram matching - already enabled by default)

```sql
-- Enable extensions (run in SQL Editor if not available in dashboard)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 4. **Configure Database Settings**

Go to Supabase Dashboard → Settings → Database and adjust:

#### **Connection Pooling Settings**
- **Pool Size**: Set to 10-20 (depending on your plan)
- **Connection Timeout**: 30 seconds
- **Idle Timeout**: 10 minutes

#### **Performance Settings**
- **Statement Timeout**: 30 seconds
- **Idle In Transaction Session Timeout**: 10 minutes

### 5. **Set Up Database Triggers for Statistics**

Create triggers to automatically update statistics:

```sql
-- Function to update statistics when data changes
CREATE OR REPLACE FUNCTION update_math_paper_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update statistics after insert/update/delete
    ANALYZE "Math_Past_Paper";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_math_paper_stats
    AFTER INSERT OR UPDATE OR DELETE ON "Math_Past_Paper"
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_math_paper_stats();
```

## 🚀 Supabase Dashboard Configuration Steps

### Step 1: Database Settings
1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Configure the following:
   ```
   Connection Pooling: Enabled
   Pool Size: 15
   Connection Timeout: 30s
   Idle Timeout: 10m
   Statement Timeout: 30s
   ```

### Step 2: Extensions
1. Go to **Database** → **Extensions**
2. Enable:
   - ✅ `pg_stat_statements`
   - ✅ `pg_trgm` (usually already enabled)

### Step 3: RLS Policies
1. Go to **Authentication** → **Policies**
2. Ensure RLS is enabled for your tables
3. Create the policies mentioned above

### Step 4: SQL Editor
1. Go to **SQL Editor**
2. Run the database optimization scripts:
   ```sql
   -- First run the indexes
   -- Copy and paste database/safe_database_indexes.sql

   -- Then run the optimized functions
   -- Copy and paste database/safe_optimized_search_functions.sql
   ```

## 📊 Monitoring in Supabase Dashboard

### 1. **Database Performance**
- Go to **Database** → **Logs** to monitor query performance
- Check **Database** → **Reports** for usage statistics

### 2. **Query Performance**
```sql
-- Run this in SQL Editor to see slow queries
SELECT * FROM get_slow_queries(10);

-- Check index usage
SELECT * FROM index_usage_stats;
```

### 3. **Connection Pooling**
- Monitor connection usage in **Settings** → **Database**
- Watch for connection pool exhaustion

## 🔍 Supabase-Specific Optimizations

### 1. **Connection Pooling Best Practices**
```javascript
// In your frontend code, use connection pooling
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true
    }
  }
);
```

### 2. **Query Optimization for Supabase**
```javascript
// Use the optimized functions instead of direct queries
const { data, error } = await supabase.rpc('search_math_papers_by_keyword', {
  search_term: 'algebra'
});

// Instead of:
// const { data, error } = await supabase
//   .from('Math_Past_Paper')
//   .select('*')
//   .or(`correct_answer.ilike.%algebra%`)
```

### 3. **Real-time Subscriptions Optimization**
```javascript
// If using real-time features, optimize subscriptions
const subscription = supabase
  .channel('math_papers')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'Math_Past_Paper'
    },
    (payload) => {
      // Handle new data
    }
  )
  .subscribe();
```

## ⚠️ Important Supabase Limitations

### 1. **Plan Limitations**
- **Free Plan**: Limited to 500MB database, 2GB bandwidth
- **Pro Plan**: 8GB database, 250GB bandwidth
- **Team Plan**: 100GB database, 1TB bandwidth

### 2. **Query Limits**
- **Free Plan**: 50,000 monthly active users
- **Pro Plan**: 100,000 monthly active users
- **Team Plan**: 400,000 monthly active users

### 3. **Function Limitations**
- **Timeout**: 60 seconds maximum
- **Memory**: 512MB maximum
- **Concurrent executions**: Limited by plan

## 🛠️ Troubleshooting Supabase Issues

### 1. **Function Not Found Error**
```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'search_math_papers_by_keyword';

-- Recreate function if missing
-- Run the optimized_search_functions.sql again
```

### 2. **Permission Denied Error**
```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### 3. **Index Creation Failed**
```sql
-- Check table permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'Math_Past_Paper';

-- Grant index creation permission
GRANT CREATE ON SCHEMA public TO authenticated;
```

## 📈 Performance Monitoring Commands

### Run these in Supabase SQL Editor:

```sql
-- Check overall database performance
SELECT * FROM get_query_performance_stats();

-- Monitor index usage
SELECT * FROM index_usage_stats;

-- Check slow queries
SELECT * FROM get_slow_queries(5);

-- Monitor table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🎯 Summary

**Required Supabase Settings:**
1. ✅ Enable RLS and create policies
2. ✅ Enable `pg_stat_statements` extension
3. ✅ Configure connection pooling
4. ✅ Set appropriate timeouts
5. ✅ Run the optimization scripts in SQL Editor

**Optional but Recommended:**
1. ✅ Set up database triggers for auto-statistics
2. ✅ Monitor performance regularly
3. ✅ Optimize connection pooling settings

After configuring these settings, your database optimizations will work optimally with Supabase's infrastructure!
