import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'jobsearch.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Migrations ────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY DEFAULT 1,
    cv_text TEXT DEFAULT '',
    cv_skills TEXT DEFAULT '[]',
    cv_titles TEXT DEFAULT '[]',
    cv_years_experience INTEGER DEFAULT 0,
    cv_seniority TEXT DEFAULT '',
    cv_industry TEXT DEFAULT '',
    settings TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT DEFAULT '',
    location TEXT DEFAULT '',
    platform TEXT DEFAULT '',
    url TEXT DEFAULT '',
    job_type TEXT DEFAULT '',
    salary TEXT DEFAULT '',
    description TEXT DEFAULT '',
    posted_date TEXT DEFAULT '',
    applicants TEXT DEFAULT '',
    grade TEXT DEFAULT '',
    overall_score INTEGER DEFAULT 0,
    skills_match INTEGER DEFAULT 0,
    experience_fit INTEGER DEFAULT 0,
    salary_alignment INTEGER DEFAULT 0,
    industry_relevance INTEGER DEFAULT 0,
    location_fit INTEGER DEFAULT 0,
    growth_potential INTEGER DEFAULT 0,
    interview_chance TEXT DEFAULT '',
    why_match TEXT DEFAULT '',
    missing_skills TEXT DEFAULT '[]',
    red_flags TEXT DEFAULT '[]',
    search_id TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Saved',
    notes TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    follow_up_date TEXT DEFAULT '',
    cover_letter TEXT DEFAULT '',
    interview_prep TEXT DEFAULT '',
    job_spec TEXT DEFAULT '',
    cv_optimized TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS searches (
    id TEXT PRIMARY KEY,
    query TEXT DEFAULT '',
    settings TEXT DEFAULT '{}',
    cv_summary TEXT DEFAULT '',
    job_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_id TEXT DEFAULT '',
    type TEXT NOT NULL,
    data TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Ensure default user exists
  INSERT OR IGNORE INTO users (id) VALUES (1);

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs(search_id);
  CREATE INDEX IF NOT EXISTS idx_jobs_grade ON jobs(grade);
  CREATE INDEX IF NOT EXISTS idx_jobs_overall ON jobs(overall_score);
  CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
  CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_job_id_unique ON applications(job_id);
`);

// ─── Helper Functions ──────────────────────────────────────────────────────

export const queries = {
  // User
  getUser: db.prepare('SELECT * FROM users WHERE id = 1'),
  updateUser: db.prepare(`
    UPDATE users SET cv_text = ?, cv_skills = ?, cv_titles = ?,
    cv_years_experience = ?, cv_seniority = ?, cv_industry = ?,
    updated_at = CURRENT_TIMESTAMP WHERE id = 1
  `),
  updateSettings: db.prepare('UPDATE users SET settings = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1'),

  // Jobs
  insertJob: db.prepare(`
    INSERT OR REPLACE INTO jobs (id, title, company, location, platform, url,
    job_type, salary, description, posted_date, applicants, grade, overall_score,
    skills_match, experience_fit, salary_alignment, industry_relevance,
    location_fit, growth_potential, interview_chance, why_match,
    missing_skills, red_flags, search_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getJobs: db.prepare('SELECT * FROM jobs ORDER BY overall_score DESC LIMIT ?'),
  getJobById: db.prepare('SELECT * FROM jobs WHERE id = ?'),
  getJobsBySearch: db.prepare('SELECT * FROM jobs WHERE search_id = ? ORDER BY overall_score DESC'),
  getAllJobIds: db.prepare('SELECT id FROM jobs'),

  // Applications
  insertApplication: db.prepare(`
    INSERT OR IGNORE INTO applications (job_id, status) VALUES (?, ?)
  `),
  updateApplicationStatus: db.prepare(`
    UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?
  `),
  getApplication: db.prepare('SELECT * FROM applications WHERE job_id = ?'),
  getApplicationsByStatus: db.prepare('SELECT a.*, j.title, j.company, j.grade, j.overall_score FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.status = ?'),
  getAllApplications: db.prepare('SELECT a.*, j.title, j.company, j.grade, j.overall_score, j.location, j.interview_chance FROM applications a JOIN jobs j ON a.job_id = j.id ORDER BY a.updated_at DESC'),
  updateApplicationNotes: db.prepare('UPDATE applications SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  updateApplicationTags: db.prepare('UPDATE applications SET tags = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  updateApplicationFollowUp: db.prepare('UPDATE applications SET follow_up_date = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  updateApplicationCoverLetter: db.prepare('UPDATE applications SET cover_letter = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  updateApplicationInterviewPrep: db.prepare('UPDATE applications SET interview_prep = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  updateApplicationJobSpec: db.prepare('UPDATE applications SET job_spec = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  updateApplicationCVOptimized: db.prepare('UPDATE applications SET cv_optimized = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?'),
  deleteApplication: db.prepare('DELETE FROM applications WHERE job_id = ?'),

  // Searches
  insertSearch: db.prepare('INSERT INTO searches (id, query, settings, cv_summary, job_count) VALUES (?, ?, ?, ?, ?)'),
  getSearches: db.prepare('SELECT * FROM searches ORDER BY created_at DESC LIMIT ?'),

  // Insights
  insertInsight: db.prepare('INSERT INTO insights (search_id, type, data) VALUES (?, ?, ?)'),
  getLatestInsight: db.prepare('SELECT * FROM insights WHERE type = ? ORDER BY created_at DESC LIMIT 1'),
};

// Transaction helper for batch inserts
export const insertJobsBatch = db.transaction((jobs) => {
  for (const j of jobs) {
    queries.insertJob.run(
      j.id, j.title, j.company, j.location, j.platform, j.url,
      j.job_type, j.salary, j.description, j.posted_date, j.applicants,
      j.grade, j.overall_score, j.skills_match, j.experience_fit,
      j.salary_alignment, j.industry_relevance, j.location_fit,
      j.growth_potential, j.interview_chance, j.why_match,
      JSON.stringify(j.missing_skills || []),
      JSON.stringify(j.red_flags || []),
      j.search_id
    );
  }
});

export default db;
