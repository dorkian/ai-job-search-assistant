import { Router } from 'express';
import { queries } from '../db.js';
import { startScheduler, stopScheduler, runNow, getStatus } from '../services/scheduler.js';

const router = Router();

// The actual search function is injected from index.js
let searchFn = null;
export function setSearchFunction(fn) { searchFn = fn; }

/**
 * GET /api/automation/status
 */
router.get('/status', (req, res) => {
  const user = queries.getUser.get();
  const settings = JSON.parse(user.settings || '{}');

  res.json({
    ...getStatus(),
    intervalHours: settings.autoInterval || 0,
    enabled: settings.autoEnabled || false,
  });
});

/**
 * POST /api/automation/enable
 * Start automated searching
 */
router.post('/enable', (req, res) => {
  const { intervalHours } = req.body;
  if (!intervalHours || intervalHours < 1) {
    return res.status(400).json({ error: 'intervalHours must be >= 1' });
  }

  if (!searchFn) {
    return res.status(500).json({ error: 'Search function not initialized' });
  }

  // Save settings
  const user = queries.getUser.get();
  const settings = JSON.parse(user.settings || '{}');
  settings.autoEnabled = true;
  settings.autoInterval = intervalHours;
  queries.updateSettings.run(JSON.stringify(settings));

  // Start cron
  startScheduler(intervalHours, searchFn);

  res.json({ ok: true, message: `Auto-search enabled every ${intervalHours}h` });
});

/**
 * POST /api/automation/disable
 */
router.post('/disable', (req, res) => {
  stopScheduler();

  const user = queries.getUser.get();
  const settings = JSON.parse(user.settings || '{}');
  settings.autoEnabled = false;
  queries.updateSettings.run(JSON.stringify(settings));

  res.json({ ok: true, message: 'Auto-search disabled' });
});

/**
 * POST /api/automation/run-now
 * Trigger an immediate search
 */
router.post('/run-now', async (req, res) => {
  try {
    if (!searchFn) {
      return res.status(500).json({ error: 'Search function not initialized' });
    }
    const result = await runNow();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/automation/history
 * Get search history
 */
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = queries.getSearches.all(limit);
  res.json(history.map((h) => ({ ...h, settings: JSON.parse(h.settings || '{}') })));
});

/**
 * PUT /api/automation/settings
 * Update user settings
 */
router.put('/settings', (req, res) => {
  const { settings } = req.body;
  queries.updateSettings.run(JSON.stringify(settings));
  res.json({ ok: true });
});

/**
 * GET /api/automation/settings
 */
router.get('/settings', (req, res) => {
  const user = queries.getUser.get();
  res.json(JSON.parse(user.settings || '{}'));
});

export default router;
