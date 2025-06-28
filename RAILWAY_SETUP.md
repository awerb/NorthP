# Railway Deployment Configuration

## PostgreSQL Database Setup

### Step 1: Add PostgreSQL Service
1. In your Railway project dashboard
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database automatically

### Step 2: Configure Environment Variables

In Railway → Project → Settings → Shared Variables, add the following environment variable:

```
Name: DATABASE_URL
Value: ${{ Postgres.DATABASE_URL }}
```

This automatically connects your application to the Railway PostgreSQL database using Railway's built-in service reference.

### Step 3: Other Required Environment Variables

Add these additional environment variables in Railway:

```
OPENAI_API_KEY=your_openai_api_key_here

ANTHROPIC_API_KEY=your_anthropic_api_key_here

EVENT_REGISTRY_API_KEY=1dcb40d1-0c90-46f8-baca-a65564e59151

NEWS_API_KEY=1dcb40d1-0c90-46f8-baca-a65564e59151

NODE_ENV=production
```

### Step 4: Initialize Database Schema

After deployment, initialize the database with the required tables:

**Option A: Using Railway CLI**
```bash
railway login
railway link [your-project-id]
railway run psql $DATABASE_URL < schema.sql
```

**Option B: Using Direct Connection**
1. Get the DATABASE_URL from Railway dashboard (Variables tab)
2. Run locally:
```bash
psql "postgresql://postgres:PASSWORD@HOST:PORT/railway" < schema.sql
```

**Option C: Using Railway Console**
1. Go to your PostgreSQL service in Railway dashboard
2. Click "Query" tab
3. Copy and paste the contents of `schema.sql`
4. Execute the queries

### Database Connection Details

The application automatically detects and uses the `DATABASE_URL` environment variable when running in production. This provides:

- ✅ Automatic SSL configuration for production
- ✅ Connection pooling optimized for Railway
- ✅ Fallback to individual environment variables for local development
- ✅ Graceful handling of connection failures (demo mode)

### Verification

After setup, your API endpoints should work with persistent data storage:
- `/ai/rank` - AI ranking results stored in database
- `/referral/*` - Referral contacts and drafts persisted
- `/keywords/*` - Keyword monitoring data saved
- `/news/*` - News article tracking stored

The application will log "PostgreSQL connection successful" instead of "demo mode" when properly connected.

## Troubleshooting

**Connection Issues:**
- Verify DATABASE_URL is set correctly: `${{ Postgres.DATABASE_URL }}`
- Ensure PostgreSQL service is running in Railway
- Check Railway logs for connection errors

**Schema Issues:**
- Confirm schema.sql was executed successfully
- Check PostgreSQL logs in Railway dashboard
- Verify all required tables exist

**Performance:**
- Railway PostgreSQL includes connection pooling
- Database queries are optimized with proper indexes
- Application handles connection failures gracefully
