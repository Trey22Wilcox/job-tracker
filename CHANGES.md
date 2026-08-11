# Job Tracker — Project Overview & Change Log

## What the project is

A full-stack job application tracker.

- **Backend**: Spring Boot 4.0.6 (Java 21), REST API backed by PostgreSQL via Spring Data JPA.
- **Frontend**: React 19 (Vite), client-side routed with React Router.
- **Deployment**: Dockerfiles for both backend and frontend (frontend served via Caddy), plus `docker-compose.yaml` for local Postgres.

### Backend structure (`src/main/java/com/treydev/job_tracker/`)

| File | Purpose |
|---|---|
| `JobTrackerApplication.java` | Spring Boot entry point |
| `model/JobApplication.java` | JPA entity — the core data model |
| `repository/JobApplicationRepository.java` | Spring Data JPA repository |
| `service/JobApplicationService.java` | CRUD business logic |
| `controller/JobApplicationController.java` | REST endpoints under `/api/jobs` |
| `service/ResumeAnalysisService.java` | Calls Claude API to compare resume against a job description |
| `controller/ResumeAnalysisController.java` | REST endpoint under `/api/resume/analyze` |
| `config/WebConfig.java` | CORS configuration (`FRONTEND_URL`-driven, covers `/api/**` and static `/resume.pdf`) |

**`JobApplication` fields**: `id`, `company` (required), `jobTitle` (required), `status` (enum: `APPLIED`, `PHONE_SCREEN`, `INTERVIEW`, `OFFER`, `REJECTED`), `jobPostingURL` (validated URL, serialized as `jobPostingUrl`), `notes`, `appliedDate`, `lastUpdated`. `appliedDate` defaults to today on first save (only if not already set); `lastUpdated` is stamped to today on every save via `@PrePersist`/`@PreUpdate`.

**API**: `GET /api/jobs`, `GET /api/jobs/{id}`, `POST /api/jobs`, `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}`, `POST /api/resume/analyze`.

Data store: PostgreSQL via `docker-compose.yaml` (`job-tracker-db`, port `5434`).

### Frontend structure (`frontend/src/`)

| File | Purpose |
|---|---|
| `App.jsx` | Root component, defines routes (`/` → Dashboard, `/resume` → Resume) |
| `pages/Dashboard.jsx` | Main page — stats bar, job list, add/edit modal trigger |
| `pages/Resume.jsx` | Resume preview (`<iframe>`) + job description analysis |
| `components/NavBar.jsx` | Top navigation (Dashboard / Resume links) |
| `components/StatsBar.jsx` | Total applications, interviews, offers, response rate |
| `components/JobModal.jsx` | Add/Edit Application modal (form + delete confirmation) |
| `api/jobsApi.js` | Fetch wrapper for the backend REST API |
| `api/resumeApi.js` | Fetch wrapper for `/api/resume/analyze` |
| `index.css` | Global styles, color variables |
| `App.css` | Component-level styles (nav, stats, list, modal, buttons, resume page) |

## Change log

### Visual theme — muted earth tones
- Replaced leftover Vite boilerplate in `App.css` with actual styles for the nav bar, stat cards, job list, buttons, and modal.
- CSS variable palette in `index.css`: sand background (`--bg`), cream surfaces (`--surface`), sage green accents (`--sage`, `--sage-dark`), clay/rust tones (`--clay`, `--rust`) for warnings and destructive actions, warm neutral text colors.
- Color-coded status badges per application status (Applied, Phone Screen, Interview, Offer, Rejected).

### Job list & Dashboard polish
- Job list items styled as cards with hover states.
- `lastUpdated` timestamp displayed in small, muted text on the far right of each job list row.

### Job Modal — extra fields
- Editable **Job Posting URL** (`type="url"`), **Notes** (`textarea`), and **Applied Date** (native `type="date"` picker).
- Read-only **Last updated** date shown in the modal footer.
- Delete confirmation is a separate small dialog (`.confirm-modal`) layered over the blurred edit modal, with a single **Cancel** and a single destructive **Delete** (`.btn-danger`).
- **Copy** button next to the Job Posting URL field, using `navigator.clipboard.writeText`.
- Renamed `jobModal.jsx` → `JobModal.jsx` to fix a case-sensitivity bug that broke imports on case-sensitive filesystems (Linux/Docker) despite working fine on macOS.

### Resume page — job description analysis
- `pages/Resume.jsx` posts a job description to `/api/resume/analyze` (Claude-powered resume-vs-job-description matcher) via `api/resumeApi.js`, surfacing backend error messages (rate limits, bad requests) in the UI.
- Layout: resume preview on top, job description textarea + "Analyze Match" button + results (match score, strengths, gaps, suggestion) below. A "Clear" button was added for the job description textbox.
- Resume preview renders via a plain `<iframe src=".../resume.pdf#view=FitH">`. A custom `pdfjs-dist`-based canvas viewer (`PdfViewer.jsx`) was built at one point to avoid native PDF viewer chrome, but was later removed in favor of the simpler iframe approach — `PdfViewer.jsx` no longer exists in the codebase.
- Later pass optimized the resume page layout for mobile viewports (`App.css`, `Resume.jsx`).

### Backend CORS
- `config/WebConfig.java` (a `WebMvcConfigurer` bean) configures CORS from `FRONTEND_URL` (env-driven, defaults to `http://localhost:5173`), covering both the `/api/**` controllers and the statically-served `/resume.pdf`.
- `ResumeAnalysisService` hardened alongside the CORS work (error handling around the Claude API call).

### Deployment
- Added `Dockerfile` (backend, multi-stage Maven/JRE build) and `frontend/Dockerfile` + `frontend/Caddyfile` (frontend, static build served via Caddy).
- Removed a redundant Hibernate property from `application.properties`.
- Updated favicon and `index.html` metadata.

## Not yet done / potential follow-ups
- No automated tests for the modal fields, delete-confirmation flow, resume analysis page, or resume preview.
- No production docker-compose wiring the backend, frontend, and Postgres together end-to-end (current `docker-compose.yaml` only runs Postgres).
