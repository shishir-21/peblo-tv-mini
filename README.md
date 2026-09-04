# Peblo TV Mini

Full-stack take-home challenge for Peblo — a CMS for children's content with catalogue publishing and a public viewer.

## Architecture

```
CMS (React) → FastAPI → PostgreSQL
                ↓
           Object Storage
                ↓
          catalogue.json
                ↓
         Viewer (React)
```

## Prerequisites

- Python 3.11+
- Docker (for PostgreSQL)
- Node.js 20+ (for frontend, when added)

## Quick Start

### 1. Local Development (Dockerized)

The easiest way to run the entire stack locally is using Docker Compose.

```bash
# Start DB, Backend, CMS, and Viewer
docker compose up -d --build
```

- **Backend API:** `http://localhost:8000`
- **CMS Frontend:** `http://localhost:5173`
- **Viewer Frontend:** `http://localhost:5174`

To seed the database with an admin user (`admin@example.com` / `changeme123`) and sample data:
```bash
# Wait for the backend container to start, then run:
docker compose exec backend python -m app.scripts.create_admin admin@example.com changeme123
docker compose exec backend python -m app.seed
```

### 2. Manual Development (Without Docker for Apps)

If you prefer to run services manually for faster hot-reloading:

```bash
# Start PostgreSQL only
docker compose up -d db

# Terminal 1: Backend
cd backend
python -m venv .venv
# activate venv (.venv/Scripts/activate or source .venv/bin/activate)
pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
python -m app.seed
python -m app.scripts.create_admin admin@example.com changeme123
uvicorn app.main:app --reload --port 8000

# Terminal 2: CMS
cd cms
npm install
npm run dev

# Terminal 3: Viewer
cd viewer
npm install
npm run dev
```

API docs: http://localhost:8000/docs

### 3. Environment variables

Copy `.env.example` to `.env` and adjust values as needed.

For the production API on Render, set `CORS_ORIGINS` to a comma-separated list
that includes the deployed CMS origin, for example
`https://peblo-tv-cms.vercel.app`. Redeploy the Render service after changing
the variable so browser preflight requests receive the CORS headers.

## Current API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/v1/auth/register` | — | Register editor |
| POST | `/api/v1/auth/login` | — | Login |
| GET | `/api/v1/auth/me` | Bearer | Current user |
| POST | `/api/v1/episodes/{id}/artwork` | Editor+ | Upload artwork |
| POST | `/api/v1/publish` | Admin | Publish catalogue |

## Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT, Argon2
- **Frontend:** React, TypeScript, Vite (planned)
- **Storage:** Local filesystem (dev), Cloudinary (production)

## Development Status

See git log for feature history. Backend foundation (models, auth, artwork, publishing) is in place. CMS CRUD APIs, frontend, and comprehensive tests are in progress.
