# Job Tracker

A full-stack web app for tracking job applications — company, role, status (applied, interview, offer, etc.), notes, and dates — plus a page that compares your resume against a job description.

It's built from two separate programs that run at the same time and talk to each other:

- **Backend**: the server. Built with Spring Boot (Java 21). It stores data in a PostgreSQL database and exposes a REST API (a set of URLs the frontend calls to read/write data).
- **Frontend**: the website you actually see and click around in. Built with React and Vite.

Everything below is done from a terminal. No code editor or IDE (like IntelliJ or VS Code) is required to install anything or run the app — Java, Maven, and Node all work as plain command-line tools. An IDE is only useful afterward, if you want to read or change the source code.

## Prerequisites

Install these before you start. Each is a piece of software your computer needs in order to run the project — think of them as the "engines" for each part of the stack. All of them are installed the normal way (an installer or a package manager like Homebrew) — none of them require an IDE.

- [Java 21 (JDK)](https://adoptium.net/) — runs the backend server. On macOS you can also install it with `brew install openjdk@21`. Confirm it worked with `java -version` in a terminal.
- [Node.js](https://nodejs.org/) 18+ (which includes `npm`) — runs and installs packages for the frontend
- [Docker](https://www.docker.com/) — runs the PostgreSQL database in an isolated container, so you don't have to install Postgres directly on your machine. (If you'd rather install PostgreSQL yourself instead of using Docker, that works too — see the note under step 2.)
- [GitHub CLI (`gh`)](https://cli.github.com/) — used to download (clone) the code in step 1. (Plain `git clone` also works if you already have that installed.)

You do **not** need to install Maven separately — the project includes a wrapper script (`mvnw`) that downloads and runs the correct version automatically. `./mvnw spring-boot:run` (step 3) is the terminal equivalent of clicking "Run" on a Spring Boot app in an IDE — it compiles and starts the server directly, with no IDE involved.

## 1. Download the code and set up your configuration

```bash
gh repo clone Trey22Wilcox/job-tracker
cd job-tracker
cp .env.example .env
```

`.env` is a file that holds settings and secrets (like database passwords and API keys) that shouldn't be committed to the code repository. `cp .env.example .env` makes you a personal copy from the provided template, which you then fill in.

Open the new `.env` file in a text editor and fill in your own values:

```
DB_URL=jdbc:postgresql://localhost:5434/jobtracker
DB_USERNAME=your_username
DB_PASSWORD=your_password
CLAUDE_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

What each line means:

- `DB_URL` — where the backend looks for the database. Leave this as-is if you're using the Docker setup in step 2.
- `DB_USERNAME` / `DB_PASSWORD` — the login for the database. These aren't pre-existing credentials to look up anywhere — you're inventing them here, and Docker will create the database with whatever you type. Pick anything you like.
- `CLAUDE_API_KEY` — an [Anthropic API key](https://console.anthropic.com/), needed only for the resume-analysis feature (the page that compares your resume to a job description using Claude). You can leave this blank if you don't need that feature — the rest of the app works fine without it.
- `FRONTEND_URL` — tells the backend which website address is allowed to talk to it (a security setting called CORS). Leave it as `http://localhost:5173` unless you change which port the frontend runs on.

There's a second, already-included settings file at `frontend/.env` that just tells the frontend where to find the backend:

```
VITE_API_URL=http://localhost:8080
```

You shouldn't need to change this unless you move the backend to a different address.

## 2. Start the database

```bash
docker compose up -d
```

This tells Docker to start a PostgreSQL database in the background (`-d` = "detached", meaning it keeps running without tying up your terminal), using the username/password you set in `.env`. It becomes available at `localhost:5434`, with a database named `jobtracker` already created inside it.

*Don't want to use Docker?* Install PostgreSQL yourself, create a database, and point `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` in `.env` at it instead.

To check it's running: `docker ps` should list a container named `job-tracker-db`.

## 3. Start the backend (server)

```bash
./mvnw spring-boot:run
```

This compiles and runs the Java server from the command line — no IDE needed. The first run will take a little longer, since it downloads dependencies. Once the log output settles down (no new lines appearing, no errors), the backend is ready and listening at `http://localhost:8080`.

You don't need to set up the database tables yourself — the backend creates/updates them automatically on startup.

Leave this running in its own terminal window/tab.

## 4. Start the frontend (website)

Open a **new** terminal tab or window (keep the backend running in the other one), then:

```bash
cd frontend
npm install
npm run dev
```

`npm install` downloads the frontend's dependencies (only needed the first time, or after they change). `npm run dev` starts the website at `http://localhost:5173`.

## 5. Try it out

Open `http://localhost:5173` in your browser. You should see the dashboard. Click "+ Add Application," fill in a company and role, and save — if it appears in the list, everything is wired up correctly (the click sends the data to the backend, which saves it to the database, and the page then displays it).

## Everyday use after setup

Once everything above is installed, you don't need to repeat the whole process each time — just open two terminals and run:

1. `docker compose up -d` (if the database isn't already running)
2. `./mvnw spring-boot:run` (backend)
3. `cd frontend && npm run dev` (frontend)

## Troubleshooting

- **"Port already in use"** — something else on your machine is already using port 5434, 8080, or 5173. Either stop that program or change the port in `.env` / `docker-compose.yaml` / `vite.config.js`.
- **Frontend loads but no data appears / requests fail** — make sure the backend (step 3) is actually running and didn't error out; check the terminal it's running in.
- **Database connection errors from the backend** — make sure `docker compose up -d` succeeded and `docker ps` shows `job-tracker-db` running, and that `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` in `.env` match what Docker used to create it.
- **Resume analysis page shows an error** — this feature requires a valid `CLAUDE_API_KEY` in `.env`; restart the backend after adding one.

## Project structure

A tour of the codebase, if you want to look around or make changes.

### Backend (`src/main/java/com/treydev/job_tracker/`)

| Path | Purpose |
|---|---|
| `JobTrackerApplication.java` | Entry point — where the server starts |
| `model/JobApplication.java` | Defines what a "job application" record looks like (the data model) |
| `repository/JobApplicationRepository.java` | Talks to the database on behalf of the app |
| `service/JobApplicationService.java` | Business logic for creating/updating/deleting applications |
| `controller/JobApplicationController.java` | The REST API endpoints under `/api/jobs`, called by the frontend |
| `service/ResumeAnalysisService.java` | Calls the Claude API to compare a resume against a job description |
| `controller/ResumeAnalysisController.java` | The REST API endpoint under `/api/resume/analyze` |
| `config/WebConfig.java` | CORS settings — controls which websites are allowed to call this API |

**API endpoints**: `GET /api/jobs`, `GET /api/jobs/{id}`, `POST /api/jobs`, `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}`, `POST /api/resume/analyze`

### Frontend (`frontend/src/`)

| Path | Purpose |
|---|---|
| `App.jsx` | Root component and page routing (`/` → Dashboard, `/resume` → Resume) |
| `pages/Dashboard.jsx` | Main page — stats bar, job list, add/edit modal |
| `pages/Resume.jsx` | Resume preview + job description analysis |
| `components/JobModal.jsx` | The add/edit-application popup form |
| `components/NavBar.jsx`, `components/StatsBar.jsx` | Navigation bar and the summary stats at the top of the dashboard |
| `api/jobsApi.js`, `api/resumeApi.js` | Functions that call the backend API |

See [CHANGES.md](CHANGES.md) for a more detailed change log and design notes.

## Running with Docker (backend only)

If you'd rather run the backend as a container instead of with `./mvnw spring-boot:run`:

```bash
docker build -t job-tracker-backend .
docker run --env-file .env -p 8080:8080 job-tracker-backend
```

Make sure the database is reachable from wherever the container runs — if the database isn't on the same machine as `localhost`, update `DB_URL` in `.env` accordingly.

## Running tests

```bash
./mvnw test
```

## Notes

- Never commit your `.env` file — it holds secrets and is already excluded via `.gitignore`.
- See [CHANGES.md](CHANGES.md) for a running log of project changes and architecture notes.
