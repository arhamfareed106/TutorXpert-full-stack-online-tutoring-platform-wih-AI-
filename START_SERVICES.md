# TutorXpert - Start All Services Guide

## Quick Start Options

### Option 1: Install Databases (Recommended for Full Functionality)

You need to install these databases to run the backend:

#### 1. PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Or use PostgreSQL via Docker: `docker run --name postgres -e POSTGRES_PASSWORD=12345678 -p 5432:5432 -d postgres`
- After installation, create database:
  ```bash
  psql -U postgres -c "CREATE DATABASE tutorxpert;"
  ```

#### 2. MongoDB
- Download MongoDB Community Server: https://www.mongodb.com/try/download/community
- Or use Docker: `docker run --name mongodb -p 27017:27017 -d mongo`
- Create database (automatic on first use)

#### 3. Redis
- Download Redis for Windows: https://github.com/microsoftarchive/redis/releases
- Or use Docker: `docker run --name redis -p 6379:6379 -d redis`
- Test connection: `redis-cli ping` (should return PONG)

#### 4. Run Setup Script
```bash
cd backend
.\setup-databases.bat
```

#### 5. Start Backend
```bash
cd backend
npm run dev
```

---

### Option 2: Use SQLite Only (Simplified - Coming Soon)

We can modify the backend to use SQLite instead of PostgreSQL/MongoDB/Redis for development. This would require code changes.

---

### Option 3: Mock Mode (Frontend Demo Only)

The frontend is currently running and can be used for UI demonstration without backend connectivity. API calls will fail, but you can see the design.

---

## Current Status

| Service | Status | Port | URL |
|---------|--------|------|-----|
| Frontend | ✅ Running | 5175 | http://localhost:5175 |
| AI Service | ✅ Running | 8000 | http://localhost:8000 |
| Backend | ⚠️ Needs DBs | 5000 | http://localhost:5000 |

---

## Testing AI Service

The AI service is running! You can test it:

```bash
# Health check
curl http://localhost:8000/health

# Get tutor recommendations
curl -X POST http://localhost:8000/api/v1/match/recommend ^
  -H "Content-Type: application/json" ^
  -d "{\"learnerId\": \"learner-1\", \"limit\": 5}"
```

---

## Database Installation Commands (PowerShell)

If you want to install databases using winget:

```powershell
# PostgreSQL
winget install -e --id PostgreSQL.PostgreSQL16

# MongoDB
winget install -e --id MongoDB.Server

# Redis
winget install -e --id Microsoft.OpenSSH.Beta  # Then install Redis manually
```

Or use Docker Desktop (easiest):
```powershell
docker run --name postgres-tutorxpert -e POSTGRES_PASSWORD=12345678 -p 5432:5432 -d postgres:latest
docker run --name mongodb-tutorxpert -p 27017:27017 -d mongo:latest
docker run --name redis-tutorxpert -p 6379:6379 -d redis:latest
```

After databases are running, execute:
```bash
cd backend
node src\db\migrate.js
node src\db\seed.js
npm run dev
```
