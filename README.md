# Peblo TV Mini

Peblo TV Mini is a full-stack children's content platform with an internal CMS and a public Viewer.

**Flow:**

```text
CMS (React)
    ↓
FastAPI + PostgreSQL
    ↓
Validation + Publish
    ↓
Immutable Catalogue Snapshot
    ↓
Viewer (React)
```

## Live Demo

| Service  | URL                                          |
| -------- | -------------------------------------------- |
| Backend  | https://peblo-tv-mini-fvu7.onrender.com      |
| API Docs | https://peblo-tv-mini-fvu7.onrender.com/docs |
| CMS      | https://peblo-tv-cms.vercel.app              |
| Viewer   | https://viewer-six-kappa.vercel.app          |
| GitHub   | https://github.com/shishir-21/peblo-tv-mini  |

### Test Accounts

**Editor**

* Email: `editor@peblo.tv`
* Password: `peblo@123`

**Admin**

* Email: `mahatoshishir6@gmail.com`
* Password: `Abc@123`

Editor can manage content. Admin can also publish the catalogue.

## Tech Stack

* **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic, Pydantic
* **Auth:** JWT + Argon2
* **CMS:** React + TypeScript + Vite + TanStack Query
* **Viewer:** React + TypeScript + Vite
* **Storage:** Local filesystem in development, Cloudinary in production
* **Testing:** Pytest + Vitest
* **CI:** GitHub Actions
* **Deployment:** Render + Vercel

## Main Features

### CMS / Backend

* JWT authentication and role-based authorization
* Show, season and episode CRUD
* Backend validation before publishing
* Episode language/content-group support
* Artwork upload with backend validation
* Human-readable artwork validation errors
* Catalogue validation report
* Admin-only catalogue publishing
* Publish run history
* Immutable catalogue snapshots
* Backend catalogue search with filters

### Artwork

The three required artwork types are enforced on the backend:

| Type      | Required size | Ratio |
| --------- | ------------: | ----: |
| Poster    |      ~600×900 |   2:3 |
| Banner    |     ~1280×720 |  16:9 |
| Thumbnail |      ~640×360 |  16:9 |

Maximum file size is **200 KB**.

An episode cannot be published without required artwork and duration.

### Viewer

* Featured home page
* Shows listing
* Show detail pages
* Season and episode browsing
* Season 0 trailers hidden from normal seasons
* Grouped language variants
* Episode language selection
* Search by show title, episode title and category
* Category and language filters
* Empty/error states
* Responsive UI
* Slow-image friendly loading/fallbacks

## Local Development

### Docker

From the project root:

```bash
docker-compose up --build
```

Services:

```text
PostgreSQL
    ↓
FastAPI
    ↓
CMS + Viewer
```

Local URLs:

* Backend: http://localhost:8000
* API Docs: http://localhost:8000/docs
* CMS: http://localhost:5173
* Viewer: http://localhost:5174

The project includes seed data for local development.

## Key Engineering Decisions

### 1. Atomic Publishing

Publishing never overwrites one shared live catalogue file.

Each successful publish creates an immutable snapshot:

```text
catalogues/catalogue-{publish_run_id}.json
```

The publish run is marked completed only after the snapshot is successfully stored. The public catalogue endpoint uses the latest completed run.

If publishing fails or the process stops midway, the previous completed catalogue stays available. This means the Viewer never reads a half-written catalogue.

### 2. Storage Abstraction

Storage is separated from the application logic.

```text
Storage
├── LocalStorage
└── CloudinaryStorage
```

Moving to Cloudflare R2 would require an `R2Storage` adapter and new storage configuration. The publishing and artwork business logic would not need to change.

### 3. Search

Search is handled by the backend instead of downloading the whole catalogue into the browser.

`q` matches:

* show title
* episode title
* category

Category, language and section filters can be combined.

This is enough for the challenge-sized catalogue. At larger scale, I would add PostgreSQL full-text search and proper indexes, or move to a dedicated search system such as OpenSearch.

### 4. Why Use a Published Catalogue?

The Viewer is read-heavy and content changes less often than users browse it.

A published snapshot:

* reduces database traffic
* keeps the Viewer independent from CMS/admin APIs
* exposes only approved content
* gives the Viewer a stable data format

The trade-off is freshness: CMS changes become public only after the next successful publish.

At larger scale, I would add CDN caching, compression, catalogue partitioning and stronger search/indexing.

### 5. Validation and Roles

Important validation is enforced by the backend, not only by the UI.

Examples:

* Published episodes need artwork and duration.
* `(content_group, language)` must be unique.
* Published shows need a valid section.
* Artwork dimensions, aspect ratio and file size are checked server-side.

Roles are enforced through authorization:

```text
Editor
└── Content CRUD

Admin
├── Content CRUD
└── Catalogue Publishing
```

The Viewer only uses public catalogue endpoints.

## CI / Deployment

GitHub Actions checks the backend and frontend builds and builds the Docker images.

Production deployment:

```text
GitHub
  ├── Render → Backend
  └── Vercel → CMS + Viewer
```

Production secrets are provided through environment variables and are not committed to the repository. `.env.example` documents the required configuration.

The backend exposes:

```text
GET /health
```

A useful production alert would be repeated health-check failures because the backend is required by both the CMS and public catalogue delivery. Repeated failed publish runs would also be a useful operational signal.

## Testing

Backend tests cover authentication, validation, publishing, catalogue behaviour and search.

Run backend tests:

```bash
cd backend
python -m pytest tests
```

Frontend checks:

```bash
cd cms
npm run build

cd ../viewer
npm run build
```

## What I Left Out

I focused on the core assignment requirements and skipped a few optional/production features:

* **Catalogue rollback UI** — immutable snapshots already provide the base for rollback.
* **Publish dry-run/diff** — skipped due to time; validation was more important.
* **Full field-level audit log** — publish runs record publishing activity, but every CRUD field change is not audited.
* **Real video streaming** — the Watch page uses a mock player; transcoding/CDN/streaming were outside the challenge scope.
* **Movies** — the Shows flow is implemented; additional content types were outside the main scope.

## AI Usage

I used AI tools as an engineering assistant for brainstorming, debugging, edge cases, architecture review and documentation.

I reviewed the suggestions manually and changed or rejected them when they did not fit the assignment or the existing codebase.

One example was catalogue delivery: instead of relying on a mutable `catalogue.json` URL and cache invalidation, I used immutable publish-run snapshots so a failed or stale update cannot replace the current public catalogue unexpectedly.

## Time Spent

| Area                      |           Time |
| ------------------------- | -------------: |
| Backend + data model      |        4–5 hrs |
| Auth + authorization      |        2–3 hrs |
| CMS                       |        4–5 hrs |
| Artwork + storage         |        2–3 hrs |
| Validation + publishing   |        4–5 hrs |
| Viewer                    |        4–5 hrs |
| Search + language support |        2–3 hrs |
| Docker + CI + deployment  |        3–4 hrs |
| Debugging + verification  |        3–4 hrs |
| Documentation             |        1–2 hrs |
| **Total**                 | **~30–40 hrs** |

## Links

* GitHub: https://github.com/shishir-21/peblo-tv-mini
* CMS: https://peblo-tv-cms.vercel.app
* Viewer: https://viewer-six-kappa.vercel.app
* API Docs: https://peblo-tv-mini-fvu7.onrender.com/docs
