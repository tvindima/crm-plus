# Railway PostgreSQL Setup

## Quick Start

1. **Add PostgreSQL to Railway:**
   - Go to Railway dashboard → Add Service → Database → PostgreSQL
   - Copy `DATABASE_URL` from PostgreSQL service variables

2. **Update environment variable:**
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

3. **Deploy will auto-migrate:**
   - Dockerfile runs seed_postgres.py on startup
   - Creates tables and imports data from CSV

## Local Testing with PostgreSQL

```bash
# Install psycopg2
pip install psycopg2-binary

# Export DATABASE_URL
export DATABASE_URL="postgresql://localhost/crmplus_test"

# Run seed
python backend/seed_postgres.py
```

## Fallback: Keep SQLite for now

If PostgreSQL setup takes too long, we'll:
1. Export SQLite data to JSON
2. Import via API calls on first Railway startup
3. Or use Railway Volume for SQLite persistence
