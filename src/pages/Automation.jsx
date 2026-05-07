import { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import api from '../api/client.js';

export default function Automation() {
  const { darkMode, searchHistory, jobs } = useStore();
  const [autoStatus, setAutoStatus] = useState(null);
  const [interval, setInterval_] = useState(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAutoStatus().then((s) => {
      setAutoStatus(s);
      if (s.intervalHours) setInterval_(s.intervalHours);
    }).catch(() => {});
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await api.enableAuto(interval);
      const s = await api.getAutoStatus();
      setAutoStatus(s);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await api.disableAuto();
      const s = await api.getAutoStatus();
      setAutoStatus(s);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleRunNow = async () => {
    setLoading(true);
    try {
      await api.runNow();
      alert('Search completed!');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const card = `rounded-2xl border p-6 ${darkMode ? 'border-[#1e1e3a]' : 'border-[#e0e0f0]'}`;
  const isActive = autoStatus?.enabled || autoStatus?.active;

  return (
    <div>
      <div className={card} style={{ background: 'var(--surface-1)' }}>
        <h2 className="text-lg font-display font-extrabold mb-1">🤖 Automated Search</h2>
        <p className="text-sm mb-6" style={{ color: '#6060a0' }}>Set up automatic job searches. New jobs only — no duplicates.</p>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-semibold">Enable Auto-Search</span>
          <div
            onClick={isActive ? handleDisable : handleEnable}
            className="w-12 h-6 rounded-full cursor-pointer relative transition-colors"
            style={{ background: isActive ? '#6366f1' : darkMode ? '#2a2a45' : '#d0d0e0' }}
          >
            <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: isActive ? 25 : 3 }} />
          </div>
          {isActive && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#10b98120', color: '#10b981' }}>
              ● ACTIVE
            </span>
          )}
        </div>

        <div className="mb-6">
          <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: '#5a5a90' }}>
            Search every (hours)
          </label>
          <input
            type="number"
            min={1}
            max={168}
            value={interval}
            onChange={(e) => setInterval_(parseInt(e.target.value) || 24)}
            className="rounded-xl border px-3 py-2 text-sm w-32"
            style={{ background: 'var(--surface-2)', borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: 'inherit' }}
          />
          {autoStatus?.lastRun && (
            <p className="text-xs mt-2" style={{ color: '#5a5a90' }}>Last run: {new Date(autoStatus.lastRun).toLocaleString()}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRunNow}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {loading ? '⏳ Running...' : '🔄 Run Now'}
          </button>
        </div>
      </div>

      <div className={`${card} mt-4`} style={{ background: 'var(--surface-1)' }}>
        <h3 className="text-sm font-bold text-indigo-400 mb-4">📊 Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Total Searches', searchHistory?.length || 0],
            ['Jobs Found', jobs?.length || 0],
            ['Applications', '—'],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-2)' }}>
              <div className="text-2xl font-extrabold text-indigo-400">{v}</div>
              <div className="text-[11px] mt-1" style={{ color: '#5a5a90' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
