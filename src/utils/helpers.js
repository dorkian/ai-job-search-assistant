// ─── Job Types ──────────────────────────────────────────────────────────────
export const JOB_TYPES = [
  { id: 'full-remote', label: '🏠 Full Remote', color: '#10b981' },
  { id: 'hybrid', label: '🔀 Hybrid', color: '#3b82f6' },
  { id: 'onsite', label: '🏢 On-site', color: '#8b5cf6' },
  { id: 'b2b-contract', label: '📄 B2B Contract', color: '#f59e0b' },
  { id: 'permanent', label: '🔁 Permanent', color: '#6366f1' },
  { id: 'part-time', label: '⏳ Part-time', color: '#ec4899' },
  { id: 'freelance', label: '🚀 Freelance', color: '#14b8a6' },
  { id: 'internship', label: '🧪 Internship', color: '#f97316' },
];

export const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'C-Level'];

export const FRESHNESS_OPTIONS = ['24h', '48h', '72h', '1 week'];

export const PLATFORMS = ['LinkedIn', 'Indeed', 'Glassdoor', 'Remotive', 'WeWorkRemotely', 'AngelList'];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PLN', 'CHF', 'SEK', 'NOK', 'JPY', 'INR'];

export const SORT_OPTIONS = [
  { id: 'overall', label: 'Overall Grade', key: 'overall_score' },
  { id: 'skills', label: 'Skills Match', key: 'skills_match' },
  { id: 'experience', label: 'Experience Fit', key: 'experience_fit' },
  { id: 'salary', label: 'Salary Alignment', key: 'salary_alignment' },
  { id: 'industry', label: 'Industry Relevance', key: 'industry_relevance' },
  { id: 'location', label: 'Location/Type Fit', key: 'location_fit' },
  { id: 'growth', label: 'Growth Potential', key: 'growth_potential' },
];

export const KANBAN_COLUMNS = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export const KANBAN_COLORS = {
  Saved: '#3b82f6',
  Applied: '#8b5cf6',
  Interview: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444',
};

export const QUICK_TAGS = ['dream job', 'backup', 'urgent', 'follow up', 'referral needed', 'negotiable'];

// ─── Grade Helpers ──────────────────────────────────────────────────────────

export function getGradeColor(grade) {
  if (!grade) return '#6b7280';
  const map = {
    'A+': '#059669', A: '#10b981', 'A-': '#34d399',
    'B+': '#2563eb', B: '#3b82f6', 'B-': '#60a5fa',
    'C+': '#d97706', C: '#f59e0b', 'C-': '#fbbf24',
    D: '#ea580c', F: '#dc2626',
  };
  return map[grade] || '#6b7280';
}

export function getChanceConfig(chance) {
  const map = {
    '🔥 Hot': { bg: 'bg-orange-600', text: 'text-white' },
    '✅ High': { bg: 'bg-emerald-600', text: 'text-white' },
    '⚠️ Medium': { bg: 'bg-amber-500', text: 'text-black' },
    '❌ Low': { bg: 'bg-red-600', text: 'text-white' },
  };
  return map[chance] || { bg: 'bg-gray-600', text: 'text-white' };
}

// ─── Sort / Filter ──────────────────────────────────────────────────────────

export function sortJobs(jobs, sortBy, sortDir) {
  const opt = SORT_OPTIONS.find((s) => s.id === sortBy);
  const key = opt?.key || 'overall_score';

  return [...jobs].sort((a, b) => {
    const aVal = a[key] || 0;
    const bVal = b[key] || 0;
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });
}

export function filterJobs(jobs, filterGrade, filterType) {
  return jobs
    .filter((j) => filterGrade === 'all' || (j.grade || '').startsWith(filterGrade))
    .filter((j) => filterType === 'all' || (j.job_type || '').toLowerCase().includes(filterType.toLowerCase()));
}

// ─── Export ─────────────────────────────────────────────────────────────────

export function exportJobsCSV(jobs) {
  const headers = ['Title', 'Company', 'Location', 'Platform', 'Grade', 'Overall', 'Skills Match', 'Experience', 'Salary', 'Interview Chance', 'URL'];
  const rows = jobs.map((j) => [
    j.title, j.company, j.location, j.platform, j.grade, j.overall_score,
    j.skills_match, j.experience_fit, j.salary, j.interview_chance, j.url,
  ].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `jobs-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
