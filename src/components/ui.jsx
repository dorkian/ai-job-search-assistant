import { getGradeColor } from '../utils/helpers.js';

// ─── Grade Circle ────────────────────────────────────────────────────────────
export function GradeCircle({ grade, size = 48 }) {
  const color = getGradeColor(grade);
  return (
    <div
      className="flex items-center justify-center rounded-full font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 12px ${color}60`, fontSize: size * 0.3 }}
    >
      {grade || '?'}
    </div>
  );
}

// ─── Score Bar ───────────────────────────────────────────────────────────────
export function ScoreBar({ value = 0, color = '#6366f1', height = 6 }) {
  return (
    <div className="w-full rounded overflow-hidden" style={{ background: '#1a1a2e', height }}>
      <div
        className="rounded transition-all duration-1000"
        style={{ width: `${Math.min(100, value)}%`, background: color, height: '100%' }}
      />
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ label, bg = '#2a2a3e', color = '#a0a0c0' }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

// ─── Action Panel ────────────────────────────────────────────────────────────
export function ActionPanel({ title, content, loading, onClose }) {
  return (
    <div className="mt-3 rounded-xl border p-4" style={{ background: 'var(--surface-2)', borderColor: '#2a2a45' }}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-indigo-400">{title}</span>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(content || '')}
            className="px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors hover:bg-indigo-500/10"
            style={{ borderColor: '#2a2a45', color: '#6060a0' }}
          >
            📋 Copy
          </button>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors hover:bg-red-500/10"
            style={{ borderColor: '#2a2a45', color: '#6060a0' }}
          >
            ✕
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-6"><span className="spinner" /></div>
      ) : (
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-body" style={{ color: 'inherit' }}>
          {content}
        </pre>
      )}
    </div>
  );
}

// ─── Search Progress ─────────────────────────────────────────────────────────
export function SearchProgress({ progress, isSearching }) {
  if (!progress.length) return null;
  return (
    <div className="rounded-2xl border p-5 mb-4" style={{ background: 'var(--surface-1)', borderColor: '#1e1e3a' }}>
      <h3 className="text-sm font-bold text-indigo-400 mb-3">⚡ Search Progress</h3>
      {progress.map((p, i) => (
        <div key={i} className="flex gap-3 py-1.5 border-b text-sm animate-fade-in" style={{ borderColor: '#1e1e3a' }}>
          <span className="font-mono text-xs" style={{ color: '#5a5a90' }}>{p.time}</span>
          <span>{p.msg}</span>
        </div>
      ))}
      {isSearching && (
        <div className="flex items-center gap-2 pt-2 text-sm" style={{ color: '#5a5a90' }}>
          <span className="spinner" /> Working...
        </div>
      )}
    </div>
  );
}
