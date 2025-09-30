# Database Setup Instructions

## Fixed Migration Script ✅

The migration script has been updated to safely handle the `idempotency_key` column.

## Run the Migration

### Option 1: Supabase SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `db/migrations.sql`
4. Click **Run** to execute the migration

### Option 2: Command Line
```bash
psql "postgresql://postgres:M@ratika2025@db.xrizfcqzplckyqohomza.supabase.co:5432/postgres" -f db/migrations.sql
```

## What the Migration Creates

### Tables
- **`submissions`** - Main table for túc số records
- **`idempotency_keys`** - Prevents duplicate submissions

### Views
- **`v_totals_by_day`** - Daily totals for charts
- **`v_top10`** - Top 10 contributors leaderboard
- **`v_summary`** - Dashboard KPIs

### Indexes
- Performance indexes on timestamp, attendee_id, flagged status
- Idempotency key index for fast duplicate checking

### Security
- Row Level Security (RLS) enabled
- Policies for data access control

## Verification

After running the migration, verify these tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('submissions', 'idempotency_keys');
```

## Troubleshooting

### If you get "column does not exist" errors:
1. The migration now safely adds missing columns
2. Run the migration again - it will skip existing columns
3. Check that all tables and views were created

### If you get permission errors:
1. Ensure you're using the correct database connection
2. Check that your user has CREATE privileges
3. Verify the connection string is correct

## Next Steps

1. ✅ Run the database migration
2. ✅ Set environment variables in Vercel
3. ✅ Deploy the application
4. ✅ Test form submission
5. ✅ Check admin dashboard

Your Túc Số Monlam database is now ready! 🙏


