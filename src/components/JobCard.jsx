import { useState, useEffect } from 'react';
import { GradeCircle, ScoreBar, Badge, ActionPanel } from './ui.jsx';
import { getGradeColor, getChanceConfig, KANBAN_COLUMNS, KANBAN_COLORS, QUICK_TAGS } from '../utils/helpers.js';
import useStore from '../store/useStore.js';
import useJobActions from '../hooks/useJobActions.js';
import api from '../api/client.js';

const DIMENSIONS = [
  { key: 'skills_match', label: '🎯 Skills', color: '#6366f1' },
  { key: 'experience_fit', label: '📈 Exp', color: '#8b5cf6' },
  { key: 'salary_alignment', label: '💰 Salary', color: '#10b981' },
  { key: 'industry_relevance', label: '🏢 Industry', color: '#f59e0b' },
  { key: 'location_fit', label: '📍 Location', color: '#3b82f6' },
  { key: 'growth_potential', label: '🚀 Growth', color: '#ec4899' },
];

const ACTIONS = [
  { id: 'cover-letter', label: '📝 Cover Letter', color: '#6366f1', title: '📝 Cover Letter' },
  { id: 'interview-prep', label: '🎯 Interview Prep', color: '#8b5cf6', title: '🎯 Interview Preparation' },
  { id: 'job-spec', label: '📋 Job Spec', color: '#f59e0b', title: '📋 Job Specification Analysis' },
  { id: 'cv-optimize', label: '🔄 CV Optimizer', color: '#10b981', title: '🔄 CV Optimization' },
];

