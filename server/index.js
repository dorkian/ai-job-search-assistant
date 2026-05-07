import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { queries } from './db.js';
import actionsRoutes from './routes/actions.js';
import automationRoutes, { setSearchFunction } from './routes/automation.js';
import cvRoutes from './routes/cv.js';
import insightsRoutes from './routes/insights.js';
import jobsRoutes from './routes/jobs.js';
import { startScheduler } from './services/scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3031;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/cv', cvRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/automation', automationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    providers: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      serpapi: !!process.env.SERPAPI_KEY,
      tavily: !!process.env.TAVILY_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── Serve Frontend in Production ───────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Automated Search Function ──────────────────────────────────────────────
// This function is passed to the scheduler for automated runs
async function runAutomatedSearch() {
  const user = queries.getUser.get();
  const settings = JSON.parse(user.settings || '{}');

  if (!user.cv_text) {
    console.log('[Auto] No CV found, skipping');
    return { jobs: [], message: 'No CV configured' };
  }

  const cvAnalysis = {
    skills: JSON.parse(user.cv_skills || '[]'),
    jobTitles: JSON.parse(user.cv_titles || '[]'),
    yearsExperience: user.cv_years_experience,
    seniority: user.cv_seniority,
    industry: user.cv_industry,
  };

  if (!cvAnalysis.skills.length) {
    console.log('[Auto] CV not analyzed yet, skipping');
    return { jobs: [], message: 'CV not analyzed' };
  }

  // Simulate a POST to /api/jobs/search
  const { default: fetch } = await import('node-fetch');
  const res = await fetch(`http://localhost:${PORT}/api/jobs/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings, cvAnalysis, cv_text: user.cv_text }),
  });

  const data = await res.json();
  console.log(`[Auto] Found ${data.jobs?.length || 0} new jobs`);
  return data;
}

setSearchFunction(runAutomatedSearch);

// ─── Startup ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   ⚡ AI Job Search Assistant — Server        ║
║   http://localhost:${PORT}                       ║
║                                              ║
║   Providers:                                 ║
║   • Claude API: ${process.env.ANTHROPIC_API_KEY ? '✅ Ready' : '❌ Missing'}                  ║
║   • SerpAPI:    ${process.env.SERPAPI_KEY ? '✅ Ready' : '⚠️  Optional'}                  ║
║   • Tavily:     ${process.env.TAVILY_API_KEY ? '✅ Ready' : '⚠️  Optional'}                  ║
╚══════════════════════════════════════════════╝
  `);

  // Restore auto-search if previously enabled
  try {
    const user = queries.getUser.get();
    const settings = JSON.parse(user.settings || '{}');
    if (settings.autoEnabled && settings.autoInterval > 0) {
      startScheduler(settings.autoInterval, runAutomatedSearch);
      console.log(`[Auto] Restored scheduled search every ${settings.autoInterval}h`);
    }
  } catch {}
});

export default app;
