import { useEffect } from 'react';
import useStore from '../store/useStore.js';
import { ScoreBar, Badge } from '../components/ui.jsx';
import api from '../api/client.js';

export default function Insights() {
  const { marketInsights, gapAnalysis, setMarketInsights, setGapAnalysis, darkMode } = useStore();

  useEffect(() => {
    api.getLatestInsights().then(({ market, gap }) => {
      if (market) setMarketInsights(market);
      if (gap) setGapAnalysis(gap);
    }).catch(() => {});
  }, []);

  const card = `rounded-2xl border p-6 ${darkMode ? 'border-[#1e1e3a]' : 'border-[#e0e0f0]'}`;

  if (!marketInsights && !gapAnalysis) {
    return (
      <div className={`${card} text-center py-16`} style={{ background: 'var(--surface-1)' }}>
        <div className="text-5xl mb-4">📊</div>
        <p style={{ color: '#6060a0' }}>Run a search first to generate market insights.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-display font-extrabold mb-5">📈 Market Insights & Gap Analysis</h2>
      <div className="grid grid-cols-2 gap-4">
        {marketInsights?.topSkills && (
          <div className={card} style={{ background: 'var(--surface-1)' }}>
            <h3 className="text-sm font-bold text-indigo-400 mb-4">🔝 Most Demanded Skills</h3>
            {marketInsights.topSkills.map((s, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.skill}</span>
                  <span style={{ color: '#5a5a90' }}>{s.count} jobs</span>
                </div>
                <ScoreBar value={Math.min(100, (s.count / 10) * 100)} />
              </div>
            ))}
          </div>
        )}

        {marketInsights?.salaryRange && (
          <div className={card} style={{ background: 'var(--surface-1)' }}>
            <h3 className="text-sm font-bold text-indigo-400 mb-4">💰 Salary Range</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['Min', marketInsights.salaryRange.min], ['Avg', marketInsights.salaryRange.avg], ['Max', marketInsights.salaryRange.max]].map(([l, v]) => (
                <div key={l} className="rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
                  <div className="text-xl font-extrabold text-indigo-400">
                    {marketInsights.salaryRange.currency}{typeof v === 'number' ? v.toLocaleString() : v || 'N/A'}
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: '#5a5a90' }}>{l}</div>
                </div>
              ))}
            </div>
            {marketInsights.marketSummary && (
              <p className="text-xs mt-3" style={{ color: '#6060a0' }}>{marketInsights.marketSummary}</p>
            )}
          </div>
        )}

        {gapAnalysis?.missingSkills && (
          <div className={card} style={{ background: 'var(--surface-1)' }}>
            <h3 className="text-sm font-bold text-indigo-400 mb-4">🧩 Skill Gaps to Fill</h3>
            {gapAnalysis.missingSkills.slice(0, 8).map((s, i) => (
              <div key={i} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
                <span>{s.skill}</span>
                <Badge
                  label={s.priority}
                  bg={s.priority === 'high' ? '#ef444430' : s.priority === 'medium' ? '#f59e0b30' : '#10b98130'}
                  color={s.priority === 'high' ? '#ef4444' : s.priority === 'medium' ? '#f59e0b' : '#10b981'}
                />
              </div>
            ))}
          </div>
        )}

        {gapAnalysis?.topRecommendations && (
          <div className={card} style={{ background: 'var(--surface-1)' }}>
            <h3 className="text-sm font-bold text-indigo-400 mb-4">💡 Recommendations</h3>
            {gapAnalysis.topRecommendations.map((r, i) => (
              <div key={i} className="flex gap-2.5 mb-2.5 text-sm">
                <span className="text-indigo-400 font-bold">{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
            {gapAnalysis.careerPathSuggestion && (
              <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: '#6366f110', borderLeft: '3px solid #6366f1' }}>
                🎯 {gapAnalysis.careerPathSuggestion}
              </div>
            )}
          </div>
        )}

        {gapAnalysis?.courseSuggestions && (
          <div className={card} style={{ background: 'var(--surface-1)' }}>
            <h3 className="text-sm font-bold text-indigo-400 mb-4">📚 Suggested Courses</h3>
            {gapAnalysis.courseSuggestions.map((c, i) => (
              <div key={i} className="py-2 border-b text-sm" style={{ borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
                <div className="font-semibold">{c.skill}</div>
                <div className="text-xs" style={{ color: '#5a5a90' }}>{c.course} · {c.platform} · {c.estimatedTime}</div>
              </div>
            ))}
          </div>
        )}

        {marketInsights?.topCompanies && (
          <div className={card} style={{ background: 'var(--surface-1)' }}>
            <h3 className="text-sm font-bold text-indigo-400 mb-4">🏢 Top Hiring Companies</h3>
            <div className="flex flex-wrap gap-2">
              {marketInsights.topCompanies.map((c, i) => <Badge key={i} label={c} bg="#6366f120" color="#6366f1" />)}
            </div>
            {marketInsights.hiringTrends && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase mb-2" style={{ color: '#5a5a90' }}>Trends</div>
                {marketInsights.hiringTrends.map((t, i) => (
                  <div key={i} className="text-xs py-1" style={{ color: '#6060a0' }}>• {t}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
