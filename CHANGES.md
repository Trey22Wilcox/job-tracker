# Job Tracker — Project Overview & Change Log

## What the project is

A full-stack job application tracker.

- **Backend**: Spring Boot 4.0.6 (Java), REST API backed by PostgreSQL via Spring Data JPA.
- **Frontend**: React (Vite), client-side routed with React Router.

### Backend structure (`src/main/java/com/treydev/job_tracker/`)

| File | Purpose |
|---|---|
| `JobTrackerApplication.java` | Spring Boot entry point |
| `model/JobApplication.java` | JPA entity — the core data model |
| `repository/JobApplicationRepository.java` | Spring Data JPA repository |
| `service/JobApplicationService.java` | CRUD business logic |
| `controller/JobApplicationController.java` | REST endpoints under `/api/jobs`, CORS allowed from `http://localhost:5173` |

**`JobApplication` fields**: `id`, `company` (required), `jobTitle` (required), `status` (enum: `APPLIED`, `PHONE_SCREEN`, `INTERVIEW`, `OFFER`, `REJECTED`), `jobPostingURL` (validated URL, serialized as `jobPostingUrl`), `notes`, `appliedDate`, `lastUpdated`. `appliedDate` defaults to today on first save (only if not already set); `lastUpdated` is stamped to today on every save via `@PrePersist`/`@PreUpdate`.

**API**: `GET /api/jobs`, `GET /api/jobs/{id}`, `POST /api/jobs`, `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}`.

Data store: PostgreSQL via `docker-compose.yaml` (`job-tracker-db`, port `5434`).

### Frontend structure (`frontend/src/`)

| File | Purpose |
|---|---|
| `App.jsx` | Root component, defines routes (`/` → Dashboard, `/resume` → Resume) |
| `pages/Dashboard.jsx` | Main page — stats bar, job list, add/edit modal trigger |
| `pages/Resume.jsx` | Resume page (separate route) |
| `components/NavBar.jsx` | Top navigation (Dashboard / Resume links) |
| `components/StatsBar.jsx` | Total applications, interviews, offers, response rate |
| `components/jobModal.jsx` | Add/Edit Application modal (form + delete confirmation) |
| `api/jobsApi.js` | Fetch wrapper for the backend REST API |
| `index.css` | Global styles, color variables |
| `App.css` | Component-level styles (nav, stats, list, modal, buttons) |

## Changes made this session

All changes are currently **uncommitted** on the `frontend` branch (`git status` shows them as modified, not yet committed).

