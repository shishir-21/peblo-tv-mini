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

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements-dev.txt
alembic upgrade head
python -m app.seed
python -m app.scripts.create_admin admin@example.com changeme123
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Environment variables

Copy `.env.example` to `.env` and adjust values as needed.

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
- **Storage:** Local filesystem (dev), Cloudflare R2 (production)

## Development Status

See git log for feature history. Backend foundation (models, auth, artwork, publishing) is in place. CMS CRUD APIs, frontend, and comprehensive tests are in progress.
