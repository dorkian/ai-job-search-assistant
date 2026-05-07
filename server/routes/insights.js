import { Router } from 'express';
import { callClaudeJSON } from '../services/claude.js';
import { queries } from '../db.js';
import { MARKET_INSIGHTS_SYSTEM, marketInsightsPrompt } from '../prompts/market-insights.js';
import { GAP_ANALYSIS_SYSTEM, gapAnalysisPrompt } from '../prompts/gap-analysis.js';

const router = Router();

/**
 * POST /api/insights/market
 * Generate market insights from recent job results
 */
router.post('/market', async (req, res) => {
  try {
    const { jobs, searchId } = req.body;
    if (!jobs?.length) return res.status(400).json({ error: 'No jobs provided' });

    const insights = await callClaudeJSON(
      marketInsightsPrompt(jobs),
      MARKET_INSIGHTS_SYSTEM
    );

    // Cache in DB
    queries.insertInsight.run(searchId || '', 'market', JSON.stringify(insights));

    res.json(insights);
  } catch (err) {
    console.error('[Market Insights]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/insights/gap
 * Run skill gap analysis
 */
router.post('/gap', async (req, res) => {
  try {
    const { cvSkills, jobs, searchId } = req.body;
    if (!cvSkills?.length) return res.status(400).json({ error: 'CV skills required' });
    if (!jobs?.length) return res.status(400).json({ error: 'No jobs provided' });

    const analysis = await callClaudeJSON(
      gapAnalysisPrompt(cvSkills, jobs),
      GAP_ANALYSIS_SYSTEM
    );

    queries.insertInsight.run(searchId || '', 'gap', JSON.stringify(analysis));

    res.json(analysis);
  } catch (err) {
    console.error('[Gap Analysis]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/insights/latest
 * Get most recent cached insights
 */
router.get('/latest', (req, res) => {
  const market = queries.getLatestInsight.get('market');
  const gap = queries.getLatestInsight.get('gap');

  res.json({
    market: market ? JSON.parse(market.data) : null,
    gap: gap ? JSON.parse(gap.data) : null,
  });
});

export default router;
