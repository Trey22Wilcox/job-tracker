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

## Files touched
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/components/jobModal.jsx`
- `frontend/src/pages/Dashboard.jsx`

## Not yet done / potential follow-ups
- Changes are uncommitted — consider committing once reviewed.
- No automated tests were added for the new modal fields or delete-confirmation flow.
- The frontend theme was visually verified via a headless-browser screenshot for the earlier styling pass; the delete-confirmation and copy-button changes have not yet been visually verified in a running browser (would require the Postgres backend or mock data to exercise the "edit existing application" path).
