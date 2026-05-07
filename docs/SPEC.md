# AI Job Search Assistant — Full Technical Specification

## 1. Overview

A standalone, self-hosted AI-powered job search assistant that:
- Analyzes a user's CV to extract skills, ideal roles, and experience
- Searches real job platforms for recent postings
- AI-grades each job across 6 dimensions (A+ → F)
- Generates cover letters, interview prep, job specs, and CV optimizations per job
- Tracks applications via a Kanban board
- Provides market insights and skill gap analysis
- Supports automated/scheduled searches with deduplication
- Fully customizable: country, city, job type, salary, language, platforms, etc.

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                    │
│  Pages: Dashboard, CV, Settings, Results, Tracker,      │
│         Insights, History, Automation                    │
│  State: Zustand store with localStorage persistence      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP
┌──────────────────────┴──────────────────────────────────┐
│              Express.js Backend API                       │
│                                                          │
│  POST /api/cv/analyze         → Claude API               │
│  POST /api/jobs/search        → SerpAPI / Tavily         │
│  POST /api/jobs/grade         → Claude API               │
│  POST /api/jobs/cover-letter  → Claude API               │
│  POST /api/jobs/interview     → Claude API               │
│  POST /api/jobs/spec          → Claude API               │
│  POST /api/jobs/cv-optimize   → Claude API               │
│  POST /api/insights/market    → Claude API               │
│  POST /api/insights/gap       → Claude API               │
│  GET  /api/health             → health check             │
│  POST /api/automation/run     → cron-triggered search    │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
    Claude API    SerpAPI /     SQLite DB
   (Anthropic)    Tavily       (persistent)
                 (job search)
```

## 3. Technology Stack

| Layer           | Technology         | Why                                      |
|-----------------|--------------------|------------------------------------------|
| Frontend        | React 18 + Vite    | Fast dev, modern tooling                 |
| Styling         | Tailwind CSS 3     | Utility-first, responsive                |
| State           | Zustand            | Lightweight, persistent                  |
| Backend         | Node.js + Express  | Simple, fast, JS everywhere              |
| AI Engine       | Claude API (Sonnet) | Best reasoning for CV/job analysis       |
| Job Search      | SerpAPI + Tavily   | Real Google/LinkedIn/Indeed results      |
| Database        | SQLite (better-sqlite3) | Zero-config, file-based, portable   |
| Scheduler       | node-cron          | In-process job scheduling                |
| PDF Parsing     | pdf-parse          | Extract CV text from PDF uploads         |
| Export          | json2csv           | CSV export of results                    |
| Env Config      | dotenv             | Secure API key management                |

## 4. API Keys Required

| Service   | Env Variable        | Get it from                              | Free tier?  |
|-----------|---------------------|------------------------------------------|-------------|
| Anthropic | ANTHROPIC_API_KEY   | https://console.anthropic.com            | Pay-per-use |
| SerpAPI   | SERPAPI_KEY          | https://serpapi.com                       | 100/mo free |
| Tavily    | TAVILY_API_KEY       | https://tavily.com                       | 1000/mo free|

At minimum you need Anthropic + one of SerpAPI or Tavily. The app works with either or both job search providers.

## 5. Database Schema

```sql
-- Users (single-user mode, expandable)
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  cv_text TEXT,
  cv_skills JSON,
  cv_titles JSON,
  settings JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs found
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  title TEXT,
  company TEXT,
  location TEXT,
  platform TEXT,
  url TEXT,
  job_type TEXT,
  salary TEXT,
  description TEXT,
  posted_date TEXT,
  applicants TEXT,
  grade TEXT,
  overall_score INTEGER,
  skills_match INTEGER,
  experience_fit INTEGER,
  salary_alignment INTEGER,
  industry_relevance INTEGER,
  location_fit INTEGER,
  growth_potential INTEGER,
  interview_chance TEXT,
  why_match TEXT,
  missing_skills JSON,
  red_flags JSON,
  search_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application tracker
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT REFERENCES jobs(id),
  status TEXT DEFAULT 'Saved',  -- Saved/Applied/Interview/Offer/Rejected
  notes TEXT,
  tags JSON,
  follow_up_date TEXT,
  cover_letter TEXT,
  interview_prep TEXT,
  job_spec TEXT,
  cv_optimized TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search history
