const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── CV ──────────────────────────────────────────────────────────────────────
export const api = {
  // CV
  getCV: () => request('/cv'),
  saveCV: (cv_text) => request('/cv', { method: 'PUT', body: JSON.stringify({ cv_text }) }),
  analyzeCV: (cv_text) => request('/cv/analyze', { method: 'POST', body: JSON.stringify({ cv_text }) }),
  uploadCV: async (file) => {
    const form = new FormData();
    form.append('cv', file);
    const res = await fetch(`${BASE}/cv/upload`, { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  // Jobs
  getJobs: (limit = 50) => request(`/jobs?limit=${limit}`),
  getJobsBySearch: (searchId) => request(`/jobs/search/${searchId}`),
  searchJobs: (settings, cvAnalysis, cv_text) =>
    request('/jobs/search', { method: 'POST', body: JSON.stringify({ settings, cvAnalysis, cv_text }) }),

  // Actions
  coverLetter: (job_id, language) =>
    request('/actions/cover-letter', { method: 'POST', body: JSON.stringify({ job_id, language }) }),
  interviewPrep: (job_id) =>
    request('/actions/interview-prep', { method: 'POST', body: JSON.stringify({ job_id }) }),
  jobSpec: (job_id) =>
    request('/actions/job-spec', { method: 'POST', body: JSON.stringify({ job_id }) }),
  cvOptimize: (job_id) =>
    request('/actions/cv-optimize', { method: 'POST', body: JSON.stringify({ job_id }) }),

  // Applications
  getApplications: () => request('/actions/applications'),
  updateStatus: (jobId, status) =>
    request(`/actions/applications/${jobId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateNotes: (jobId, notes) =>
    request(`/actions/applications/${jobId}/notes`, { method: 'PUT', body: JSON.stringify({ notes }) }),
  updateTags: (jobId, tags) =>
    request(`/actions/applications/${jobId}/tags`, { method: 'PUT', body: JSON.stringify({ tags }) }),
  updateFollowUp: (jobId, date) =>
    request(`/actions/applications/${jobId}/follow-up`, { method: 'PUT', body: JSON.stringify({ date }) }),
  deleteApplication: (jobId) =>
    request(`/actions/applications/${jobId}`, { method: 'DELETE' }),

  // Insights
  marketInsights: (jobs, searchId) =>
    request('/insights/market', { method: 'POST', body: JSON.stringify({ jobs, searchId }) }),
  gapAnalysis: (cvSkills, jobs, searchId) =>
    request('/insights/gap', { method: 'POST', body: JSON.stringify({ cvSkills, jobs, searchId }) }),
  getLatestInsights: () => request('/insights/latest'),

  // Automation
  getAutoStatus: () => request('/automation/status'),
  enableAuto: (intervalHours) =>
    request('/automation/enable', { method: 'POST', body: JSON.stringify({ intervalHours }) }),
  disableAuto: () => request('/automation/disable', { method: 'POST' }),
  runNow: () => request('/automation/run-now', { method: 'POST' }),
  getHistory: (limit = 20) => request(`/automation/history?limit=${limit}`),
  getSettings: () => request('/automation/settings'),
  saveSettings: (settings) =>
    request('/automation/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),

  // Health
  health: () => request('/health'),
};

export default api;
