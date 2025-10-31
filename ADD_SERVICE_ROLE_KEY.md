# ⚠️ CRITICAL: Add SUPABASE_SERVICE_ROLE_KEY to Fix Cache Issues

## Problem
The `/report` page is showing incorrect/cached data because `SUPABASE_SERVICE_ROLE_KEY` is not configured.

## Why This Matters
- Without the service role key, the app falls back to using the anon key
- The anon key is subject to Row Level Security (RLS) policies
- This causes caching issues and inconsistent data on the report page
- Admin operations may also be affected

## How to Get the Service Role Key

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `maratika-monlam`
3. **Go to Settings**: Click the gear icon in the left sidebar
4. **Click "API"**: Under Project settings
5. **Find "service_role" key**: Scroll down to the API keys section
6. **Copy the key**: Click "Copy" next to the service_role key (it starts with `eyJ...`)

## How to Add to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `maratika-monlam` (or your project name)
3. **Go to Settings**: Click on the project, then "Settings" tab
4. **Click "Environment Variables"**: In the left sidebar
5. **Add new variable**:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (paste the service role key you copied)
   - Environment: Select **Production**, **Preview**, and **Development**
6. **Click "Save"**

## After Adding

1. **Redeploy your project**:
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

2. **Test the report page**:
   - Visit `/report` on your site
   - Check browser console for logs
   - Should see "Environment check - SUPABASE_SERVICE_ROLE_KEY: Set"
   - Data should now be accurate and up-to-date

## Security Note ⚠️

**NEVER** commit the service role key to git or expose it publicly! It has full database access.
- It's server-side only
- Keep it secret
- Only add to environment variables in Vercel

## Alternative: Fix RLS Policies

If you can't use the service role key, you'd need to configure RLS policies to allow public read access to submissions for the report page. However, using the service role key is the recommended approach for server-side operations.

## Verification

After adding and redeploying, check the logs. You should see:
```
Environment check - SUPABASE_URL: Set
Environment check - SUPABASE_SERVICE_ROLE_KEY: Set
```

If you see:
```
⚠️ SUPABASE_SERVICE_ROLE_KEY not set! Falling back to anon key. This may cause RLS/cache issues.
```

Then the key was not properly configured or the app wasn't redeployed.

