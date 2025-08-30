# Supabase Setup Checklist

## ✅ Required Supabase Settings

### 1. **Supabase Dashboard Settings**
- [ ] Go to **Settings** → **Database**
- [ ] Enable **Connection Pooling**
- [ ] Set **Pool Size** to 15
- [ ] Set **Connection Timeout** to 30s
- [ ] Set **Idle Timeout** to 10m
- [ ] Set **Statement Timeout** to 30s

### 2. **Enable Extensions**
- [ ] Go to **Database** → **Extensions**
- [ ] Enable `pg_stat_statements` ✅
- [ ] Verify `pg_trgm` is enabled (usually already enabled) ✅

### 3. **SQL Editor Setup**
- [ ] Go to **SQL Editor**
- [ ] Run `supabase_setup.sql` first
- [ ] Run `database_indexes_optimization.sql`
- [ ] Run `optimized_search_functions.sql`

### 4. **Verify Setup**
- [ ] Run: `SELECT * FROM supabase_performance_stats;`
- [ ] Run: `SELECT * FROM get_performance_baseline();`
- [ ] Test your application

## 🚀 Quick Commands to Run

### In Supabase SQL Editor:

```sql
-- 1. Run the setup script
-- Copy and paste database/safe_supabase_setup.sql

-- 2. Run the indexes
-- Copy and paste database/safe_database_indexes.sql

-- 3. Run the optimized functions
-- Copy and paste database/safe_optimized_search_functions.sql

-- 4. Verify everything works
SELECT * FROM supabase_performance_stats;
SELECT * FROM get_performance_baseline();
SELECT * FROM get_all_tags();
```

## 📊 Monitor Performance

### Weekly Checks:
```sql
-- Check performance
SELECT * FROM get_query_performance_stats();

-- Update statistics
SELECT update_table_statistics();

-- Check index usage
SELECT * FROM index_usage_stats;
```

## ⚠️ Common Issues & Solutions

### Issue: "Function not found"
**Solution**: Run the SQL files again in order

### Issue: "Permission denied"
**Solution**: Check RLS policies are set up correctly

### Issue: "Extension not available"
**Solution**: Enable extensions in Database → Extensions

## 🎯 Expected Results

After setup, you should see:
- ✅ Faster search queries (5-10x improvement)
- ✅ Faster filter queries (2-5x improvement)
- ✅ Better tag search performance (3-7x improvement)
- ✅ Improved overall application responsiveness

## 📞 Need Help?

1. Check the `supabase_settings_guide.md` for detailed instructions
2. Verify all SQL files ran successfully
3. Test with simple queries first
4. Monitor performance with the provided functions

---

**Time to complete**: ~10-15 minutes
**Difficulty**: Easy
**Impact**: High performance improvement

