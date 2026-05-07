import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';
import { Badge } from '../components/ui.jsx';
import api from '../api/client.js';

export default function History() {
  const { searchHistory, setSearchHistory, setJobs, darkMode } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    api.getHistory().then(setSearchHistory).catch(() => {});
  }, []);

  const handleLoadSearch = async (search) => {
    setLoading(search.id);
    try {
      const jobs = await api.getJobsBySearch(search.id);
      setJobs(jobs);
      navigate('/results');
    } catch (err) {
      console.error('Failed to load search:', err);
    } finally {
      setLoading(null);
    }
  };

  if (!searchHistory.length) {
    return (
      <div className="rounded-2xl border p-16 text-center" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <div className="text-5xl mb-4">📜</div>
        <p style={{ color: '#6060a0' }}>No search history yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-display font-extrabold mb-5">📜 Search History</h2>
      {searchHistory.map((h) => (
        <div
          key={h.id}
          onClick={() => handleLoadSearch(h)}
          disabled={loading === h.id}
          className="rounded-2xl border p-5 mb-3 flex justify-between items-center cursor-pointer transition-all hover:shadow-md"
          style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0', opacity: loading === h.id ? 0.6 : 1 }}
        >
          <div>
            <div className="font-bold text-sm">{new Date(h.created_at).toLocaleString()}</div>
            <div className="text-xs mt-1" style={{ color: '#5a5a90' }}>{h.cv_summary || h.query}</div>
          </div>
          <Badge label={loading === h.id ? 'Loading...' : `${h.job_count} jobs`} bg="#6366f120" color="#6366f1" />
        </div>
      ))}
    </div>
  );
}
