# Peblo TV Mini

Peblo TV Mini is a full-stack children's content platform built for the Peblo Full Stack Development Challenge.

The project provides two main applications:

- **CMS** — an authenticated content management system for editors and admins.
- **Viewer** — a public-facing React application for browsing the published catalogue.

Content is created and managed in the CMS, stored in PostgreSQL, validated before publishing, and exposed to the public Viewer through a published catalogue snapshot.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Production](#production)
- [Test Credentials](#test-credentials)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Catalogue Publishing Flow](#catalogue-publishing-flow)
- [Engineering Decisions](#engineering-decisions)
- [Pipeline and CI](#pipeline-and-ci)
- [Health and Operability](#health-and-operability)
- [Testing](#testing)
- [Security](#security)
- [What Was Left Out](#what-was-left-out)
- [AI Usage](#ai-usage)
- [Development Status](#development-status)
- [Time Spent](#time-spent)


# Project Overview

Peblo TV Mini is a full-stack children's content platform consisting of a CMS, backend API, storage layer, publishing pipeline, and public Viewer.

The platform is designed around a simple separation between **content management** and **public content consumption**.

### CMS

The CMS allows authenticated users to:

- Create and manage shows.
- Manage seasons.
- Manage episodes.
- Upload episode artwork.
- Validate catalogue content.
- Publish the catalogue.

The application supports two roles:

```text
Editor
  └── Content CRUD

Admin
  ├── Content CRUD
  └── Catalogue Publishing
Public Viewer
```
The Viewer is a read-only public application that consumes the published catalogue.

Users can:

Browse shows.
Search the catalogue.
Open show details.
Browse seasons and episodes.
Open an episode/watch page.
Select an available audio language.
Fall back safely when an unavailable language is selected.
Catalogue Publishing

Content edited in the CMS is not immediately exposed to the public Viewer.

The publishing flow creates a catalogue snapshot containing published content. The Viewer consumes this published catalogue rather than querying CMS/admin endpoints directly.

This creates a clear boundary between:

Content Editing
      ↓
Validation
      ↓
Publishing
      ↓
Published Catalogue
      ↓
Public Viewer
Production
Live Applications
Service	URL
Backend	https://peblo-tv-mini-fvu7.onrender.com
API Documentation	https://peblo-tv-mini-fvu7.onrender.com/docs
CMS	https://peblo-tv-cms.vercel.app
Viewer	https://viewer-six-kappa.vercel.app
GitHub Repository	https://github.com/shishir-21/peblo-tv-mini
Test Credentials

The following accounts are provided for testing the deployed CMS and authentication flow.

Editor Account
Email: editor@peblo.tv
Password: peblo@123

Editor permissions include content management operations.

Admin Account
Email: mahatoshishir6@gmail.com
Password: Abc@123

Admin permissions include content management and catalogue publishing.
```text
Architecture
                         ┌───────────────────────┐
                         │       CMS (React)     │
                         │                       │
                         │  Editor / Admin UI    │
                         └───────────┬───────────┘
                                     │
                                     │ HTTP / JWT
                                     ▼
                         ┌───────────────────────┐
                         │    FastAPI Backend    │
                         │                       │
                         │ Auth / CRUD /         │
                         │ Validation / Publish  │
                         └───────────┬───────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                 ┌─────────────────┐   ┌─────────────────┐
                 │   PostgreSQL    │   │    Storage      │
                 │                 │   │                 │
                 │ Shows           │   │ Local filesystem│
                 │ Seasons         │   │ Development     │
                 │ Episodes        │   │                 │
                 │ Artwork         │   │ Cloudinary      │
                 │ Publish Runs    │   │ Production      │
                 └─────────────────┘   └────────┬────────┘
                                                │
                                                ▼
                                      Published Catalogue
                                      Immutable Snapshot
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │  Viewer (React)  │
                                      │                  │
                                      │ Public read-only │
                                      │ catalogue UI     │
                                      └──────────────────┘

The Viewer does not depend on the CMS UI or administrative APIs. It consumes the published catalogue.
```
Tech Stack
Backend
Python
FastAPI
SQLAlchemy
PostgreSQL
Alembic
Pydantic
JWT authentication
Argon2 password hashing
Pytest
Ruff
CMS
React
TypeScript
Vite
Viewer
React
TypeScript
Vite
Storage

Development:

Local filesystem

Production:
```text
Cloudinary
CI
GitHub Actions
Ruff
Pytest
npm build
Docker build
Deployment
Backend: Render
CMS: Vercel
Viewer: Vercel
Production database: PostgreSQL
Production media/catalogue storage: Cloudinary
Project Structure
peblo-tv-mini/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── storage/
│   │   └── seed.py
│   │
│   └── tests/
│
├── cms/
│   └── src/
│
├── viewer/
│   └── src/
│
├── seed_data/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .dockerignore
├── .env.example
└── README.md
Features
CMS / Backend
Authentication
User registration/login.
JWT bearer authentication.
Current-user endpoint.
Password hashing using Argon2.
Role-based access control.
Roles
```
The application supports:

Editor
- Manage content
- Create/update/delete content
- Upload artwork

Admin
- All Editor capabilities
- Publish catalogue
Content Management
Shows.
Seasons.
Episodes.
Episode metadata.
Episode artwork.
Published/unpublished states.
Content grouping for episode variants/languages.
Artwork

Episode artwork is uploaded through the backend storage abstraction.

The implementation supports the required artwork variants and validates uploaded artwork before accepting it.

Catalogue
Catalogue validation.
Catalogue generation.
Catalogue publishing.
Publish run tracking.
Published catalogue snapshots.
Cloudinary storage.
Seed Data

The repository contains seed data for local and production setup.

Seed data includes shows, seasons, episodes, categories, and required episode artwork.

Viewer

The Viewer is a public-facing React application that consumes the published catalogue.

Implemented Pages
Home

Displays the available catalogue content.

Shows

Dedicated shows listing page.

Route:

/shows
Show Details

Displays information about a selected show, including its seasons and episodes.

Route:

/shows/:slug
Watch

Displays the selected episode and its available language options.

Route:

/watch/:id

The current Watch page uses a mock video player. Real video upload, transcoding, streaming, and playback infrastructure were outside the implemented scope.

Search

Provides catalogue search functionality.

Route:

/search
Viewer Features
Home page.
Shows listing page.
Show detail pages.
Episode/watch page.
Search page.
Published catalogue consumption.
Responsive show-card grid.
Audio language selector for episodes with multiple languages.
Safe fallback when an unavailable language is selected.
Empty/search result handling.
Client-side routing.
SPA refresh support.
Local Development

There are two supported development approaches.

Option 1 — Docker Compose

From the repository root:

docker-compose up --build

The Docker Compose development stack contains:

PostgreSQL
    ↓
FastAPI Backend
    ↓
CMS + Viewer

The backend can use local filesystem storage for development.

Local URLs

Backend:

http://localhost:8000

API documentation:

http://localhost:8000/docs

CMS:

http://localhost:5173

Viewer:

http://localhost:5174
Manual Development
Backend

Create a virtual environment:

cd backend
python -m venv .venv

Activate the environment and install dependencies:

pip install -r requirements.txt
pip install -r requirements-dev.txt

Run the API:

uvicorn app.main:app --reload --port 8000

Backend:

http://localhost:8000

API docs:

http://localhost:8000/docs
CMS

From the repository root:

cd cms
npm install
npm run dev

CMS:

http://localhost:5173
Viewer

From the repository root:

cd viewer
npm install
npm run dev

Viewer:

http://localhost:5174
Environment Variables

The repository includes .env.example files covering the application configuration.

Typical backend configuration includes:

DATABASE_URL=
SECRET_KEY=
CORS_ORIGINS=
STORAGE_BACKEND=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Frontend Vite environment variables are used where required for application configuration.

Production Secret Management

Secrets should never be committed to source control.

In production, sensitive values such as:

Database credentials.
JWT signing keys.
Cloudinary credentials.
API keys.

should be stored using the hosting provider's encrypted environment-variable/secret management system.

The application reads these values from environment variables rather than hardcoding them into source code.

Catalogue Publishing Flow

The catalogue publishing flow separates content editing from public availability.

Editor/Admin
     │
     ▼
Create / Update Content
     │
     ▼
Backend PostgreSQL
     │
     ▼
Catalogue Validation
     │
     ▼
Build Catalogue
     │
     ▼
Create Publish Run
     │
     ▼
Persist Immutable Catalogue
     │
     ▼
Mark Publish Run Completed
     │
     ▼
Public Viewer

Only published content is included in the public catalogue.

The Viewer therefore does not need access to the CMS database or administrative endpoints.

Engineering Decisions
Atomic / Safe Publishing

Publishing is designed so that the Viewer does not read a catalogue while it is being actively generated.

The backend builds the catalogue from the published database state and validates the resulting catalogue before publication.

Each publish run creates an immutable catalogue associated with that run:

catalogues/catalogue-{publish_run_id}.json

The publish run is marked as completed only after the catalogue has been successfully persisted.

The public catalogue endpoint resolves the latest completed publish run and points the Viewer to that immutable catalogue.

This avoids exposing a partially written catalogue.

Failure During Publishing

If the process dies before a new publish run is completed:
```text
Previous completed catalogue
          │
          │ remains available
          ▼
       Viewer
```
The failed operation does not replace the previous completed catalogue with a partially generated file.

A failed publish run can be recorded as failed, while the last successfully completed catalogue remains the public version.

This also makes each successful publish independently addressable.

Storage Abstraction

Storage operations are separated from business logic through a storage abstraction.

The current storage implementations are:
```text
Storage
├── LocalStorage
└── CloudinaryStorage
```
Development uses the local filesystem.

Production uses Cloudinary.

Business logic interacts with the storage abstraction instead of depending directly on a storage provider.

Moving to Cloudflare R2

To move the application from Cloudinary to Cloudflare R2, I would:

Implement an R2Storage adapter using an S3-compatible client.
Add R2 bucket, endpoint, access-key, and secret configuration.
Select the R2 implementation through configuration.

The catalogue publishing and artwork business logic would not need to change.

This keeps infrastructure-specific code isolated from application logic.

Search

Viewer search currently operates against the published catalogue.

For the challenge-sized catalogue, this is intentionally implemented simply because:

The catalogue is relatively small.
The Viewer is read-heavy.
Search can be performed without an additional API request for every query.
The public Viewer remains independent from the CMS/database.

The trade-off is that the browser needs the catalogue data and search cost grows with catalogue size.

For a substantially larger catalogue, I would move search to a backend/indexing layer.

Possible next steps would be:

PostgreSQL Full-Text Search
        or
Dedicated Search Index
        │
        ▼
OpenSearch / similar system

For moderate scale, PostgreSQL full-text search would likely be sufficient. For a much larger catalogue or more advanced relevance/filtering requirements, a dedicated search index would be more appropriate.

Why Use a Published Catalogue?

The Viewer is a read-heavy application, while content changes relatively infrequently.

Instead of querying the database and running CMS-specific joins and business logic for every public request, the publishing process creates a read-optimized catalogue snapshot.

Benefits
Reduces public database traffic.
Keeps the Viewer independent from CMS internals.
Creates a stable public data contract.
Ensures only published content is publicly visible.
Separates editing from public availability.
Makes the public Viewer simpler to operate.
Trade-offs

The main trade-off is freshness.

Changes made in the CMS are not visible to the public Viewer until the next successful publish.

The catalogue can also become large as content grows.

At larger scale, I would consider:

CDN caching.
Compression.
Catalogue partitioning.
Pagination.
Backend search.
Dedicated indexing.
Catalogue Validation

Catalogue validation is performed on the backend before publication.

This is important because frontend validation alone cannot guarantee correctness. The backend remains the source of truth and should prevent invalid content from being published even if a request bypasses the CMS UI.

Validation therefore acts as a safety boundary before public availability.

Roles and Authorization

Authentication uses JWT bearer tokens.

Passwords are securely hashed using Argon2.

Authorization separates content editing from catalogue publishing:

Editor
  └── Content CRUD

Admin
  ├── Content CRUD
  └── Catalogue Publishing

Publishing is therefore treated as a privileged operation rather than simply another content mutation.

The Viewer does not use administrative endpoints.

Pipeline and CI

GitHub Actions runs for pushes and pull requests targeting main.

The CI workflow currently performs:

Backend
├── Ruff lint
└── Pytest

Viewer
└── npm build

CMS
└── npm build

Docker
└── Docker image build

This provides automated checks for backend correctness, frontend compilation, and container buildability.

Deployment
```text
The application is deployed as separate services:

                 GitHub
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
    Render       Vercel       Vercel
       │            │            │
       ▼            ▼            ▼
    Backend        CMS        Viewer

The backend runs on Render.
```
The CMS and Viewer are deployed independently on Vercel.

The production Viewer consumes the published catalogue through the backend catalogue delivery flow.

Health and Operability

The backend exposes a lightweight health endpoint:

GET /health

Expected response:

{
  "status": "ok"
}
Alerting

One important production alert would be:

Alert when the backend health endpoint fails repeatedly or becomes unavailable.

The backend is a dependency for the CMS and for the public catalogue delivery flow. A sustained backend outage therefore affects both content management and public catalogue access.

A second useful operational signal would be repeated failed publish runs because the backend may remain healthy while newly approved content is unable to reach the public Viewer.

Testing
Backend

Run:

cd backend
python -m pytest tests
Backend Lint
ruff check backend --select F
Viewer Build
cd viewer
npm run build
CMS Build
cd cms
npm run build

These checks are also executed through GitHub Actions.

Security

The project includes:

JWT-based authentication.
Argon2 password hashing.
Role-based authorization.
Backend-side validation.
Environment-based secrets.
CORS configuration.
Separation between public Viewer access and administrative CMS endpoints.

Production secrets are kept outside the repository and supplied through environment variables.

What Was Left Out

The implementation prioritizes the core assignment requirements and intentionally leaves some optional/production features out.

Catalogue Rollback

Skipped as a dedicated admin UI.

The publishing system already creates immutable publish-run catalogue snapshots, which provides the foundation for rollback without adding another management workflow.

Publish Dry Run / Diff

Skipped due to time.

Catalogue validation was prioritized because it directly prevents unsafe publication.

A future dry-run feature could compare the current draft state with the latest published snapshot before committing a publish.

Full Audit Log

A full field-level CRUD audit system was outside the initial scope.

Publish runs record publication activity and the user who triggered publishing, but detailed history for every individual field change was not implemented.

Real Video Streaming

The Watch page currently uses a mock video player.

Real video upload, transcoding, streaming, adaptive bitrate delivery, and video CDN infrastructure were outside the implemented scope.

Movies

The Shows browsing flow is implemented.

Additional Viewer functionality such as Movies is still being developed.

AI Usage

AI tools were used during development as an engineering assistant for:

Brainstorming implementation approaches.
Debugging.
Reviewing architecture ideas.
Understanding unfamiliar technologies.
Identifying edge cases.
Improving documentation.
Reviewing implementation decisions.

AI-generated suggestions were manually reviewed rather than accepted blindly.

When generated suggestions conflicted with the assignment requirements or the existing repository architecture, they were modified or rejected.

A practical example was catalogue delivery and caching. A mutable Cloudinary catalogue.json URL could continue serving stale CDN content after updates. Instead of relying only on cache invalidation, the implementation was changed to use immutable publish-run catalogue snapshots and a backend endpoint that resolves the latest completed publish.

This was tested against the deployed application rather than being accepted based only on generated code or assumptions.

Development Status
Implemented
Backend foundation.
PostgreSQL data model.
Database migrations.
Authentication.
JWT authorization.
Argon2 password hashing.
Editor/Admin roles.
Show CRUD.
Season CRUD.
Episode CRUD.
Artwork upload.
Storage abstraction.
Cloudinary production storage.
Local development storage.
Catalogue validation.
Catalogue publishing.
Publish run tracking.
Seed data.
CMS.
Public Viewer.
Home page.
Shows browsing flow.
Show detail pages.
Episode/watch flow.
Search.
Language selection.
Responsive Viewer UI.
GitHub Actions CI.
Docker build.
Production deployment.
Still Being Developed
Additional Viewer sections such as Movies.
Real video playback and streaming infrastructure.
Repository

GitHub:

https://github.com/shishir-21/peblo-tv-mini

Production Viewer:

https://viewer-six-kappa.vercel.app

Production CMS:

https://peblo-tv-cms.vercel.app

Backend API:

https://peblo-tv-mini-fvu7.onrender.com

API Documentation:

https://peblo-tv-mini-fvu7.onrender.com/docs

Time Spent

Approximate development breakdown:

Area	Approx. Time
Backend foundation and data model	4–5 hrs
Authentication and authorization	2–3 hrs
CMS	4–5 hrs
Artwork and storage	2–3 hrs
Catalogue validation and publishing	4–5 hrs
Viewer and Shows flow	4–5 hrs
Search and language selection	2–3 hrs
Docker, CI and deployment	3–4 hrs
Debugging and production verification	3–4 hrs
Documentation	1–2 hrs
Total	30–40 hrs

The total includes implementation, debugging, testing, deployment, and production verification.

Assignment Notes

This project was built as part of the Peblo Full Stack Development Challenge.

The implementation prioritizes:

Safe publishing.
Clear separation between CMS and public Viewer.
Backend-enforced validation and authorization.
Storage abstraction.
Operationally understandable deployment.
Automated CI.
Honest trade-offs around scope and scalability.

The goal was not only to implement features, but to make deliberate engineering decisions appropriate for the size and requirements of the assignment.
