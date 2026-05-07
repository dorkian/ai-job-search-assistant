export const MARKET_INSIGHTS_SYSTEM = `You are a labor market analyst. You analyze job postings to extract market trends, salary data, and hiring patterns. Be data-driven and specific.`;

export function marketInsightsPrompt(jobs) {
  return `Analyze these ${jobs.length} job postings and generate market insights.

JOBS:
${JSON.stringify(jobs.map(j => ({
  title: j.title, company: j.company, location: j.location,
  salary: j.salary, job_type: j.job_type, skills_required: j.missing_skills,
  description: (j.description || '').substring(0, 300),
})), null, 1)}

Return a JSON object:
{
  "topSkills": [
    { "skill": "React", "count": 8, "trend": "growing" }
  ],
  "salaryRange": {
    "min": 80000, "max": 180000, "avg": 120000,
    "currency": "USD",
    "note": "Based on 6 postings with salary data"
  },
  "topCompanies": ["Company A", "Company B"],
  "topLocations": ["Remote", "New York"],
  "hotJobTitles": ["Senior Frontend Developer", "Full Stack Engineer"],
  "marketSummary": "Brief 2-sentence market overview",
  "hiringTrends": ["Trend 1", "Trend 2", "Trend 3"]
}`;
}
