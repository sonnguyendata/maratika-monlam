# Túc Số Monlam

A bilingual web application for recording and reporting túc số counts for the Monlam Dharma Festival 2025 at Ha Noi (October 29 - November 2, 2025).

## Features

- **Bilingual Support**: Vietnamese (default) and English with language toggle
- **No Login Required**: Simple form submission with ID and name
- **Real-time Reports**: Public dashboard with KPIs, charts, and leaderboard
- **Admin Dashboard**: Full administrative interface with filtering and export
- **Performance Optimized**: Redis rate limiting and queue system for high concurrency
- **Security**: IP/UA hashing, idempotency keys, anomaly detection
- **Sacred Buddhist Theme**: Monastic red, golden colors, lotus animations

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase/Neon)
- **Cache/Queue**: Redis (Upstash)
- **Charts**: Recharts
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis instance (Upstash recommended)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/sonnguyendata/maratika-monlam.git
   cd maratika-monlam
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.production .env.local
   ```
   
   Fill in your environment variables:
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

3. **Set up the database**:
   ```bash
   # Run the migration script
   psql $DATABASE_URL -f db/migrations.sql
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Using Supabase

1. Create a new Supabase project
2. Run the migration script in the SQL editor:
   ```sql
   -- Copy and paste the contents of db/migrations.sql
   ```
3. Update your environment variables with Supabase credentials

### Using Neon/PostgreSQL

1. Create a new Neon database
2. Run the migration:
   ```bash
   psql $DATABASE_URL -f db/migrations.sql
   ```

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## API Endpoints

### Public Endpoints

- `POST /api/submit` - Submit túc số count
- `GET /api/report/summary` - Get public report data

### Admin Endpoints (Basic Auth Required)

- `GET /api/admin/records` - Get filtered records with pagination
- `PATCH /api/admin/records` - Update record flags
- `GET /api/admin/export` - Export records as CSV

## Usage

### For Participants

1. Visit the homepage
2. Enter your ID and name (saved for future visits)
3. Enter túc số quantity
4. Add optional note
5. Submit

### For Administrators

1. Visit `/admin`
2. Login with admin credentials
3. Use filters to find specific records
4. Flag suspicious submissions
5. Export data as CSV

### For Public Reports

1. Visit `/report`
2. View real-time KPIs and charts
3. See top 10 contributors leaderboard
4. Data auto-refreshes every 15 seconds

## Performance & Scalability

- **Rate Limiting**: 50 requests/minute per IP
- **Burst Protection**: Max 10 submissions per 5 minutes per user
- **Redis Queue**: Handles traffic spikes
- **Database Indexing**: Optimized for common queries
- **Caching**: Report data cached for 15 seconds

## Security Features

- **IP/UA Hashing**: Privacy protection with salted hashes
- **Idempotency Keys**: Prevents duplicate submissions
- **Anomaly Detection**: Flags suspicious patterns
- **Basic Auth**: Admin interface protection
- **Input Validation**: Zod schema validation

## Monitoring & Alerts

The system automatically flags:
- **BurstByID**: Too many submissions in short time
- **SpikeByQty**: Extremely large quantities
- **DupKey**: Duplicate idempotency keys
- **MultiAccountSameIP**: Multiple IDs from same IP/UA

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check DATABASE_URL format
   - Verify database is accessible
   - Run migrations

2. **Redis Connection Error**:
   - Check REDIS_URL format
   - Verify Redis instance is running
   - Check network connectivity

3. **Build Errors**:
   - Ensure all environment variables are set
   - Check Node.js version (18+)
   - Clear node_modules and reinstall

### Performance Issues

1. **Slow Queries**:
   - Check database indexes
   - Monitor query performance
   - Consider connection pooling

2. **High Memory Usage**:
   - Monitor Redis memory usage
   - Check for memory leaks
   - Optimize data structures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
