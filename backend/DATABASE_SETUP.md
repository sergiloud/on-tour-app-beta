# 🗄️ Backend Database Setup Guide

**Status**: Dependencies installed ✅ | Database: NEEDS LOCAL SETUP

---

## Prerequisites

Make sure you have:

1. **Node.js 20 LTS** - ✅ Already using
2. **PostgreSQL 15+** - ⏳ Needs to be running locally
3. **npm** - ✅ Already available

---

## Step 1: Install PostgreSQL

### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
# Expected: psql (PostgreSQL) 15.x
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install postgresql postgresql-contrib

sudo systemctl start postgresql
```

### Windows

Download and install from: https://www.postgresql.org/download/windows/

---

## Step 2: Create Database

Once PostgreSQL is running:

```bash
# Connect to PostgreSQL
psql postgres

# In the psql prompt, create database:
CREATE DATABASE on_tour_db;

# Create development user (optional)
CREATE USER on_tour WITH PASSWORD 'dev-password';
GRANT ALL PRIVILEGES ON DATABASE on_tour_db TO on_tour;

# Exit psql
\q
```

Or via command line:

```bash
createdb on_tour_db
```

---

## Step 3: Verify Connection

Test that the database is accessible:

```bash
# From the backend directory
cd backend

# Try connecting with node
node -e "const pg = require('pg'); const client = new pg.Client(process.env.DATABASE_URL); client.connect().then(() => { console.log('✓ Connected to database'); process.exit(0); }).catch(e => { console.error('✗ Connection failed:', e.message); process.exit(1); });"
```

---

## Step 4: Run Migrations

Once database exists:

```bash
cd backend

# Create migration runner (next step)
npm run db:migrate
```

---

## Current Status

✅ Backend dependencies installed (562 packages)
✅ TypeScript compilation working
✅ .env file created with defaults
❌ PostgreSQL database - NEEDS LOCAL SETUP

---

## Next Actions

1. **Install PostgreSQL** locally (see instructions above)
2. **Create database**: `createdb on_tour_db`
3. **Run migrations**: `npm run db:migrate`
4. **Start backend**: `npm run dev`

---

## Troubleshooting

### "createdb: command not found"

PostgreSQL is not in your PATH. Install it first:

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Then add to PATH
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "Connection refused on port 5432"

PostgreSQL is not running. Start it:

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### "database on_tour_db already exists"

The database already exists. Either:

- Delete it: `dropdb on_tour_db`
- Use existing: Just proceed with migrations

---

**Next**: Install PostgreSQL and create database, then we'll proceed with migrations and authentication setup.
