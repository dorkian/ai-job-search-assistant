import useStore from '../store/useStore.js';
import JobCard from '../components/JobCard.jsx';
import { SearchProgress } from '../components/ui.jsx';
import { SORT_OPTIONS, JOB_TYPES, sortJobs, filterJobs, exportJobsCSV } from '../utils/helpers.js';

export default function Results() {
  const {
    jobs, isSearching, progress, darkMode,
    sortBy, setSortBy, sortDir, toggleSortDir,
    filterGrade, setFilterGrade, filterType, setFilterType,
  } = useStore();

  const displayed = sortJobs(filterJobs(jobs, filterGrade, filterType), sortBy, sortDir);

  const select = `rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${darkMode ? 'bg-[#161630] border-[#2a2a45]' : 'bg-[#f8f8ff] border-[#d0d0e0]'}`;

  return (
    <div>
      {/* Controls */}
      <div className="rounded-2xl border p-3 md:p-4 mb-4 flex gap-2 md:gap-3 items-center flex-wrap" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] md:text-[11px] font-semibold uppercase hidden sm:inline" style={{ color: '#5a5a90' }}>Sort:</span>
          <select className={select} value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ color: 'inherit' }}>
            {SORT_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <button onClick={toggleSortDir} className={`${select} cursor-pointer text-xs md:text-sm`} style={{ color: 'inherit' }}>
          {sortDir === 'desc' ? '↓' : '↑'}
          <span className="hidden sm:inline ml-1">{sortDir === 'desc' ? 'Highest' : 'Lowest'}</span>
        </button>
        <select className={select} value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={{ color: 'inherit' }}>
          <option value="all">Grades</option>
          {['A', 'B', 'C', 'D', 'F'].map((g) => <option key={g} value={g}>Grade {g}+</option>)}
        </select>
        <select className={select} value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ color: 'inherit' }}>
          <option value="all">Types</option>
          {JOB_TYPES.map((jt) => <option key={jt.id} value={jt.id}>{jt.label}</option>)}
        </select>
        <button
          onClick={() => exportJobsCSV(displayed)}
          className={`${select} ml-auto cursor-pointer hover:text-indigo-400 text-xs md:text-sm`}
          style={{ color: '#6060a0' }}
        >
          <span className="hidden sm:inline">📥 Export CSV</span>
          <span className="sm:hidden">📥</span>
        </button>
        <span className="text-xs w-full text-right sm:w-auto" style={{ color: '#5a5a90' }}>{displayed.length}</span>
      </div>

      <SearchProgress progress={progress} isSearching={isSearching} />

      {!isSearching && displayed.length === 0 && (
        <div className="rounded-2xl border p-16 text-center" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
          <div className="text-5xl mb-4">🔍</div>
          <p style={{ color: '#6060a0' }}>No jobs yet. Click <strong className="text-indigo-400">Run Search</strong> to find matching jobs.</p>
        </div>
      )}

      {displayed.map((job) => <JobCard key={job.id} job={job} />)}
    </div>
  );
}
