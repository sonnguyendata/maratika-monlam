# Troubleshooting Guide: Stale Data on Report Page

If the report page is showing stale data that doesn't match Supabase queries, follow these steps:

## Step 1: Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these keys are set:
   - `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL for admin queries**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is added October 27 according to your screenshot. If you see old data from before this date, the environment variable may not be active in production.

## Step 2: Force Redeploy with Latest Code

After updating environment variables, Vercel requires a redeploy:

```bash
cd tuc-so-monlam
git pull origin main
# Make a small change to trigger redeploy
echo "" >> README.md
git add README.md
git commit -m "Trigger redeploy with fresh env vars"
git push origin main
```

**Alternative**: In Vercel Dashboard → Deployments → Click "..." → "Redeploy" (Production)

## Step 3: Check Deployment Logs

After redeploying, check logs for this warning:

```
⚠️ SUPABASE_SERVICE_ROLE_KEY not set! Falling back to anon key. This may cause RLS/cache issues.
```

If you see this warning, the environment variable is NOT set correctly in Vercel.

## Step 4: Clear Supabase Schema Cache

Supabase caches database schema. If views or columns were recently added/modified:

1. Go to Supabase Dashboard → Settings → API
2. Scroll down to "Schema Cache"
3. Click "Refresh schema cache"
4. Wait 30 seconds
5. Test the report page again

## Step 5: Verify Database Views Include deleted_at

Run this query in Supabase SQL Editor:

```sql
SELECT definition 
FROM pg_views 
WHERE viewname = 'v_summary';
```

Verify the WHERE clause includes:
```sql
WHERE deleted_at IS NULL
```

If missing, run:
```bash
cd tuc-so-monlam
cat db/update_views_for_deleted_at.sql
```

Copy the SQL and execute in Supabase SQL Editor.

## Step 6: Test Direct Database Query

Run this query in Supabase SQL Editor to see the actual data:

```sql
SELECT 
  COUNT(*) as total_records,
  SUM(quantity) as total_quantity,
  COUNT(DISTINCT attendee_id) as unique_users
FROM submissions
WHERE flagged = false 
  AND deleted_at IS NULL;
```

Compare this with what your report page shows.

## Step 7: Check Browser Cache

The issue might be browser-side:

1. Open DevTools (F12)
2. Network tab → Check "Disable cache"
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Or use Incognito/Private browsing mode

## Step 8: Check API Response

Open DevTools → Network tab:
1. Filter for `/api/report/summary`
2. Click on a request
3. Check "Response" tab
4. Compare with Supabase query results

Look for console logs in the response showing:
```
Final result - all_time: XXX today: XXX unique: XXX
```

## Common Issues & Solutions

### Issue: Data shows numbers from 3 days ago
**Cause**: Environment variable not active after deployment
**Solution**: Force redeploy (Step 2)

### Issue: Report page shows different numbers than admin page
**Cause**: Report page using views, admin using direct table queries
**Solution**: Both now use direct queries with `supabaseAdmin`, should match

### Issue: Deleting a record doesn't remove it from reports
**Cause**: Views not including `deleted_at` filter
**Solution**: Run `db/update_views_for_deleted_at.sql`

### Issue: Warning in logs about SUPABASE_SERVICE_ROLE_KEY
**Cause**: Environment variable not set in Vercel
**Solution**: Add the key in Vercel → Settings → Environment Variables → Production

## Still Having Issues?

If none of these steps work:

1. Check Vercel deployment logs for errors
2. Verify latest code is deployed: `git log --oneline -5`
3. Test local dev server: `npm run dev`
4. Check if issue is timezone-related (GMT+7 vs UTC)
5. Verify no accidental RLS policies blocking data

## Quick Test

To quickly verify the system is working:

1. Visit `/admin` and delete a test record
2. Visit `/report` immediately
3. The record should be excluded from counts
4. If not, follow steps above to identify the issue

