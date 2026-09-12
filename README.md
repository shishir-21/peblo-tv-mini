# Peblo TV Mini

A full-stack children's content platform built for the Peblo Full Stack Development Challenge.

The project has two React apps:

* **CMS** — for editors and admins to manage content.
* **Viewer** — public app for browsing the published catalogue.

Content is stored in PostgreSQL, validated before publishing, and then published as an immutable catalogue snapshot for the Viewer.

## Live Demo

| Service  | URL                                          |
| -------- | -------------------------------------------- |
| Backend  | https://peblo-tv-mini-fvu7.onrender.com      |
| API Docs | https://peblo-tv-mini-fvu7.onrender.com/docs |
| CMS      | https://peblo-tv-cms.vercel.app              |
| Viewer   | https://viewer-six-kappa.vercel.app          |
| GitHub   | https://github.com/shishir-21/peblo-tv-mini  |

## Test Accounts

**Editor**

* Email: `editor@peblo.tv`
* Password: `peblo@123`

**Admin**

* Email: `mahatoshishir6@gmail.com`
* Password: `Abc@123`

Editor can manage content. Admin can also publish the catalogue.

## Architecture

```text
CMS (React)
    ↓
FastAPI API
    ↓
PostgreSQL + Storage
    ↓
Validation
    ↓
Publish
    ↓
Immutable Catalogue
    ↓
Viewer (React)
```

The Viewer only uses the published catalogue. It does not use CMS/admin APIs.

## Tech Stack

**Backend**

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* Pydantic
* JWT + Argon2
* Pytest + Ruff

**Frontend**

* React
* TypeScript
* Vite
* TanStack Query

**Storage**

* Local filesystem for development
* Cloudinary for production

**DevOps**

* Docker Compose
* GitHub Actions
* Render
* Vercel

## Main Features

### CMS / Backend

* JWT authentication
* Editor/Admin roles
* Shows, seasons and episodes CRUD
* Episode artwork upload
* Artwork validation
* Catalogue validation
* Catalogue publishing
* Publish run history
* Language variants using `content_group`
* Server-side catalogue search

Artwork requirements are enforced by the backend:

* Poster: `600x900`, max `200 KB`
* Banner: `1280x720`, max `200 KB`
* Thumbnail: `640x360`, max `200 KB`

### Viewer

* Home page with featured content
* Shows browsing
* Show details
* Seasons and episodes
* Search
* Category and language filters
* Language selection for grouped episodes
* Responsive UI
* Empty/error states
* Mock watch player

Real video upload, transcoding and streaming are not included because they were outside the scope of this challenge.

## Catalogue Publishing

Only valid published content is included.

```text
Edit Content
     ↓
Validate
     ↓
Build Catalogue
     ↓
Create Publish Run
     ↓
Save Immutable Snapshot
     ↓
Mark Run Completed
     ↓
Viewer
```

Each publish creates:

```text
catalogues/catalogue-{publish_run_id}.json
```

The Viewer uses the latest **completed** publish run.

This means if publishing fails halfway, the previous catalogue stays available. A partially written catalogue is never used by the Viewer.

## Search

Search is done against the published catalogue through:

```text
GET /api/v1/catalogue/search
```

It supports:

* `q`
* `category`
* `language`
* `section`

Filters work together using AND logic.

For this challenge, the catalogue is small enough for this approach. If the catalogue becomes much larger, I would move search to PostgreSQL Full-Text Search or a dedicated search service such as OpenSearch.

## Storage

The application uses a storage abstraction:

```text
Storage
├── LocalStorage
└── CloudinaryStorage
```

The business logic does not depend directly on Cloudinary.

To move to Cloudflare R2, I would add an `R2Storage` implementation and update the storage configuration. The artwork and publishing logic would stay the same.

## Why a Published Catalogue?

The Viewer is mostly read-heavy, while content changes less often.

A published catalogue:

* reduces database queries
* keeps the Viewer separate from CMS internals
* gives the Viewer a stable data format
* ensures only published content is visible

The main trade-off is freshness: CMS changes are visible only after a successful publish.

## Validation and Roles

Validation is done on the backend, not only in the frontend.

Examples:

* Published episodes need duration and artwork.
* `(content_group, language)` must be unique.
* Published shows need a valid section.
* Artwork dimensions and file size are checked.
* Season `0` is reserved for trailers.

Roles are enforced by the backend:

```text
Editor
 └── Content CRUD

Admin
 ├── Content CRUD
 └── Catalogue Publishing
```

## Local Setup

### Docker

From the project root:

```bash
docker compose up --build
```

Apps:

```text
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs
CMS: http://localhost:5173
Viewer: http://localhost:5174
```

### Environment

Copy `.env.example` and configure the required values.

Secrets such as database credentials, JWT keys and storage credentials should be stored in the hosting provider's secret/environment-variable system and not committed to Git.

## Testing

Backend:

```bash
cd backend
pytest tests
ruff check .
```

CMS:

```bash
cd cms
npm run lint
npm run test
npm run build
```

Viewer:

```bash
cd viewer
npm run build
```

GitHub Actions also runs the main lint, test and build checks.

## CI / Deployment

GitHub Actions checks the project on pushes and pull requests.

The pipeline covers:

* Backend lint and tests
* CMS checks/build
* Viewer build
* Docker image builds

Deployment:

```text
GitHub
 ├── Render → Backend
 ├── Vercel → CMS
 └── Vercel → Viewer
```

## Health / Operability

The backend provides:

```text
GET /health
```

A useful production alert would be repeated backend health-check failures because the backend is required by both the CMS and public catalogue delivery.

Repeated failed publish runs would also be useful to monitor.

## What I Left Out

I focused on the core requirements and skipped some optional features:

* **Catalogue rollback UI** — immutable publish snapshots already provide the base for rollback.
* **Publish dry-run/diff** — skipped to focus on validation and safe publishing.
* **Full CRUD audit log** — publish runs record who published, but field-level change history is not included.
* **Real video streaming** — outside the challenge scope.

## AI Usage

I used AI as a development assistant for brainstorming, debugging, code review and documentation.

I reviewed the generated suggestions myself and changed or rejected them when they did not match the assignment or the project structure.

One example was catalogue publishing. I changed the implementation to use immutable publish-run snapshots instead of overwriting a shared catalogue file.

## Time Spent

Approximate total: **50–55 hours**, including development, debugging, testing, deployment and documentation.

## Repository

GitHub: https://github.com/shishir-21/peblo-tv-mini

The main goal was to keep the system simple but safe, with backend validation, proper role checks, immutable publishing, separated CMS/Viewer applications and a working local/production setup.
