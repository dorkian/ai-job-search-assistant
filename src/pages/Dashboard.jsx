import useStore from '../store/useStore.js';
import { SearchProgress } from '../components/ui.jsx';

export default function Dashboard() {
  const { cv, settings, jobs, progress, isSearching, darkMode } = useStore();
  const card = `rounded-2xl border p-4 md:p-6 ${darkMode ? 'border-[#1e1e3a]' : 'border-[#e0e0f0]'}`;

  return (
    <div>
      <div className="text-center py-6 md:py-10 px-3">
        <h2 className="text-2xl md:text-3xl font-display font-extrabold bg-gradient-to-r from-indigo-500 via-purple-400 to-sky-400 bg-clip-text text-transparent">
          Find Your Perfect Job
        </h2>
        <p className="text-xs md:text-sm mt-2" style={{ color: '#6060a0' }}>AI-powered job matching with grade scoring across 6 dimensions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Quick Status */}
        <div className={card} style={{ background: 'var(--surface-1)' }}>
          <h3 className="text-sm font-bold text-indigo-400 mb-4">📋 Quick Status</h3>
          {[
            { label: 'CV', status: cv.trim() ? '✅ Ready' : '⚠️ Missing', ok: !!cv.trim() },
            { label: 'Country', status: settings.country || '⚠️ Not set', ok: !!settings.country },
            { label: 'Job Types', status: `${settings.jobTypes?.length || 0} selected`, ok: (settings.jobTypes?.length || 0) > 0 },
            { label: 'Jobs Found', status: `${jobs.length} total`, ok: jobs.length > 0 },
          ].map(({ label, status, ok }) => (
            <div key={label} className="flex justify-between py-1.5 md:py-2 border-b text-xs md:text-sm" style={{ borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
              <span style={{ color: '#6060a0' }}>{label}</span>
              <span className="font-semibold" style={{ color: ok ? '#10b981' : '#f59e0b' }}>{status}</span>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className={card} style={{ background: 'var(--surface-1)' }}>
          <h3 className="text-sm font-bold text-indigo-400 mb-4">🔁 How It Works</h3>
          {[
            'Enter your CV in the CV tab',
            'Configure settings (country, job type, salary...)',
            'Click Run Search — AI finds & grades jobs',
            'Review results sorted by match grade',
            'Use per-job actions: cover letter, interview prep...',
          ].map((step, i) => (
            <div key={i} className="flex gap-3 mb-2.5 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <SearchProgress progress={progress} isSearching={isSearching} />

      {/* Grade legend */}
      <div className={`${card} mt-3 md:mt-4`} style={{ background: 'var(--surface-1)' }}>
        <h3 className="text-xs md:text-sm font-bold text-indigo-400 mb-3 md:mb-4">🏆 Grading System</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 text-xs">
          {[
            ['🎯 Skills Match', '30%'],
            ['📈 Experience Fit', '20%'],
            ['💰 Salary Alignment', '15%'],
            ['🏢 Industry Relevance', '15%'],
            ['📍 Location/Type Fit', '10%'],
            ['🚀 Growth Potential', '10%'],
          ].map(([d, w]) => (
            <div key={d} style={{ color: '#6060a0' }}>
              <span className="font-semibold" style={{ color: 'inherit' }}>{d}</span> · {w}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
