Update ONLY the root README.md for the current Peblo TV Mini project.

Keep the existing useful sections, but bring the documentation up to date with the current implementation.

Include:

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

9. Development status
   Do NOT say frontend is "planned" or "in progress".
   Say that the backend foundation, authentication, publishing, storage, CMS, Viewer, CI, and Shows browsing flow are implemented.
   Mention that additional Viewer features such as Movies are still being developed.

Important:
- Do not modify any source code.
- Do not modify package files.
- Do not modify configuration files.
- Do not invent API endpoints or features that are not present in the repository.
- Only modify README.md.
- Keep the README professional and concise.
