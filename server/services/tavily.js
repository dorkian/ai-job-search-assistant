/**
 * Tavily Job Search Service
 * Docs: https://docs.tavily.com
 */

const TAVILY_BASE = 'https://api.tavily.com';

/**
 * Search for jobs via Tavily
 * @param {object} params
 * @param {string} params.query - Search query
 * @param {number} [params.maxResults=10] - Max results
 * @param {string} [params.days] - Freshness in days ("1", "3", "7")
 * @returns {Promise<Array>} Normalized job objects
 */
export async function searchTavily({ query, maxResults = 10, days }) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('[Tavily] No API key set, skipping');
    return [];
  }

  try {
    const body = {
      api_key: apiKey,
      query,
      max_results: maxResults,
      search_depth: 'advanced',
      include_domains: [
        'linkedin.com/jobs',
        'indeed.com',
        'glassdoor.com',
        'remotive.com',
        'weworkremotely.com',
        'wellfound.com',
      ],
    };

    if (days) body.days = parseInt(days);

    const res = await fetch(`${TAVILY_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[Tavily] HTTP ${res.status}: ${await res.text()}`);
      return [];
    }

    const data = await res.json();
    const results = data.results || [];

    return results.map((r, i) => normalizeResult(r, i));
  } catch (err) {
    console.error('[Tavily] Error:', err.message);
    return [];
  }
}

/**
 * Convert freshness string to days number
 * @param {string} freshness - "24h" | "48h" | "72h" | "1 week"
 * @returns {string}
 */
export function freshnessToDays(freshness) {
  const map = { '24h': '1', '48h': '2', '72h': '3', '1 week': '7' };
  return map[freshness] || '3';
}

function normalizeResult(raw, index) {
  // Extract platform from URL
  let platform = 'Web';
  const url = raw.url || '';
  if (url.includes('linkedin.com')) platform = 'LinkedIn';
  else if (url.includes('indeed.com')) platform = 'Indeed';
  else if (url.includes('glassdoor.com')) platform = 'Glassdoor';
  else if (url.includes('remotive.com')) platform = 'Remotive';
  else if (url.includes('weworkremotely.com')) platform = 'WeWorkRemotely';
  else if (url.includes('wellfound.com')) platform = 'AngelList';

  // Try to parse title and company from result title
  const titleParts = (raw.title || '').split(' - ');
  const jobTitle = titleParts[0]?.trim() || raw.title || '';
  const company = titleParts[1]?.trim() || '';

  return {
    id: `tav-${Date.now()}-${index}`,
    title: jobTitle,
    company,
    location: '',
    platform,
    url,
    job_type: '',
    salary: '',
    description: (raw.content || '').substring(0, 2000),
    posted_date: raw.published_date || '',
    applicants: '',
  };
}

export default { searchTavily, freshnessToDays };
