# Referral System Database Migration

This script creates the necessary database tables for the referral system.

## Tables Created

1. **referral_targets** - Attorney master list
   - Stores attorney information (name, email, firm, city)
   - Email field has unique constraint

2. **referral_outbox** - Email drafts awaiting send
   - Stores generated email drafts
   - Links to attorneys via foreign key
   - Tracks sent status and creation timestamp

## Running the Migration

### Locally with PostgreSQL
```bash
# Make sure PostgreSQL is running and you have a database created
psql $DATABASE_URL -f scripts/initReferral.sql

# Or if you have connection details:
psql -h localhost -d northpoint -U postgres -f scripts/initReferral.sql
```

### On Railway
1. Go to your Railway project dashboard
2. Click on your PostgreSQL service
3. Go to the "Connect" tab
4. Click "psql" to open a console
5. Copy and paste the SQL content from `initReferral.sql`

### Alternative: Using a Database Client
You can also run this script using any PostgreSQL client like:
- pgAdmin
- DBeaver
- TablePlus
- DataGrip

## Verification

After running the script, verify the tables were created:

```sql
-- Check tables exist
\dt

-- Check table structure
\d referral_targets
\d referral_outbox

-- Verify indexes
\di
```

## Environment Variables

Make sure these are set in your environment:

```env
# In .env file and Railway environment
NEWS_API_KEY=your_actual_newsapi_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=northpoint
DB_USER=postgres
DB_PASSWORD=your_db_password_here
```
