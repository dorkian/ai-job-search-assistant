import { useRef } from 'react';
import useStore from '../store/useStore.js';
import api from '../api/client.js';

export default function CVEditor() {
  const { cv, setCV, cvAnalysis, setCVAnalysis, darkMode } = useStore();
  const fileRef = useRef();

  const handleSave = async () => {
    await api.saveCV(cv);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { text } = await api.uploadCV(file);
      setCV(text);
      await api.saveCV(text);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleAnalyze = async () => {
    if (!cv.trim()) return alert('Please enter your CV first');
    try {
      const analysis = await api.analyzeCV(cv);
      setCVAnalysis(analysis);
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border p-6" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <h2 className="text-lg font-display font-extrabold mb-1">📄 Your CV</h2>
        <p className="text-sm mb-5" style={{ color: '#6060a0' }}>Paste your full CV or upload a PDF. AI will extract skills and match to jobs.</p>

        <textarea
          value={cv}
          onChange={(e) => setCV(e.target.value)}
          onBlur={handleSave}
          placeholder="Paste your full CV here — include skills, experience, education, achievements..."
          className="w-full rounded-xl border p-4 text-sm leading-relaxed resize-y"
          style={{ background: 'var(--surface-2)', borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: 'inherit', height: 400 }}
        />

        <div className="flex gap-3 mt-3 items-center">
          <input type="file" ref={fileRef} accept=".pdf" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-indigo-500/10"
            style={{ borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: '#6366f1' }}
          >
            📎 Upload PDF
          </button>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            🧠 Analyze CV
          </button>
          <button
            onClick={() => { setCV(''); api.saveCV(''); }}
            className="px-4 py-2 rounded-xl border text-sm font-semibold transition-colors"
            style={{ borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: '#6060a0' }}
          >
            🗑️ Clear
          </button>
          <span className="ml-auto text-xs" style={{ color: '#5a5a90' }}>
            {cv.length} chars · ~{Math.round(cv.split(' ').length / 250)} min read
          </span>
        </div>
      </div>

      {/* Analysis Preview */}
      {cvAnalysis && (
        <div className="rounded-2xl border p-6 mt-4" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
          <h3 className="text-sm font-bold text-indigo-400 mb-3">🧠 CV Analysis</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase" style={{ color: '#5a5a90' }}>Skills ({cvAnalysis.skills?.length || 0})</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(cvAnalysis.skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#6366f115', color: '#6366f1' }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase" style={{ color: '#5a5a90' }}>Best-fit Titles</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(cvAnalysis.jobTitles || []).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#10b98115', color: '#10b981' }}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase" style={{ color: '#5a5a90' }}>Experience</span>
              <p className="mt-1">{cvAnalysis.yearsExperience} years · {cvAnalysis.seniority}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase" style={{ color: '#5a5a90' }}>Industry</span>
              <p className="mt-1">{cvAnalysis.industry}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
