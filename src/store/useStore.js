import { create } from 'zustand';

const DEFAULT_SETTINGS = {
  country: '',
  city: '',
  language: 'English',
  jobTypes: ['full-remote'],
  experienceLevel: 'Senior',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  industries: '',
  excludeIndustries: '',
  platforms: ['LinkedIn', 'Indeed', 'Glassdoor'],
  freshness: '48h',
  resultCount: 10,
  autoEnabled: false,
  autoInterval: 24,
};

export const useStore = create((set, get) => ({
  // ─── Theme ─────────────────────────────────────────────────────
  darkMode: true,
  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    document.documentElement.classList.toggle('dark', next);
  },

  // ─── CV ────────────────────────────────────────────────────────
  cv: '',
  cvAnalysis: null,
  setCV: (cv) => set({ cv }),
  setCVAnalysis: (cvAnalysis) => set({ cvAnalysis }),

  // ─── Settings ──────────────────────────────────────────────────
  settings: { ...DEFAULT_SETTINGS },
  updateSetting: (key, value) =>
    set((s) => ({ settings: { ...s.settings, [key]: value } })),
  setSettings: (settings) => set({ settings }),

  // ─── Jobs ──────────────────────────────────────────────────────
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  appendJobs: (newJobs) =>
    set((s) => {
      const existingIds = new Set(s.jobs.map((j) => j.id));
      const unique = newJobs.filter((j) => !existingIds.has(j.id));
      return { jobs: [...unique, ...s.jobs] };
    }),

  // ─── Search ────────────────────────────────────────────────────
  isSearching: false,
  progress: [],
  setIsSearching: (v) => set({ isSearching: v }),
  addProgress: (msg) =>
    set((s) => ({
      progress: [...s.progress, { msg, time: new Date().toLocaleTimeString() }],
    })),
  clearProgress: () => set({ progress: [] }),

  // ─── Sorting / Filtering ──────────────────────────────────────
  sortBy: 'overall',
  sortDir: 'desc',
  filterGrade: 'all',
  filterType: 'all',
  setSortBy: (v) => set({ sortBy: v }),
  toggleSortDir: () => set((s) => ({ sortDir: s.sortDir === 'desc' ? 'asc' : 'desc' })),
  setFilterGrade: (v) => set({ filterGrade: v }),
  setFilterType: (v) => set({ filterType: v }),

  // ─── Applications ──────────────────────────────────────────────
  applications: [],
  setApplications: (v) => set({ applications: v }),

  // ─── Insights ──────────────────────────────────────────────────
  marketInsights: null,
  gapAnalysis: null,
  setMarketInsights: (v) => set({ marketInsights: v }),
  setGapAnalysis: (v) => set({ gapAnalysis: v }),

  // ─── History ───────────────────────────────────────────────────
  searchHistory: [],
  setSearchHistory: (v) => set({ searchHistory: v }),

  // ─── Automation ────────────────────────────────────────────────
  autoStatus: null,
  setAutoStatus: (v) => set({ autoStatus: v }),

  // ─── Active Action (per-job) ───────────────────────────────────
  activeAction: null, // { jobId, action, content, loading }
  setActiveAction: (v) => set({ activeAction: v }),
}));

export default useStore;
