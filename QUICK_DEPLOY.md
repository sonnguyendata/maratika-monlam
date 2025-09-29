# Quick Deploy Instructions

## 🚀 Ready to Deploy!

Your Túc Số Monlam app is ready for deployment. Here are the quickest ways to get it live:

### Option 1: Vercel (Recommended - 5 minutes)

1. **Install Node.js** (if not installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Install Node.js 18+

2. **Deploy via Vercel CLI**:
   ```bash
   cd tuc-so-monlam
   npm install
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - Go to your project settings
   - Add all variables from `env.example`

### Option 2: GitHub + Vercel (10 minutes)

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/tuc-so-monlam.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables
   - Deploy!

### Option 3: Manual Setup (15 minutes)

1. **Set up database** (Supabase recommended):
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Run SQL from `db/migrations.sql`

2. **Set up Redis** (Upstash recommended):
   - Create account at [upstash.com](https://upstash.com)
   - Create Redis database

3. **Deploy to Vercel**:
   - Follow Option 1 or 2 above

## 📋 Required Environment Variables

Copy these to your Vercel project:

```env
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
REDIS_URL=redis://default:password@host:port
ADMIN_USER=admin
ADMIN_PASS=your_secure_password
HASH_SALT=your_random_salt_string
EVENT_START=2025-10-29
EVENT_END=2025-11-02
```

## ✅ Post-Deployment Checklist

- [ ] Test form submission
- [ ] Check report page
- [ ] Test admin login
- [ ] Verify language toggle
- [ ] Test on mobile
- [ ] Check database connection
- [ ] Verify Redis is working

## 🎯 Your App Will Be Live At:
`https://your-project-name.vercel.app`

## 🆘 Need Help?

1. Check `DEPLOYMENT.md` for detailed instructions
2. Review Vercel deployment logs
3. Test database connection
4. Verify environment variables

**Your sacred Buddhist-themed Monlam app is ready to serve the community! 🙏**

