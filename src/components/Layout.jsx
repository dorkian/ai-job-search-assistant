import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import useSearch from '../hooks/useSearch.js';
import api from '../api/client.js';

const NAV_ITEMS = [
  { path: '/', label: '🔍 Search' },
  { path: '/cv', label: '📄 CV' },
  { path: '/settings', label: '⚙️ Settings' },
  { path: '/results', label: '📊 Results' },
  { path: '/tracker', label: '🗂️ Tracker' },
  { path: '/insights', label: '📈 Insights' },
  { path: '/history', label: '📜 History' },
  { path: '/automation', label: '🤖 Auto' },
];

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode, isSearching, jobs, setCV, setCVAnalysis, setSettings, setJobs } = useStore();
  const { runSearch } = useSearch();
  const location = useLocation();

  // Load initial data from server
  useEffect(() => {
    (async () => {
      try {
        const cvData = await api.getCV();
        if (cvData.cv_text) {
          setCV(cvData.cv_text);
          if (cvData.skills?.length) {
            setCVAnalysis({
              skills: cvData.skills,
              jobTitles: cvData.titles,
              yearsExperience: cvData.yearsExperience,
              seniority: cvData.seniority,
              industry: cvData.industry,
            });
          }
        }
        const settings = await api.getSettings();
        if (settings && Object.keys(settings).length) setSettings(settings);
        const existingJobs = await api.getJobs();
        if (existingJobs?.length) setJobs(existingJobs);
      } catch {}
    })();
  }, []);

  return (
    <div className={`min-h-screen font-body ${darkMode ? 'dark' : ''}`} style={{ background: 'var(--surface-0)', color: darkMode ? '#e0e0ff' : '#1a1a2e' }}>
      {/* Header */}
      <header className="border-b px-3 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg border transition-colors"
          style={{ borderColor: darkMode ? '#2a2a45' : '#e0e0f0' }}
        >
          ☰
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-xl font-display font-extrabold bg-gradient-to-r from-indigo-500 via-purple-400 to-sky-400 bg-clip-text text-transparent truncate">
            ⚡ AI Job Search
          </h1>
          <p className="text-xs mt-0.5 hidden md:block" style={{ color: darkMode ? '#5a5a90' : '#9090b0' }}>
            Powered by Claude AI · Real-time job matching
          </p>
        </div>
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          {jobs.length > 0 && (
            <span className="text-xs px-2 md:px-3 py-1 rounded-full font-semibold hidden sm:inline-block" style={{ background: '#6366f120', color: '#6366f1' }}>
              {jobs.length}
            </span>
          )}
          <button onClick={toggleDarkMode} className="p-1.5 md:px-3 md:py-2 rounded-lg text-sm border transition-colors" style={{ borderColor: darkMode ? '#2a2a45' : '#e0e0f0' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => runSearch().catch((e) => alert(e.message))}
            disabled={isSearching}
            className="px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl text-white text-xs md:text-sm font-bold transition-all disabled:opacity-60 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {isSearching ? (
              <span className="flex items-center gap-1"><span className="spinner" /> <span className="hidden md:inline">Searching...</span></span>
            ) : <span className="md:inline">🚀 <span className="hidden sm:inline">Run Search</span></span>}
          </button>
        </div>
      </header>

      {/* Desktop Nav */}
      <nav className="hidden md:flex border-b px-4 gap-0 overflow-x-auto text-sm" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-3.5 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-indigo-300'
              }`
            }
            style={{ color: location.pathname === item.path ? '#6366f1' : darkMode ? '#5a5a90' : '#8080b0' }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
          <nav className="flex flex-col px-3 py-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-300'
                  }`
                }
                style={{ color: location.pathname === item.path ? '#6366f1' : darkMode ? '#5a5a90' : '#8080b0', background: location.pathname === item.path ? darkMode ? '#2a2a45' : '#e8e8ff' : 'transparent' }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 md:px-5 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
}
