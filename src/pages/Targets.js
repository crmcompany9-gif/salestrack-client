import { useEffect, useState } from 'react';
import axios from 'axios';
import { initials, avatarColor } from '../utils/helpers';

export default function Targets() {
  const [targets, setTargets]   = useState([]);
  const [employees, setEmps]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [form, setForm]   = useState({ employee:'', callTarget:200, conversionTarget:60 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const load = () => {
    setLoading(true);
    axios.get(`/api/targets?month=${month}&year=${year}`).then(r => { setTargets(r.data); setLoading(false); });
  };

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Targets';
    axios.get('/api/users').then(r => setEmps(r.data.filter(u => u.role === 'employee')));
  }, []);

  useEffect(() => { load(); }, [month, year]);

  const fillColor = (pct) => pct >= 80 ? 'fill-green' : pct >= 50 ? 'fill-blue' : 'fill-warn';
  const pctColor  = (pct) => pct >= 80 ? 'pct-green' : pct >= 50 ? 'pct-blue' : 'pct-warn';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await axios.post('/api/targets', { ...form, month, year });
      setMsg('Target saved!');
      load();
    } catch (err) {
      setMsg('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="two-col">
      {/* Left — progress */}
      <div>
        <div className="section-head">
          <div className="section-title">Target progress</div>
          <div style={{display:'flex',gap:6}}>
            <select value={month} onChange={e=>setMonth(+e.target.value)} style={{width:'auto',padding:'6px 10px'}}>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(+e.target.value)} style={{width:'auto',padding:'6px 10px'}}>
              {[2025,2026,2027].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="card">
          {loading ? <div className="loading">Loading…</div> : (
            <div className="target-list">
              {targets.length === 0 && <div className="loading">No targets set for this period</div>}
              {targets.map(t => (
                <div className="target-row" key={t._id}>
                  <div className="target-left">
                    <div className={`avatar ${avatarColor(t.employee?.name)}`}>{initials(t.employee?.name)}</div>
                    <div>
                      <div className="target-name">{t.employee?.name}</div>
                      <div className="target-sub">{t.callsMade} / {t.callTarget} calls · {t.conversions} interested</div>
                    </div>
                  </div>
                  <div className="target-bar-wrap">
                    <div className="mini-label"><span>Progress</span><span>{t.callPct}%</span></div>
                    <div className="mini-track">
                      <div className={`mini-fill ${fillColor(t.callPct)}`} style={{width:`${Math.min(t.callPct,100)}%`}} />
                    </div>
                  </div>
                  <div className={`pct-text ${pctColor(t.callPct)}`}>{t.callPct}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — set target form */}
      <div>
        <div className="section-head"><div className="section-title">Set / update target</div></div>
        <div className="form-wrap" style={{marginBottom:0}}>
          <form onSubmit={handleSave}>
            <div className="field" style={{marginBottom:14}}>
              <label>Employee</label>
              <select value={form.employee} onChange={e=>setForm(f=>({...f,employee:e.target.value}))} required>
                <option value="">Select employee…</option>
                {employees.map(emp=><option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Monthly call target</label>
                <input type="number" value={form.callTarget} onChange={e=>setForm(f=>({...f,callTarget:+e.target.value}))} min="1" />
              </div>
              <div className="field">
                <label>Conversion target</label>
                <input type="number" value={form.conversionTarget} onChange={e=>setForm(f=>({...f,conversionTarget:+e.target.value}))} min="1" />
              </div>
            </div>
            {msg && <div style={{fontSize:12,color:msg.includes('saved')?'var(--success-text)':'var(--danger-text)',marginTop:10}}>{msg}</div>}
            <div className="form-actions" style={{marginTop:14,paddingTop:12}}>
              <button type="submit" className="btn primary" disabled={saving}>{saving?'Saving…':'Save target'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
