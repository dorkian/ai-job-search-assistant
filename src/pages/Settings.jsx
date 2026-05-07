import useStore from '../store/useStore.js';
import api from '../api/client.js';
import { JOB_TYPES, EXPERIENCE_LEVELS, FRESHNESS_OPTIONS, PLATFORMS, CURRENCIES } from '../utils/helpers.js';

export default function Settings() {
  const { settings, updateSetting, darkMode } = useStore();

  const handleChange = (key, value) => {
    updateSetting(key, value);
    // Debounced save happens on blur
  };

  const saveAll = () => api.saveSettings(settings).catch(() => {});

  const input = `w-full rounded-xl border p-2.5 text-sm ${darkMode ? 'bg-[#161630] border-[#2a2a45]' : 'bg-[#f8f8ff] border-[#d0d0e0]'}`;
  const label = `text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${darkMode ? 'text-[#5a5a90]' : 'text-[#8080b0]'}`;

  return (
    <div>
      <div className="rounded-2xl border p-6" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <h2 className="text-lg font-display font-extrabold mb-5">⚙️ Search Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Country *</label>
            <input className={input} value={settings.country || ''} onChange={(e) => handleChange('country', e.target.value)} onBlur={saveAll} placeholder="e.g. United States, Germany, Poland..." style={{ color: 'inherit' }} />
          </div>
          <div>
            <label className={label}>City / Region</label>
            <input className={input} value={settings.city || ''} onChange={(e) => handleChange('city', e.target.value)} onBlur={saveAll} placeholder="e.g. New York, Berlin..." style={{ color: 'inherit' }} />
          </div>
          <div>
            <label className={label}>Language</label>
            <input className={input} value={settings.language || ''} onChange={(e) => handleChange('language', e.target.value)} onBlur={saveAll} placeholder="e.g. English, German..." style={{ color: 'inherit' }} />
          </div>
          <div>
            <label className={label}>Experience Level</label>
            <select className={input} value={settings.experienceLevel || 'Senior'} onChange={(e) => { handleChange('experienceLevel', e.target.value); saveAll(); }} style={{ color: 'inherit' }}>
              {EXPERIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Salary Min ({settings.currency || 'USD'})</label>
            <input type="number" className={input} value={settings.salaryMin || ''} onChange={(e) => handleChange('salaryMin', e.target.value)} onBlur={saveAll} placeholder="e.g. 80000" style={{ color: 'inherit' }} />
          </div>
          <div>
            <label className={label}>Salary Max ({settings.currency || 'USD'})</label>
            <input type="number" className={input} value={settings.salaryMax || ''} onChange={(e) => handleChange('salaryMax', e.target.value)} onBlur={saveAll} placeholder="e.g. 150000" style={{ color: 'inherit' }} />
          </div>
          <div>
            <label className={label}>Currency</label>
            <select className={input} value={settings.currency || 'USD'} onChange={(e) => { handleChange('currency', e.target.value); saveAll(); }} style={{ color: 'inherit' }}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Search Freshness</label>
            <select className={input} value={settings.freshness || '48h'} onChange={(e) => { handleChange('freshness', e.target.value); saveAll(); }} style={{ color: 'inherit' }}>
              {FRESHNESS_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Max Results</label>
            <input type="number" min={5} max={50} className={input} value={settings.resultCount || 10} onChange={(e) => handleChange('resultCount', parseInt(e.target.value))} onBlur={saveAll} style={{ color: 'inherit' }} />
          </div>
          <div>
            <label className={label}>Target Industries</label>
            <input className={input} value={settings.industries || ''} onChange={(e) => handleChange('industries', e.target.value)} onBlur={saveAll} placeholder="e.g. FinTech, SaaS, Healthcare..." style={{ color: 'inherit' }} />
          </div>
          <div className="col-span-2">
            <label className={label}>Exclude Industries</label>
            <input className={input} value={settings.excludeIndustries || ''} onChange={(e) => handleChange('excludeIndustries', e.target.value)} onBlur={saveAll} placeholder="e.g. Gambling, Defense..." style={{ color: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* Job Types */}
      <div className="rounded-2xl border p-6 mt-4" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <h3 className="text-sm font-bold text-indigo-400 mb-4">🏠 Job Types</h3>
        <div className="flex flex-wrap gap-2.5">
          {JOB_TYPES.map((jt) => {
            const active = (settings.jobTypes || []).includes(jt.id);
            return (
              <button
                key={jt.id}
                onClick={() => {
                  const next = active ? settings.jobTypes.filter((t) => t !== jt.id) : [...(settings.jobTypes || []), jt.id];
                  handleChange('jobTypes', next);
                  setTimeout(saveAll, 100);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  borderColor: active ? '#6366f1' : darkMode ? '#2a2a45' : '#d0d0e0',
                  color: active ? '#6366f1' : '#6060a0',
                  background: active ? '#6366f115' : 'transparent',
                }}
              >
                {jt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Platforms */}
      <div className="rounded-2xl border p-6 mt-4" style={{ background: 'var(--surface-1)', borderColor: darkMode ? '#1e1e3a' : '#e0e0f0' }}>
        <h3 className="text-sm font-bold text-indigo-400 mb-4">🌐 Platforms</h3>
        <div className="flex flex-wrap gap-2.5">
          {PLATFORMS.map((p) => {
            const active = (settings.platforms || []).includes(p);
            return (
              <button
                key={p}
                onClick={() => {
                  const next = active ? settings.platforms.filter((x) => x !== p) : [...(settings.platforms || []), p];
                  handleChange('platforms', next);
                  setTimeout(saveAll, 100);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  borderColor: active ? '#6366f1' : darkMode ? '#2a2a45' : '#d0d0e0',
                  color: active ? '#6366f1' : '#6060a0',
                  background: active ? '#6366f115' : 'transparent',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
