# Deployment Guide for Túc Số Monlam

## Prerequisites

1. **Node.js 18+** - Install from [nodejs.org](https://nodejs.org/)
2. **Git** - For version control
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
4. **Database** - Supabase or Neon PostgreSQL
5. **Redis** - Upstash Redis instance

## Quick Deployment Steps

### 1. Install Dependencies
```bash
cd tuc-so-monlam
npm install
```

### 2. Set Up Environment Variables
Create `.env.local` file:
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Redis (Upstash)
REDIS_URL=redis://default:password@host:port

# Admin Authentication
ADMIN_USER=admin
ADMIN_PASS=your_secure_password

# Security
HASH_SALT=your_random_salt_string

# Event Configuration
EVENT_START=2025-10-29
EVENT_END=2025-11-02
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to Project Settings > Environment Variables
```

#### Option B: GitHub Integration
1. Push code to GitHub repository
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### 4. Database Setup
```bash
# Run migrations
psql $DATABASE_URL -f db/migrations.sql
```

## Environment Variables for Vercel

Set these in your Vercel project dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `REDIS_URL` | Upstash Redis URL | `redis://default:pass@host:port` |
| `ADMIN_USER` | Admin username | `admin` |
| `ADMIN_PASS` | Admin password | `secure_password_123` |
| `HASH_SALT` | Random salt for hashing | `random_salt_string_here` |
| `EVENT_START` | Event start date | `2025-10-29` |
| `EVENT_END` | Event end date | `2025-11-02` |

## Database Providers

### Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Run the migration script from `db/migrations.sql`
5. Get connection details from Settings > Database

### Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Run migration: `psql $DATABASE_URL -f db/migrations.sql`

## Redis Provider

### Upstash (Recommended)
1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy connection URL

## Testing Deployment

1. **Homepage**: Test form submission
2. **Report Page**: Check KPIs and charts
3. **Admin Page**: Test login and record management
4. **Language Toggle**: Verify VN/EN switching
5. **Mobile**: Test responsive design

## Performance Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Database**: Monitor connection pool usage
- **Redis**: Check cache hit rates
- **API**: Monitor response times

## Security Checklist

- [ ] Environment variables set securely
- [ ] Admin credentials are strong
- [ ] Database has proper access controls
- [ ] Redis is properly secured
- [ ] Rate limiting is working
- [ ] Input validation is active

## Troubleshooting

### Common Issues

1. **Build Errors**: Check Node.js version (18+)
2. **Database Connection**: Verify DATABASE_URL format
3. **Redis Connection**: Check REDIS_URL format
4. **Environment Variables**: Ensure all required vars are set
5. **CORS Issues**: Vercel handles this automatically

### Support

- Check Vercel deployment logs
- Monitor database connections
- Review Redis usage
- Test API endpoints individually

## Post-Deployment

1. **Test all functionality**
2. **Set up monitoring**
3. **Configure backups**
4. **Document admin access**
5. **Train users on the system**

## Maintenance

- Regular database backups
- Monitor Redis usage
- Update dependencies monthly
- Review security settings
- Monitor performance metrics