### 1. Visual theme — muted earth tones
- Replaced leftover Vite boilerplate in `App.css` (it wasn't styling any real app elements) with actual styles for the nav bar, stat cards, job list, buttons, and modal.
- Introduced a CSS variable palette in `index.css`: sand background (`--bg`), cream surfaces (`--surface`), sage green accents (`--sage`, `--sage-dark`), clay/rust tones (`--clay`, `--rust`) for warnings and destructive actions, warm neutral text colors.
- Added color-coded status badges per application status (Applied, Phone Screen, Interview, Offer, Rejected).

### 2. Job list & Dashboard polish
- Job list items are now styled as cards with hover states.
- Added a `lastUpdated` timestamp displayed in small, muted text on the far right of each job list row.
- Fixed spacing between the "+ Add Application" button and the job list below it (`.add-application-btn` margin).

### 3. Job Modal — new fields
- Added editable **Job Posting URL** field (`type="url"`).
- Added editable **Notes** field (`textarea`).
- Added editable **Applied Date** field using a native `type="date"` input (browser calendar picker). Backend already preserves a user-supplied `appliedDate` on update (only defaults it when null), so no backend change was needed.
- Read-only **Last updated** date is still shown in the modal footer.
- All new fields are wired into the save payload (`onSave`) and match the backend's JSON field names (`jobPostingUrl`, `notes`, `appliedDate`).

### 4. Delete confirmation redesign
- Previously, clicking "Delete" swapped in a second inline row of buttons within the same modal, resulting in two visible "Cancel" buttons — confusing.
- Now, clicking "Delete" opens a separate small confirmation dialog (`.confirm-modal`) centered on top of the edit modal.
- The edit modal behind it gets blurred (`filter: blur(4px)`, `pointer-events: none`) while confirming.
- The confirmation dialog has exactly one **Cancel** (dismisses the confirmation only) and one **Delete** (destructive, styled with the rust/clay accent color via `.btn-danger`).

### 5. Copy Job Posting URL
- Added a small **Copy** button on the same line as the "Job Posting URL" label, right-aligned via a `.label-row` flex container (`justify-content: space-between`).
- Uses `navigator.clipboard.writeText`; disabled when the URL field is empty; shows "Copied!" for 1.5s as feedback.

### 6. Resume page — job description analysis
- Built out `pages/Resume.jsx` against the existing `/api/resume/analyze` backend endpoint (Claude-powered resume-vs-job-description matcher).
- New `api/resumeApi.js`: posts `{ jobDescription }` to `${VITE_API_URL}/api/resume/analyze`, surfaces the backend's `error` message on non-2xx responses (covers the 429 rate-limit and 400/502 cases).
- Layout: full-width resume preview on top, job description textarea + "Analyze Match" button + results (match score, strengths, gaps, suggestion) in a full-width section below. Iterated from an initial two-column layout after feedback that it looked cramped.

### 7. Resume PDF rendering — PDF.js canvas viewer (replacing `<iframe>`)
- The resume preview originally used `<iframe src={RESUME_URL}>`, which pulls in the browser's native PDF viewer chrome (toolbar, zoom, page controls) — not wanted.
- Added `pdfjs-dist` as a frontend dependency and built `components/PdfViewer.jsx`: fetches the PDF via `pdfjs-dist`, renders every page onto its own `<canvas>` (stacked vertically, not hardcoded to one page), scaled by `devicePixelRatio` for crisp text on retina displays. Shows a loading state while fetching/parsing and an inline error message on failure instead of crashing.
- Worker setup: `pdfjsLib.GlobalWorkerOptions.workerSrc` is set via `import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'` — Vite's `?url` suffix resolves to a correctly-hashed asset URL in both dev and production builds (confirmed via `npm run build`), avoiding the common mistake of pointing at a CDN or a raw `node_modules` path.
- `pdfjs-dist` v6's `getDocument()` no longer accepts a bare URL string — it must be called as `getDocument({ url })`, otherwise it throws `"getDocument - expected either data, range, or url parameter"`.
- **Backend CORS fix**: `pdfjs-dist` fetches the PDF bytes itself via `fetch`, which is subject to CORS — unlike the old `<iframe>`, which wasn't. Spring's static resource serving (`src/main/resources/static/resume.pdf`) had no CORS headers (the `@CrossOrigin` annotations only covered the `/api/**` controllers). Added `config/WebConfig.java` (a `WebMvcConfigurer` bean) that allows `http://localhost:5173` specifically on `GET /resume.pdf`, without loosening CORS on anything else.
- Verified: production build succeeds and emits the worker as its own hashed asset; confirmed via headless-browser (Playwright) screenshots that the page renders with no console errors before the CORS fix was live; after wiring up the backend, confirmed via `curl -H "Origin: http://localhost:5173"` that `/resume.pdf` needed a restart to pick up `WebConfig` before the header appeared.

### 8. Discovered: two separate local clones of this repo
- While debugging the CORS fix, found that the backend actually running on port 8080 was being launched from `/Users/treywilcox/Documents/Java Projects/job-tracker` (the IntelliJ project) — a **separate git clone** from `/Users/treywilcox/job-tracker` (where all of this session's edits were made), even though both are on the same `claude-implementation` branch/commit history.
- That's why the CORS fix didn't take effect after restarting: the running backend's directory never had `WebConfig.java` in the first place.
- Reconciled by copying the new/changed files (`WebConfig.java`, `PdfViewer.jsx`, `Resume.jsx`, `resumeApi.js`, `App.css`, `package.json`) into the IntelliJ clone and running `npm install` there for `pdfjs-dist`, while preserving that clone's own uncommitted `MAX_TOKENS = 800` tweak in `ResumeAnalysisService.java`.
- **Worth knowing going forward**: these two directories will keep drifting unless changes are deliberately synced (via git push/pull, or manual copy) between them — worth deciding which one is the "real" working copy.

## Files touched
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/components/jobModal.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Resume.jsx`
- `frontend/src/api/resumeApi.js`
- `frontend/src/components/PdfViewer.jsx`
- `frontend/package.json` / `package-lock.json` (added `pdfjs-dist`)
- `src/main/java/com/treydev/job_tracker/config/WebConfig.java` (new)

## Not yet done / potential follow-ups
- Changes are uncommitted in `/Users/treywilcox/job-tracker` — consider committing once reviewed. The IntelliJ clone (`Documents/Java Projects/job-tracker`) now has the same files copied over, also uncommitted.
- No automated tests were added for the new modal fields, delete-confirmation flow, resume analysis page, or PDF viewer.
- Live end-to-end verification of the PDF viewer (rendering the actual resume with no CORS errors) was in progress and pending a backend restart in the IntelliJ clone at the time of writing.
- Decide on a single source-of-truth directory for local development to avoid the two-clone drift described above.
