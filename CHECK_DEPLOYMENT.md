# How to Check if Your Changes Are Deployed

## Problem
The `/report` page is showing old data even though the code has been fixed. This likely means Vercel hasn't deployed the latest code yet.

## Step 1: Check Git Status

```bash
cd tuc-so-monlam
git pull origin main
git log --oneline -5
```

You should see these recent commits:
- `704034b` - Add report debug endpoint
- `d572e17` - Add critical bug fix documentation  
- `309ae37` - Fix adminClient alias + enhanced logging

## Step 2: Check Vercel Deployment Status

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Look at the **most recent deployment**

You should see:
- ✅ **Production** deployment with a recent timestamp
- Git commit hash should match your latest commit

## Step 3: Force Redeploy

If the latest commit isn't deployed:

### Option A: Via Vercel Dashboard
1. Go to Deployments tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Select **"Production"**
5. Wait for deployment to complete (usually 1-2 minutes)

### Option B: Via Git Push
```bash
cd tuc-so-monlam
# Make a trivial change to trigger redeploy
echo "<!-- Deploy: $(date) -->" >> .gitkeep
git add .gitkeep
git commit -m "Force redeploy: $(date)"
git push origin main
```

## Step 4: Verify Deployment

After redeploying, test these endpoints:

### A. Debug Endpoint
Visit: `https://your-domain.com/api/debug/env`

Should show:
```json
{
  "message": "✅ SUPABASE_SERVICE_ROLE_KEY is set",
  "variables": {
    "hasSupabaseServiceRoleKey": true
  }
}
```

### B. Report Test Endpoint  
Visit: `https://your-domain.com/api/debug/report-test`

Should show:
```json
{
  "usingAdminClient": true,
  "results": {
    "adminClient": {
      "count": [your actual data count]
    }
  }
}
```

### C. Actual Report Page
Visit: `https://your-domain.com/report`

Open browser DevTools (F12) → Console tab

Should see logs like:
```
Using admin client: true (should be true for fresh data)
All submissions fetched: [actual number]
Final result - all_time: [actual count]
```

## Step 5: Compare Admin vs Report

1. Visit `/admin` - note the total count
2. Visit `/report` - compare the count
3. They should match!

If they don't match, check the browser console for any errors.

## Troubleshooting

### If You See "usingAdminClient: false"
- The `SUPABASE_SERVICE_ROLE_KEY` environment variable is NOT set in Vercel
- Go to Vercel → Settings → Environment Variables
- Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key
- Redeploy

### If You See Different Counts
- The data is coming from different sources
- Check console logs to see which client is being used
- Verify the debug endpoints are showing the correct counts

### If Deployment Fails
- Check Vercel logs for build errors
- Verify all dependencies are correct in `package.json`
- Make sure environment variables are set

## Still Not Working?

1. **Wait 2-3 minutes** after redeploy - Vercel needs time to propagate
2. **Clear browser cache**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. **Try incognito mode**
4. **Check Vercel logs** for runtime errors
5. **Contact support** with deployment URL and commit hash

