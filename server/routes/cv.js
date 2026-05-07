import { Router } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { callClaudeJSON } from '../services/claude.js';
import { queries } from '../db.js';
import { CV_ANALYZE_SYSTEM, cvAnalyzePrompt } from '../prompts/cv-analyze.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/cv/analyze
 * Analyze CV text with Claude — extract skills, titles, experience
 */
router.post('/analyze', async (req, res) => {
  try {
    const { cv_text } = req.body;
    if (!cv_text || cv_text.trim().length < 50) {
      return res.status(400).json({ error: 'CV text is too short (min 50 chars)' });
    }

    const analysis = await callClaudeJSON(cvAnalyzePrompt(cv_text), CV_ANALYZE_SYSTEM);

    // Save to DB
    queries.updateUser.run(
      cv_text,
      JSON.stringify(analysis.skills || []),
      JSON.stringify(analysis.jobTitles || []),
      analysis.yearsExperience || 0,
      analysis.seniority || '',
      analysis.industry || ''
    );

    res.json(analysis);
  } catch (err) {
    console.error('[CV Analyze]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/cv/upload
 * Upload a PDF CV and extract text
 */
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const data = await pdf(req.file.buffer);
    const text = data.text || '';

    if (text.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from PDF' });
    }

    res.json({ text, pages: data.numpages });
  } catch (err) {
    console.error('[CV Upload]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/cv
 * Get current CV and analysis from DB
 */
router.get('/', (req, res) => {
  const user = queries.getUser.get();
  res.json({
    cv_text: user.cv_text,
    skills: JSON.parse(user.cv_skills || '[]'),
    titles: JSON.parse(user.cv_titles || '[]'),
    yearsExperience: user.cv_years_experience,
    seniority: user.cv_seniority,
    industry: user.cv_industry,
  });
});

/**
 * PUT /api/cv
 * Save CV text (without re-analyzing)
 */
router.put('/', (req, res) => {
  const { cv_text } = req.body;
  queries.updateUser.run(cv_text, '[]', '[]', 0, '', '');
  res.json({ ok: true });
});

export default router;
