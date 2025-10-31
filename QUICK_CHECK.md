# Quick Check While Waiting for Deploy

## Alternative: Check Vercel Logs

While we wait for the debug endpoint to deploy, you can check Vercel logs:

1. Go to: **Vercel Dashboard**
2. Select your project: `maratika-monlam`
3. Go to **Deployments** tab
4. Click on the **latest deployment**
5. Click **"Functions"** tab
6. Look for `/api/report/summary` function
7. Click on it to see the logs

**Look for these lines**:
```
Environment check - SUPABASE_SERVICE_ROLE_KEY: Set
```
or
```
Environment check - SUPABASE_SERVICE_ROLE_KEY: Missing
```

If you see "Missing", that's the problem!

## Or: Check Your Browser Console

1. Visit: `https://maratika-monlam.vercel.app/report`
2. Open DevTools (F12) → Console tab
3. **Look for**:
   - `Environment check - SUPABASE_SERVICE_ROLE_KEY: Set` ✅
   - `Environment check - SUPABASE_SERVICE_ROLE_KEY: Missing` ❌
   - `Using admin client: true` ✅
   - `Using admin client: false` ❌

## Most Likely Issue

Based on the symptoms, I'm 99% certain the issue is:

**`SUPABASE_SERVICE_ROLE_KEY` is missing from Vercel environment variables.**

### To Fix:
1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Look for `SUPABASE_SERVICE_ROLE_KEY`
4. If it's missing, add it:
   - Get the key from Supabase Dashboard → Settings → API → Service Role Key
   - Add to Vercel as `SUPABASE_SERVICE_ROLE_KEY`
   - Make sure it's enabled for **Production**
5. **Redeploy** the project

## Why This Matters

Without the service role key:
- `supabaseAdmin` falls back to regular `supabase` client
- Subject to Row Level Security (RLS) policies
- May have caching issues
- May not see all data

With the service role key:
- Bypasses RLS completely
- Sees all data
- No caching issues