CREATE TABLE searches (
  id TEXT PRIMARY KEY,
  query TEXT,
  settings JSON,
  job_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Market insights cache
CREATE TABLE insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_id TEXT,
  type TEXT,  -- 'market' or 'gap'
  data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 6. API Endpoints Spec

### POST /api/cv/analyze
- Input: `{ cv_text: string }`
- Output: `{ skills: string[], jobTitles: string[], yearsExperience: number, seniority: string, industry: string }`
- Sends CV to Claude for extraction

### POST /api/jobs/search
- Input: `{ settings: Settings, cvAnalysis: CVAnalysis }`
- Output: `{ jobs: RawJob[], searchId: string }`
- Queries SerpAPI/Tavily for job listings

### POST /api/jobs/grade
- Input: `{ jobs: RawJob[], cvAnalysis: CVAnalysis, cv_text: string }`
- Output: `{ gradedJobs: GradedJob[] }`
- Claude grades each job across 6 dimensions

### POST /api/jobs/cover-letter
- Input: `{ job: GradedJob, cv_text: string }`
- Output: `{ coverLetter: string }`

### POST /api/jobs/interview
- Input: `{ job: GradedJob, cv_text: string }`
- Output: `{ interviewPrep: string }`

### POST /api/jobs/spec
- Input: `{ job: GradedJob }`
- Output: `{ jobSpec: string }`

### POST /api/jobs/cv-optimize
- Input: `{ job: GradedJob, cv_text: string }`
- Output: `{ optimizedCV: string }`

### POST /api/insights/market
- Input: `{ jobs: GradedJob[] }`
- Output: `{ topSkills, salaryRange, topCompanies, topLocations, hotJobTitles }`

### POST /api/insights/gap
- Input: `{ cvSkills: string[], jobs: GradedJob[] }`
- Output: `{ missingSkills, topRecommendations, courseSuggestions }`

### POST /api/automation/run
- Input: `{}` (uses stored settings + CV)
- Output: `{ newJobs: number, searchId: string }`

## 7. Frontend Pages

| Route          | Page        | Description                                   |
|----------------|-------------|-----------------------------------------------|
| /              | Dashboard   | Quick status, search button, progress log      |
| /cv            | CV Editor   | Paste or upload PDF, skills preview            |
| /settings      | Settings    | All search configuration                       |
| /results       | Results     | Graded job list with sort/filter/actions        |
| /tracker       | Tracker     | Kanban board for applications                  |
| /insights      | Insights    | Market data + gap analysis                     |
| /history       | History     | Past searches log                              |
| /automation    | Automation  | Schedule config, stats                         |

## 8. File Structure

```
job-search-ai/
├── docs/
│   └── SPEC.md                  # This document
├── server/
│   ├── index.js                 # Express app entry
│   ├── db.js                    # SQLite setup + migrations
│   ├── routes/
│   │   ├── cv.js                # CV analysis routes
│   │   ├── jobs.js              # Job search + grading routes
│   │   ├── actions.js           # Cover letter, interview, spec, CV opt
│   │   ├── insights.js          # Market insights + gap analysis
│   │   └── automation.js        # Cron scheduler routes
│   ├── services/
│   │   ├── claude.js            # Anthropic API wrapper
│   │   ├── serpapi.js           # SerpAPI job search
│   │   ├── tavily.js            # Tavily job search
│   │   └── scheduler.js         # node-cron automation
│   └── prompts/
│       ├── cv-analyze.js        # CV analysis prompt
│       ├── job-grade.js         # Job grading prompt
│       ├── cover-letter.js      # Cover letter prompt
│       ├── interview-prep.js    # Interview prep prompt
│       ├── job-spec.js          # Job spec prompt
│       ├── cv-optimize.js       # CV optimizer prompt
│       ├── market-insights.js   # Market insights prompt
│       └── gap-analysis.js      # Gap analysis prompt
├── src/
│   ├── main.jsx                 # React entry
│   ├── App.jsx                  # Router + layout
│   ├── api/
│   │   └── client.js            # Axios API client
│   ├── store/
│   │   └── useStore.js          # Zustand global store
│   ├── hooks/
│   │   ├── useSearch.js         # Search orchestration hook
│   │   └── useJobActions.js     # Per-job action hook
│   ├── components/
│   │   ├── Layout.jsx           # Nav + header + theme
│   │   ├── JobCard.jsx          # Individual job card
│   │   ├── GradeCircle.jsx      # Grade badge
│   │   ├── ScoreBar.jsx         # Score progress bar
│   │   ├── KanbanBoard.jsx      # Drag-and-drop Kanban
│   │   ├── ActionPanel.jsx      # Cover letter / interview / spec panel
│   │   └── SearchProgress.jsx   # Live progress indicator
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CVEditor.jsx
│   │   ├── Settings.jsx
│   │   ├── Results.jsx
│   │   ├── Tracker.jsx
│   │   ├── Insights.jsx
│   │   ├── History.jsx
│   │   └── Automation.jsx
│   ├── utils/
│   │   └── helpers.js           # Formatters, constants
│   └── types/
│       └── index.js             # JSDoc type definitions
├── public/
│   └── index.html
├── .env.example                 # API key template
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```
