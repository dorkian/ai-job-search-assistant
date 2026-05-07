/**
 * SerpAPI Job Search Service
 * Docs: https://serpapi.com/google-jobs-api
 */

const SERPAPI_BASE = 'https://serpapi.com/search.json';

/**
 * Search for jobs via SerpAPI (Google Jobs engine)
 * @param {object} params
 * @param {string} params.query - Job search query (e.g. "Senior React Developer")
 * @param {string} params.location - Location (e.g. "New York, NY")
 * @param {string} [params.chips] - Filter chips (e.g. "date_posted:week")
 * @returns {Promise<Array>} Normalized job objects
 */
export async function searchSerpAPI({ query, location, chips }) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn('[SerpAPI] No API key set, skipping');
    return [];
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    engine: 'google_jobs',
    q: query,
    location: location || '',
    hl: 'en',
  });

  if (chips) params.append('chips', chips);

  try {
    const res = await fetch(`${SERPAPI_BASE}?${params}`);
    if (!res.ok) {
      console.error(`[SerpAPI] HTTP ${res.status}: ${await res.text()}`);
      return [];
    }

    const data = await res.json();
    const results = data.jobs_results || [];

    return results.map((job, i) => normalizeJob(job, i));
  } catch (err) {
    console.error('[SerpAPI] Error:', err.message);
    return [];
  }
}

/**
 * Build freshness chips from a freshness string
 * @param {string} freshness - "24h" | "48h" | "72h" | "1 week"
 * @returns {string}
 */
export function getFreshnessChip(freshness) {
  const map = {
    '24h': 'date_posted:today',
    '48h': 'date_posted:3days',
    '72h': 'date_posted:3days',
    '1 week': 'date_posted:week',
  };
  return map[freshness] || 'date_posted:week';
}

/**
 * Build job type chips
 * @param {string[]} types - ["full-remote", "b2b-contract", ...]
 * @returns {string}
 */
export function getJobTypeChips(types) {
  const chips = [];
  if (types.includes('full-remote')) chips.push('employment_type:FULLTIME');
  if (types.includes('part-time')) chips.push('employment_type:PARTTIME');
  if (types.includes('freelance') || types.includes('b2b-contract')) chips.push('employment_type:CONTRACTOR');
  if (types.includes('internship')) chips.push('employment_type:INTERN');
  return chips.join(',');
}

function normalizeJob(raw, index) {
  const extensions = raw.detected_extensions || {};
  return {
    id: `serp-${Date.now()}-${index}`,
    title: raw.title || '',
    company: raw.company_name || '',
    location: raw.location || '',
    platform: 'Google Jobs',
    url: raw.share_link || raw.related_links?.[0]?.link || '',
    job_type: extensions.schedule_type || '',
    salary: extensions.salary || raw.salary || '',
    description: (raw.description || '').substring(0, 2000),
    posted_date: extensions.posted_at || '',
    applicants: '',
  };
}

export default { searchSerpAPI, getFreshnessChip, getJobTypeChips };
