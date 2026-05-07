import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { callClaudeJSON } from '../services/claude.js';
import { searchSerpAPI, getFreshnessChip, getJobTypeChips } from '../services/serpapi.js';
import { searchTavily, freshnessToDays } from '../services/tavily.js';
import { queries, insertJobsBatch } from '../db.js';
import { JOB_GRADE_SYSTEM, jobGradePrompt } from '../prompts/job-grade.js';

const router = Router();

/**
 * POST /api/jobs/search
 * Search for jobs using SerpAPI and/or Tavily, then grade with Claude
 */
router.post('/search', async (req, res) => {
  try {
    const { settings, cvAnalysis, cv_text } = req.body;

    if (!cvAnalysis?.skills?.length) {
      return res.status(400).json({ error: 'CV analysis required. Analyze CV first.' });
    }

    const searchId = uuid();

    // Build search queries from CV analysis
    const titles = (cvAnalysis.jobTitles || []).slice(0, 4);
    const location = [settings.city, settings.country].filter(Boolean).join(', ');
    const jobTypes = settings.jobTypes || [];

    // ─── Search both providers in parallel ──────────────────────────
    const searchPromises = [];

    // SerpAPI searches
    if (process.env.SERPAPI_KEY) {
      for (const title of titles.slice(0, 2)) {
        const chips = [
          getFreshnessChip(settings.freshness),
          getJobTypeChips(jobTypes),
        ].filter(Boolean).join(',');

        searchPromises.push(
          searchSerpAPI({ query: `${title} ${jobTypes.includes('full-remote') ? 'remote' : ''}`.trim(), location, chips })
        );
      }
    }

    // Tavily searches
    if (process.env.TAVILY_API_KEY) {
      const typeStr = jobTypes.map(t => t.replace('-', ' ')).join(' OR ');
      for (const title of titles.slice(0, 2)) {
        const query = `${title} jobs ${location} ${typeStr}`.trim();
        searchPromises.push(
          searchTavily({
            query,
            maxResults: Math.ceil((settings.resultCount || 10) / titles.length),
            days: freshnessToDays(settings.freshness),
          })
        );
      }
    }

    if (searchPromises.length === 0) {
      return res.status(400).json({ error: 'No search provider configured. Set SERPAPI_KEY or TAVILY_API_KEY.' });
    }

    const results = await Promise.allSettled(searchPromises);
    let rawJobs = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Deduplicate by title+company
    const seen = new Set();
    rawJobs = rawJobs.filter((j) => {
      const key = `${j.title}::${j.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Deduplicate against DB
    const existingIds = new Set(queries.getAllJobIds.all().map((r) => r.id));
    rawJobs = rawJobs.filter((j) => !existingIds.has(j.id));

    if (rawJobs.length === 0) {
      return res.json({ jobs: [], searchId, message: 'No new jobs found' });
    }

    // Limit for grading
    const toGrade = rawJobs.slice(0, settings.resultCount || 15);

    // ─── Grade with Claude ──────────────────────────────────────────
    const grades = await callClaudeJSON(
      jobGradePrompt(cvAnalysis, cv_text, toGrade),
      JOB_GRADE_SYSTEM
    );

    const gradesArr = Array.isArray(grades) ? grades : [];

    // Merge grades into jobs
    const gradedJobs = toGrade.map((job, i) => {
      const grade = gradesArr.find((g) => g.jobIndex === i) || gradesArr[i] || {};
      return {
        ...job,
        grade: grade.grade || 'C',
        overall_score: grade.overall || 50,
        skills_match: grade.skillsMatch || 50,
        experience_fit: grade.experienceFit || 50,
        salary_alignment: grade.salaryAlignment || 50,
        industry_relevance: grade.industryRelevance || 50,
        location_fit: grade.locationFit || 50,
        growth_potential: grade.growthPotential || 50,
        interview_chance: grade.interviewChance || '⚠️ Medium',
        why_match: grade.whyGoodMatch || '',
        missing_skills: grade.missingSkills || [],
        red_flags: grade.redFlags || [],
        search_id: searchId,
      };
    });

    // Save to DB
    insertJobsBatch(gradedJobs);

    // Save search record
    queries.insertSearch.run(
      searchId,
      titles.join(', '),
      JSON.stringify(settings),
      cvAnalysis.jobTitles?.join(', ') || '',
      gradedJobs.length
    );

    res.json({ jobs: gradedJobs, searchId });
  } catch (err) {
    console.error('[Jobs Search]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/jobs
 * Get all graded jobs with sorting and filtering
 */
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const jobs = queries.getJobs.all(limit).map(parseJobRow);
  res.json(jobs);
});

/**
 * GET /api/jobs/search/:searchId
 * Get jobs by search ID
 */
router.get('/search/:searchId', (req, res) => {
  const jobs = queries.getJobsBySearch.all(req.params.searchId).map(parseJobRow);
  res.json(jobs);
});

/**
 * GET /api/jobs/:id
 * Get a single job
 */
router.get('/:id', (req, res) => {
  const job = queries.getJobById.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(parseJobRow(job));
});

function parseJobRow(row) {
  return {
    ...row,
    missing_skills: JSON.parse(row.missing_skills || '[]'),
    red_flags: JSON.parse(row.red_flags || '[]'),
  };
}

export default router;
