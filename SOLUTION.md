# ✅ SOLUTION FOUND!

## The Problem

**`SUPABASE_SERVICE_ROLE_KEY` is NOT set in your Vercel environment variables.**

This causes:
- `/report` page to show old data
- Admin operations to use wrong client
- RLS policies to interfere with queries

## The Fix

### Step 1: Get Your Service Role Key
1. Go to: https://supabase.com/dashboard
2. Select project: `maratika-monlam` 
3. Settings → API
4. Scroll to "service_role" key (starts with `eyJ...`)
5. Copy it

### Step 2: Add to Vercel
1. Go to: https://vercel.com/dashboard
2. Select project: `maratika-monlam`
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `SUPABASE_SERVICE_ROLE_KEY`
6. Value: (paste the key you copied)
7. Environments: Select **ALL THREE** (Production, Preview, Development)
8. Click "Save"

### Step 3: Redeploy
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2 minutes

### Step 4: Verify
Visit: `https://maratika-monlam.vercel.app/api/debug/env`

Should show:
```json
{
  "message": "✅ SUPABASE_SERVICE_ROLE_KEY is set",
  "variables": {
    "hasSupabaseServiceRoleKey": true
  }
}
```

## That's It!

After this, `/report` will show fresh data that matches `/admin`.

