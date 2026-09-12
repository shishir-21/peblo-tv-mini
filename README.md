
1. Project overview
   - Peblo TV Mini is a full-stack children's content platform.
   - CMS for managing content.
   - Public Viewer for browsing and watching catalogue content.
   - Catalogue publishing flow.

2. Production URLs
   Include:
   Backend: https://peblo-tv-mini-fvu7.onrender.com
   API docs: https://peblo-tv-mini-fvu7.onrender.com/docs
   CMS: https://peblo-tv-cms.vercel.app
   Viewer: https://viewer-six-kappa.vercel.app



## Test Credentials

### Editor Account

- Email: `editor@peblo.tv`
- Password: `peblo@123`

### Admin Account

- Email: `mahatoshishir6@gmail.com`
- Password: `Abc@123`

These credentials are provided for testing the deployed CMS and authentication flow.




3. Architecture
   Keep/update the architecture diagram:
   CMS (React) → FastAPI → PostgreSQL
                    ↓
               Cloudinary
                    ↓
              catalogue.json
                    ↓
             Viewer (React)

4. Tech stack
   - Backend: FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT, Argon2
   - CMS: React, TypeScript, Vite
   - Viewer: React, TypeScript, Vite
   - Storage: local filesystem for development, Cloudinary for production
   - CI: GitHub Actions
   - Deployment: Render for backend, Vercel for CMS and Viewer

5. Local development
   Keep the existing Docker and manual development instructions, but make them accurate.
   Mention:
   - Backend: http://localhost:8000
   - API docs: http://localhost:8000/docs
   - CMS: http://localhost:5173
   - Viewer: http://localhost:5174

6. Viewer features currently implemented
   - Home page
   - Shows listing page
   - Show detail pages
   - Episode/watch page
   - Search page
   - Audio language selector for episodes with multiple languages
   - Safe fallback when an unavailable language is selected
   - Catalogue loaded from published catalogue.json
   - Responsive show-card grid
   - Shows route: /shows
   - Show detail route: /shows/:slug
   - Watch route: /watch/:id

7. CMS/backend features currently implemented
   - Authentication
   - Editor/admin roles
   - JWT authentication
   - Current-user endpoint
   - Episode artwork upload
   - Catalogue validation
   - Catalogue publishing
   - Cloudinary storage
   - Seed data

8. CI
   Document that GitHub Actions runs:
   - Backend Ruff lint
   - Backend tests
   - Viewer build
   - CMS build
   - Docker build

## Engineering Decisions

### Atomic publishing

The catalogue is generated completely in memory and validated before publication.
Each publish creates an immutable catalogue-{run_id}.json object.

A publish run is marked completed only after the catalogue has been
successfully persisted. GET /catalog resolves the latest completed run,
so readers never observe a partially generated catalogue.

If the process dies before the run is completed, the previous completed
catalogue remains live. The failed run is recorded as failed.

### Storage abstraction

The application uses a Storage interface with LocalStorage and
CloudinaryStorage implementations.

Business logic only depends on the Storage interface. Moving to Cloudflare
R2 would therefore require a new R2Storage implementation plus configuration
for bucket/credentials, without changing the publishing or artwork APIs.

### Search

Viewer search is performed against the published catalogue rather than
the CMS database.

For the challenge-sized catalogue this is intentionally simple. At larger
catalogue sizes, scanning the complete JSON on every search request would
become inefficient. I would move search to PostgreSQL full-text search or
a dedicated search index such as OpenSearch.

### Why a published catalogue?

The viewer is read-heavy and the content changes much less frequently than
users browse it. Publishing a static catalogue removes database joins and
CMS-specific logic from viewer requests and gives us a stable public
contract.

The trade-off is freshness: changes are not visible until the next publish.
The catalogue can also become large, at which point CDN caching, compression,
partitioning or a dedicated search/indexing layer would be appropriate.

### Skipped

- Catalogue rollback: skipped because versioned immutable catalogues provide
  the foundation but the assignment did not require an admin rollback UI.
- Dry-run diff: skipped due to time; validation was prioritized because it
  directly blocks unsafe publication.
- Full audit log: skipped because publish runs already record who triggered
  publication; field-level CRUD auditing was outside the v1 scope.

### AI usage

AI was used for brainstorming, debugging and reviewing implementation ideas.
Generated code was manually reviewed and adjusted where it did not match the
assignment requirements or repository architecture.
