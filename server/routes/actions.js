import { Router } from 'express';
import { queries } from '../db.js';
import { COVER_LETTER_SYSTEM, coverLetterPrompt } from '../prompts/cover-letter.js';
import { CV_OPTIMIZE_SYSTEM, cvOptimizePrompt } from '../prompts/cv-optimize.js';
import { INTERVIEW_PREP_SYSTEM, interviewPrepPrompt } from '../prompts/interview-prep.js';
import { JOB_SPEC_SYSTEM, jobSpecPrompt } from '../prompts/job-spec.js';
import { callClaudeText } from '../services/claude.js';

const router = Router();

/**
 * POST /api/actions/cover-letter
 */
router.post('/cover-letter', async (req, res) => {
  try {
    const { job_id, language } = req.body;
    const job = queries.getJobById.get(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const user = queries.getUser.get();
    if (!user.cv_text) return res.status(400).json({ error: 'No CV found' });

    const content = await callClaudeText(
      coverLetterPrompt(job, user.cv_text, language || 'English'),
      COVER_LETTER_SYSTEM
    );

    // Save to application record
    ensureApplication(job_id);
    queries.updateApplicationCoverLetter.run(content, job_id);

    res.json({ content });
  } catch (err) {
    console.error('[Cover Letter]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/actions/interview-prep
 */
router.post('/interview-prep', async (req, res) => {
  try {
    const { job_id } = req.body;
    const job = queries.getJobById.get(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const user = queries.getUser.get();
    if (!user.cv_text) return res.status(400).json({ error: 'No CV found' });

    const content = await callClaudeText(
      interviewPrepPrompt(job, user.cv_text),
      INTERVIEW_PREP_SYSTEM
    );

    ensureApplication(job_id);
    queries.updateApplicationInterviewPrep.run(content, job_id);

    res.json({ content });
  } catch (err) {
    console.error('[Interview Prep]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/actions/job-spec
 */
router.post('/job-spec', async (req, res) => {
  try {
    const { job_id } = req.body;
    const job = queries.getJobById.get(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const content = await callClaudeText(
      jobSpecPrompt(job),
      JOB_SPEC_SYSTEM
    );

    ensureApplication(job_id);
    queries.updateApplicationJobSpec.run(content, job_id);

    res.json({ content });
  } catch (err) {
    console.error('[Job Spec]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/actions/cv-optimize
 */
router.post('/cv-optimize', async (req, res) => {
  try {
    const { job_id } = req.body;
    const job = queries.getJobById.get(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const user = queries.getUser.get();
    if (!user.cv_text) return res.status(400).json({ error: 'No CV found' });

    const content = await callClaudeText(
      cvOptimizePrompt(job, user.cv_text),
      CV_OPTIMIZE_SYSTEM
    );

    ensureApplication(job_id);
    queries.updateApplicationCVOptimized.run(content, job_id);

    res.json({ content });
  } catch (err) {
    console.error('[CV Optimize]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Application Management ─────────────────────────────────────────────────

/**
 * GET /api/actions/applications
 * Get all tracked applications
 */
router.get('/applications', (req, res) => {
  const apps = queries.getAllApplications.all().map(parseApp);
  res.json(apps);
});

/**
 * PUT /api/actions/applications/:jobId/status
 */
router.put('/applications/:jobId/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Use: ${validStatuses.join(', ')}` });
  }
  ensureApplication(req.params.jobId);
  queries.insertApplication.run(req.params.jobId, status);
  queries.updateApplicationStatus.run(status, req.params.jobId);
  res.json({ ok: true });
});

/**
 * PUT /api/actions/applications/:jobId/notes
 */
router.put('/applications/:jobId/notes', (req, res) => {
  ensureApplication(req.params.jobId);
  queries.updateApplicationNotes.run(req.body.notes || '', req.params.jobId);
  res.json({ ok: true });
});

/**
 * PUT /api/actions/applications/:jobId/tags
 */
router.put('/applications/:jobId/tags', (req, res) => {
  ensureApplication(req.params.jobId);
  queries.updateApplicationTags.run(JSON.stringify(req.body.tags || []), req.params.jobId);
  res.json({ ok: true });
});

/**
 * PUT /api/actions/applications/:jobId/follow-up
 */
router.put('/applications/:jobId/follow-up', (req, res) => {
  ensureApplication(req.params.jobId);
  queries.updateApplicationFollowUp.run(req.body.date || '', req.params.jobId);
  res.json({ ok: true });
});

/**
 * DELETE /api/actions/applications/:jobId
 */
router.delete('/applications/:jobId', (req, res) => {
  queries.deleteApplication.run(req.params.jobId);
  res.json({ ok: true });
});

// Helper: ensure application row exists
function ensureApplication(jobId) {
  const existing = queries.getApplication.get(jobId);
  if (!existing) {
    queries.insertApplication.run(jobId, 'Saved');
    queries.updateApplicationStatus.run('Saved', jobId);
  }
}

function parseApp(row) {
  return { ...row, tags: JSON.parse(row.tags || '[]') };
}

export default router;
