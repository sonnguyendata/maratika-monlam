# Vercel Environment Variables Setup

## Fix Applied ✅

The `vercel.json` file has been updated to remove non-existent secret references. Now you need to set the environment variables directly in the Vercel dashboard.

## Set Environment Variables in Vercel

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add each variable from the list below:**

### Required Environment Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:M@ratika2025@db.xrizfcqzplckyqohomza.supabase.co:5432/postgres` | PostgreSQL connection string |
| `SUPABASE_URL` | `https://xrizfcqzplckyqohomza.supabase.co` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaXpmY3F6cGxja3lxb2hvbXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjI3NzQsImV4cCI6MjA3NDYzODc3NH0.kLRrA_JKtYInmJaNW4EI6e2ItiQTsYrLK9K5sa2rQL4` | Supabase anonymous key |
| `REDIS_URL` | `redis://default:ATaMAAIncDJjNTIwMTAzM2JjNDY0OTg3ODIyYTBmZTBlZDA5YjE1OHAyMTM5NjQ@wanted-quetzal-13964.upstash.io:6379` | Upstash Redis connection |
| `ADMIN_USER` | `admin` | Admin username |
| `ADMIN_PASS` | `M@ratika2025` | Admin password |
| `HASH_SALT` | `M@ratika` | Security salt for hashing |
| `EVENT_START` | `2025-10-29` | Event start date |
| `EVENT_END` | `2025-11-02` | Event end date |

## Steps to Add Variables

1. **Click "Add New"** in Environment Variables
2. **Enter the Variable Name** (e.g., `DATABASE_URL`)
3. **Enter the Value** (copy from the table above)
4. **Select Environment**: Production, Preview, and Development
5. **Click "Save"**
6. **Repeat for all variables**

## After Setting Variables

1. **Redeploy your project** from the Vercel dashboard
2. **Test the application** to ensure everything works
3. **Check the logs** if there are any issues

## Database Setup

Don't forget to run the database migration in Supabase:

1. **Go to Supabase SQL Editor**
2. **Copy and paste the contents of `db/migrations.sql`**
3. **Run the migration**

## Your App Will Be Live At:
`https://your-project-name.vercel.app`

## Admin Access:
- **Username**: `admin`
- **Password**: `M@ratika2025`

The Túc Số Monlam app should now deploy successfully! 🙏
