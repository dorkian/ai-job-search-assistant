# ⚡ AI Job Search Assistant

An AI-powered, self-hosted job search platform that analyzes your CV, finds matching jobs, grades them across 6 dimensions, and helps you prepare for interviews.

## Features

### 🔍 Smart Job Search
- Searches LinkedIn, Indeed, Glassdoor, and more via SerpAPI + Tavily
- Configurable: country, city, job type, salary range, experience level, freshness
- Multi-select job types: Full Remote, Hybrid, B2B Contract, Freelance, On-site, etc.

### 🏆 AI Job Grading (A+ → F)
- **6 dimensions**: Skills Match, Experience Fit, Salary Alignment, Industry Relevance, Location Fit, Growth Potential
- Interview chance badges: 🔥 Hot / ✅ High / ⚠️ Medium / ❌ Low
- Sort and filter by any dimension

### ⚡ Per-Job AI Actions
- **📝 Cover Letter** — tailored to the specific job, supports multiple languages
- **🎯 Interview Prep** — technical questions, STAR behavioral questions, questions to ask
- **📋 Job Spec Analysis** — must-have vs nice-to-have, red flags, success criteria
- **🔄 CV Optimizer** — rewrite your CV summary + keywords for that specific job

### 🗂️ Application Tracker
- Kanban board: Saved → Applied → Interview → Offer → Rejected
- Notes, custom tags, follow-up reminders per job

### 📈 Market Insights
- Top demanded skills, salary ranges, top hiring companies
- Skill gap analysis with course suggestions
- Career path recommendations

### 🤖 Automation
- Scheduled searches (every N hours)
- Deduplication — only shows new jobs
- Search history log

---

## Quick Start

### Option A — Docker (recommended)

> **Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.

#### Windows

```bat
start.bat
```

That's it. On first run it will:
1. Copy `.env.example` → `.env` and open Notepad so you can fill in your API keys
2. Build the Docker image (React frontend + Express backend in one container)
3. Start the app at **http://localhost:3031**

| Command | Action |
|---------|--------|
| `start.bat` | Build image + start |
| `start.bat stop` | Stop containers |
| `start.bat logs` | Stream live logs |
| `start.bat restart` | Restart containers |
| `start.bat rebuild` | Full rebuild, no cache |

#### macOS / Linux

```bash
cp .env.example .env   # then edit .env with your keys
mkdir -p data
docker compose up -d --build
```

App runs at **http://localhost:3031**.

---

### Option B — Local Dev (pnpm)

#### 1. Clone & Install

```bash
git clone <your-repo>
cd ai-job-search-assistant
pnpm install
```

#### 2. Configure API Keys

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```
ANTHROPIC_API_KEY=sk-ant-...     # Required — https://console.anthropic.com
SERPAPI_KEY=...                    # Optional — https://serpapi.com
TAVILY_API_KEY=tvly-...          # Optional — https://tavily.com
```

You need **Anthropic** + at least **one** of SerpAPI or Tavily.

#### 3. Run

```bash
pnpm run dev
```

This starts:
- **Backend** → http://localhost:3031
- **Frontend** → http://localhost:5173

#### 4. Use

1. Go to **CV** tab → paste your CV (or upload PDF)
2. Go to **Settings** → set country, job types, salary range
3. Click **🚀 Run Search**
4. Review graded results, generate cover letters, prep for interviews

---

## Production Deploy (without Docker)

```bash
pnpm run build
pnpm start
```

The server serves the built frontend from `dist/` in production mode on port 3031.

---

## Project Structure

```
├── Dockerfile                # Multi-stage build (builder + production)
├── docker-compose.yml        # Single-service compose with volume for SQLite
├── .dockerignore             # Excludes node_modules, dist, .env, data
├── start.bat                 # Windows one-click launcher (Docker)
├── server/
│   ├── index.js              # Express entry point
│   ├── db.js                 # SQLite setup
│   ├── routes/
│   │   ├── cv.js             # CV upload + analysis
│   │   ├── jobs.js           # Job search + grading
│   │   ├── actions.js        # Cover letter, interview prep, etc.
│   │   ├── insights.js       # Market insights + gap analysis
│   │   └── automation.js     # Scheduled search
│   ├── services/
│   │   ├── claude.js         # Anthropic API wrapper
│   │   ├── serpapi.js        # SerpAPI job search
│   │   ├── tavily.js         # Tavily job search
│   │   └── scheduler.js      # node-cron automation
│   └── prompts/              # All AI prompt templates
│       ├── cv-analyze.js
│       ├── job-grade.js
│       ├── cover-letter.js
│       ├── interview-prep.js
│       ├── job-spec.js
│       ├── cv-optimize.js
│       ├── market-insights.js
│       └── gap-analysis.js
├── src/
│   ├── App.jsx               # Router
│   ├── api/client.js         # Frontend API client
│   ├── store/useStore.js     # Zustand state
│   ├── hooks/                # useSearch, useJobActions
│   ├── components/           # Layout, JobCard, UI components
│   ├── pages/                # All page components
│   └── utils/helpers.js      # Constants + utilities
├── docs/SPEC.md              # Full technical specification
├── .env.example              # API key template
└── package.json
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + provider status |
| GET | `/api/cv` | Get stored CV + analysis |
| PUT | `/api/cv` | Save CV text |
| POST | `/api/cv/analyze` | Analyze CV with AI |
| POST | `/api/cv/upload` | Upload PDF CV |
| GET | `/api/jobs` | Get all graded jobs |
| POST | `/api/jobs/search` | Search + grade jobs |
| POST | `/api/actions/cover-letter` | Generate cover letter |
| POST | `/api/actions/interview-prep` | Generate interview prep |
| POST | `/api/actions/job-spec` | Analyze job specification |
| POST | `/api/actions/cv-optimize` | Optimize CV for job |
| GET | `/api/actions/applications` | Get all applications |
| PUT | `/api/actions/applications/:id/status` | Update app status |
| POST | `/api/insights/market` | Generate market insights |
| POST | `/api/insights/gap` | Run gap analysis |
| GET | `/api/automation/status` | Get scheduler status |
| POST | `/api/automation/enable` | Enable auto-search |
| POST | `/api/automation/disable` | Disable auto-search |
| POST | `/api/automation/run-now` | Trigger manual search |

---

## License

MIT
