import cron from 'node-cron';

let activeJob = null;
let runCallback = null;
let lastRunTime = null;
let isRunning = false;

/**
 * Start the automated search scheduler
 * @param {number} intervalHours - Interval in hours (e.g. 12, 24)
 * @param {Function} callback - Async function to run on each tick
 */
export function startScheduler(intervalHours, callback) {
  stopScheduler();

  if (!intervalHours || intervalHours <= 0) return;

  runCallback = callback;

  // Convert hours to cron expression
  // e.g. every 12 hours = "0 */12 * * *"
  const cronExpr = intervalHours >= 24
    ? `0 9 */${Math.round(intervalHours / 24)} * *`  // daily+ at 9am
    : `0 */${intervalHours} * * *`;                    // every N hours

  console.log(`[Scheduler] Starting: every ${intervalHours}h (cron: ${cronExpr})`);

  activeJob = cron.schedule(cronExpr, async () => {
    if (isRunning) {
      console.log('[Scheduler] Skipping — previous run still active');
      return;
    }

    isRunning = true;
    console.log(`[Scheduler] Running automated search at ${new Date().toISOString()}`);

    try {
      await runCallback();
      lastRunTime = new Date().toISOString();
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }

    isRunning = false;
  });
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (activeJob) {
    activeJob.stop();
    activeJob = null;
    console.log('[Scheduler] Stopped');
  }
}

/**
 * Run the search immediately (manual trigger)
 */
export async function runNow() {
  if (!runCallback) throw new Error('No search callback configured');
  if (isRunning) throw new Error('Search already running');

  isRunning = true;
  try {
    const result = await runCallback();
    lastRunTime = new Date().toISOString();
    return result;
  } finally {
    isRunning = false;
  }
}

/**
 * Get scheduler status
 */
export function getStatus() {
  return {
    active: !!activeJob,
    running: isRunning,
    lastRun: lastRunTime,
  };
}

export default { startScheduler, stopScheduler, runNow, getStatus };
