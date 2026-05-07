import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import api from '../api/client.js';
import { KANBAN_COLUMNS, KANBAN_COLORS } from '../utils/helpers.js';

export default function Tracker() {
  const { applications, setApplications, darkMode } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications().then(setApplications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const grouped = {};
  KANBAN_COLUMNS.forEach((col) => { grouped[col] = []; });
  (applications || []).forEach((app) => {
    const col = app.status || 'Saved';
    if (grouped[col]) grouped[col].push(app);
  });

  const moveApp = async (app, newStatus) => {
    await api.updateStatus(app.job_id, newStatus).catch(() => {});
    const updated = await api.getApplications();
    setApplications(updated);
  };

  if (loading) return <div className="text-center py-20"><span className="spinner" /></div>;

  return (
    <div>
      <h2 className="text-lg font-display font-extrabold mb-5">🗂️ Application Tracker</h2>
      <div className="grid grid-cols-5 gap-3" style={{ minHeight: 400 }}>
        {KANBAN_COLUMNS.map((col) => (
          <div key={col} className="rounded-2xl border p-4" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: KANBAN_COLORS[col] }} />
              <span className="text-sm font-bold">{col}</span>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--surface-2)', color: '#5a5a90' }}>
                {grouped[col].length}
              </span>
            </div>
            {grouped[col].map((app) => (
              <div key={app.job_id} className="rounded-xl border p-3 mb-2 text-xs" style={{ background: 'var(--surface-2)', borderColor: darkMode ? '#2a2a45' : '#d0d0e0' }}>
                <div className="font-bold mb-1">{app.title}</div>
                <div style={{ color: '#5a5a90' }}>{app.company}</div>
                {app.grade && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: KANBAN_COLORS[col] }}>
                    {app.grade} · {app.overall_score}
                  </span>
                )}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {KANBAN_COLUMNS.filter((c) => c !== col).map((c) => (
                    <button
                      key={c}
                      onClick={() => moveApp(app, c)}
                      className="px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors hover:opacity-80"
                      style={{ borderColor: KANBAN_COLORS[c], color: KANBAN_COLORS[c] }}
                    >
                      → {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {grouped[col].length === 0 && (
              <div className="text-center py-8 text-xs" style={{ color: '#5a5a90' }}>No jobs</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
