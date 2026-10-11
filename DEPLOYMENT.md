# GymSoft Backend Deployment Guide

## Local Development

```bash
cd backend
# Create .env from example
cp .env.example .env
# Edit .env if needed (defaults work for local SQLite)

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Render Deployment

### 1. Create Web Service
- Connect your GitHub repo
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Plan: Free

### 2. Environment Variables (Required)
| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | `openssl rand -hex 32` | **Must set in production** |
| `DATABASE_URL` | `sqlite:////opt/render/project/src/backend/data/gymsoft.db` | Auto-configured via render.yaml |
| `ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` | Your frontend URL |
| `ENVIRONMENT` | `production` | Auto-set by render.yaml |
| `DEBUG` | `False` | Auto-set by render.yaml |

### 3. Persistent Disk
- Name: `gymsoft-data`
- Mount Path: `/opt/render/project/src/backend/data`
- Size: 1 GB (free tier)

### 4. Deploy
- Push to main branch
- Render auto-deploys via render.yaml

## Database Migration (SQLite → PostgreSQL)

For production PostgreSQL (recommended):
1. Add PostgreSQL database in Render
2. Update `DATABASE_URL` to: `postgresql://user:pass@host:port/dbname`
3. Run migrations: `alembic upgrade head` (if using Alembic)

## Health Check
- Endpoint: `GET /health`
- Expected: `{"status": "healthy", "service": "gymsoft-api"}`

## API Docs
- Swagger: `/docs`
- ReDoc: `/redoc`

## Key Features
- ✅ Tiered plans (2K/3K/4K)
- ✅ BMI Calculator (3K+)
- ✅ Weight Progression (4K)
- ✅ Revenue Analytics (4K)
- ✅ Poster Upload/Download
- ✅ JWT Authentication
- ✅ Role-based Access Control