export default function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState(null);
  const [followUp, setFollowUp] = useState('');
  const { activeAction } = useStore();
  const { runAction, clearAction } = useJobActions();
  const { darkMode } = useStore();

  const chance = getChanceConfig(job.interview_chance);
  const isActiveJob = activeAction?.jobId === job.id;

  useEffect(() => {
    if (isActiveJob && !activeAction.loading && activeAction.content) setShowAction(true);
  }, [activeAction, isActiveJob]);

  const handleAction = async (actionId) => {
    setShowAction(true);
    await runAction(job.id, actionId);
  };

  const handleStatusChange = async (col) => {
    const next = status === col ? null : col;
    setStatus(next);
    if (next) {
      await api.updateStatus(job.id, next).catch(() => {});
    }
  };

  return (
    <div
      className="rounded-2xl border p-3 md:p-5 mb-3 transition-all hover:border-indigo-500/50 hover:-translate-y-0.5"
      style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0', boxShadow: 'none' }}
    >
      {/* Top row */}
      <div className="flex gap-2 md:gap-3.5 items-start">
        <GradeCircle grade={job.grade} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 md:gap-2 flex-wrap mb-1">
            <h3 className="text-sm md:text-[15px] font-bold">{job.title || 'Job Title'}</h3>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[11px] font-bold ${chance.bg} ${chance.text}`}>
              {job.interview_chance}
            </span>
            {status && <Badge label={`📂 ${status}`} bg={`${KANBAN_COLORS[status]}20`} color={KANBAN_COLORS[status]} />}
          </div>
          <div className="flex gap-2 md:gap-3 flex-wrap text-[11px] md:text-[13px]" style={{ color: darkMode ? '#6060a0' : '#8080b0' }}>
            <span className="truncate">🏢 {job.company}</span>
            <span className="hidden sm:inline">📍 {job.location}</span>
            <span className="hidden md:inline">🌐 {job.platform}</span>
            {job.job_type && <span className="hidden md:inline">💼 {job.job_type}</span>}
            {job.salary && <span className="text-emerald-400 font-semibold hidden md:inline">💰 {job.salary}</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl md:text-2xl font-black font-mono" style={{ color: getGradeColor(job.grade) }}>
            {job.overall_score || 0}
          </div>
          <div className="text-[8px] md:text-[10px]" style={{ color: '#5a5a90' }}>/ 100</div>
        </div>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-1.5 mt-2 md:mt-3.5">
        {DIMENSIONS.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex justify-between text-[9px] md:text-[11px] mb-1">
              <span style={{ color: darkMode ? '#5a5a90' : '#9090b0' }}>{label}</span>
              <span className="font-bold" style={{ color }}>{job[key] || 0}%</span>
            </div>
            <ScoreBar value={job[key]} color={color} />
          </div>
        ))}
      </div>

      {/* Why match */}
      {job.why_match && (
        <div className="mt-3 text-xs rounded-lg px-3 py-2 border-l-[3px]" style={{ background: '#6366f110', borderColor: '#6366f1', color: darkMode ? '#b0b0e0' : '#5050a0' }}>
          💡 {job.why_match}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {tags.map((t, i) => <Badge key={i} label={t} bg="#8b5cf620" color="#8b5cf6" />)}
        </div>
      )}

      {/* Actions row */}
      <div className="flex gap-1 md:gap-2 mt-2 md:mt-3.5 flex-wrap">
        {ACTIONS.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => handleAction(id)}
            className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold transition-all hover:-translate-y-0.5"
            style={{
              borderColor: color,
              color: isActiveJob && activeAction?.action === id ? '#fff' : color,
              background: isActiveJob && activeAction?.action === id ? color : 'transparent',
            }}
          >
            {isActiveJob && activeAction?.action === id && activeAction?.loading ? (
              <span className="flex items-center gap-1"><span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> ...</span>
            ) : <span className="hidden sm:inline">{label}</span> || <span className="sm:hidden">{label.split(' ')[0]}</span>}
          </button>
        ))}
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold transition-colors"
          style={{ borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: darkMode ? '#6060a0' : '#8080b0' }}
        >
          {expanded ? '▲' : '▼'}
          <span className="hidden sm:inline ml-1">{expanded ? 'Less' : 'More'}</span>
        </button>
        {KANBAN_COLUMNS.slice(0, 2).map((col) => (
          <button
            key={col}
            onClick={() => handleStatusChange(col)}
            className="px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg border text-[9px] md:text-xs font-semibold transition-all"
            style={{
              borderColor: KANBAN_COLORS[col],
              color: status === col ? '#fff' : KANBAN_COLORS[col],
              background: status === col ? KANBAN_COLORS[col] : 'transparent',
            }}
          >
            {col.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Action content panel */}
      {showAction && isActiveJob && (
        <ActionPanel
          title={ACTIONS.find(a => a.id === activeAction.action)?.title || ''}
          content={activeAction.content}
          loading={activeAction.loading}
          onClose={() => { setShowAction(false); clearAction(); }}
        />
      )}

      {/* Expanded section */}
      {expanded && (
        <div className="mt-2 md:mt-3.5 animate-fade-in space-y-2 md:space-y-3">
          {/* Missing skills & red flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {job.missing_skills?.length > 0 && (
              <div className="rounded-xl border p-2 md:p-3" style={{ background: '#f59e0b08', borderColor: '#f59e0b30' }}>
                <div className="text-[10px] md:text-xs font-bold text-amber-500 mb-1.5 md:mb-2">⚠️ Missing Skills</div>
                <div className="flex flex-wrap gap-1">
                  {job.missing_skills.map((s, i) => <Badge key={i} label={s} bg="#f59e0b20" color="#f59e0b" />)}
                </div>
              </div>
            )}
            {job.red_flags?.length > 0 && (
              <div className="rounded-xl border p-2 md:p-3" style={{ background: '#ef444408', borderColor: '#ef444430' }}>
                <div className="text-[10px] md:text-xs font-bold text-red-500 mb-1.5 md:mb-2">🚩 Red Flags</div>
                {job.red_flags.map((f, i) => <div key={i} className="text-[9px] md:text-xs text-red-400 mb-1">• {f}</div>)}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-[9px] md:text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#5a5a90' }}>📝 Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => api.updateNotes(job.id, notes).catch(() => {})}
              placeholder="Add your notes..."
              className="w-full mt-1 rounded-xl border p-2 md:p-3 text-[11px] md:text-xs resize-y"
              style={{ background: 'var(--surface-2)', borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: 'inherit', height: 60 }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[9px] md:text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#5a5a90' }}>🏷️ Tags</label>
            <div className="flex gap-1 flex-wrap mt-1.5">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    const next = tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t];
                    setTags(next);
                    api.updateTags(job.id, next).catch(() => {});
                  }}
                  className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[11px] font-semibold border transition-colors"
                  style={{
                    borderColor: tags.includes(t) ? '#6366f1' : darkMode ? '#2a2a45' : '#d0d0e0',
                    color: tags.includes(t) ? '#6366f1' : '#6060a0',
                    background: tags.includes(t) ? '#6366f115' : 'transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up + link */}
          <div className="flex flex-col gap-2 md:gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="text-[9px] md:text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#5a5a90' }}>📅 Follow-up</label>
              <input
                type="date"
                value={followUp}
                onChange={(e) => { setFollowUp(e.target.value); api.updateFollowUp(job.id, e.target.value).catch(() => {}); }}
                className="block mt-1 rounded-lg border px-2 md:px-2.5 py-1 md:py-1.5 text-[11px] md:text-xs w-full md:w-auto"
                style={{ background: 'var(--surface-2)', borderColor: darkMode ? '#2a2a45' : '#d0d0e0', color: 'inherit' }}
              />
            </div>
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs text-indigo-400 underline">
                🔗 <span className="hidden sm:inline">View Original Posting</span><span className="sm:hidden">Posting</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
