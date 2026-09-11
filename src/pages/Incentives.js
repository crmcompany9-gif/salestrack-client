import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor } from '../utils/helpers';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (n) => `₹${(n||0).toLocaleString('en-IN')}`;

export default function Incentives() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Incentives';
    setLoading(true);
    axios.get(`/api/incentives?month=${month}&year=${year}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month, year]);

  return (
    <>
      {/* Header */}
      <div className="section-head" style={{marginBottom:20}}>
        <div className="section-title">💰 Incentive Tracker</div>
        <div style={{display:'flex',gap:8}}>
          <select className="btn" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="btn" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading incentives…</div>}

      {!loading && data && (
        <>
          {/* Info bar */}
          <div style={{
            background:'var(--accent-bg)',border:'1px solid var(--accent)',
            borderRadius:'var(--radius-lg)',padding:'12px 18px',
            marginBottom:20,fontSize:13,color:'var(--accent-text)',
            display:'flex',gap:24,flexWrap:'wrap'
          }}>
            <span>📊 Monthly target: <strong>{fmt(data.target)}</strong></span>
            <span>💹 Incentive rate: <strong>10% above target</strong></span>
            <span>📅 Period: <strong>{MONTHS[month-1]} {year}</strong></span>
          </div>

          {/* Employee cards */}
          {data.results.map(r => (
            <div key={r.employee._id} className="card" style={{marginBottom:16}}>
              <div className="card-head">
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className={`avatar lg ${avatarColor(r.employee.name)}`}>
                    {initials(r.employee.name)}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{r.employee.name}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>
                      {r.callCount} calls with collections this month
                    </div>
                  </div>
                </div>
                <div style={{
                  background: r.crossed ? 'var(--success-bg)' : 'var(--warn-bg)',
                  color:      r.crossed ? 'var(--success-text)' : 'var(--warn-text)',
                  padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600
                }}>
                  {r.crossed ? '🎉 Target crossed!' : '⏳ In progress'}
                </div>
              </div>

              <div style={{padding:'16px 18px'}}>
                {/* Progress bar */}
                <div className="progress-label">
                  <span>Collected: <strong>{fmt(r.totalCollected)}</strong></span>
                  <span>Target: <strong>{fmt(r.target)}</strong></span>
                </div>
                <div className="progress-track" style={{height:10,marginBottom:16}}>
                  <div className="progress-fill fill-green"
                    style={{width:`${Math.min(r.targetPct,100)}%`}} />
                </div>

                {/* Stats grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                  <div className="stat accent-left">
                    <div className="stat-label">Collected</div>
                    <div className="stat-value" style={{fontSize:18}}>{fmt(r.totalCollected)}</div>
                  </div>
                  <div className="stat success-left">
                    <div className="stat-label">Target</div>
                    <div className="stat-value" style={{fontSize:18}}>{fmt(r.target)}</div>
                  </div>
                  <div className={`stat ${r.crossed ? 'success-left' : 'warn-left'}`}>
                    <div className="stat-label">Above target</div>
                    <div className="stat-value" style={{fontSize:18}}>{fmt(r.aboveTarget)}</div>
                  </div>
                  <div className="stat purple-left">
                    <div className="stat-label">Incentive earned</div>
                    <div className="stat-value" style={{
                      fontSize:18,
                      color: r.incentive > 0 ? 'var(--success-text)' : 'var(--text3)'
                    }}>
                      {r.incentive > 0 ? fmt(r.incentive) : '—'}
                    </div>
                    <div className="stat-sub">
                      {r.incentive > 0 ? '10% of above target' : 'Cross target to earn'}
                    </div>
                  </div>
                </div>

                {/* Incentive message */}
                {r.crossed && r.incentive > 0 && (
                  <div style={{
                    marginTop:14,padding:'10px 14px',
                    background:'var(--success-bg)',borderRadius:'var(--radius)',
                    fontSize:13,color:'var(--success-text)',fontWeight:500
                  }}>
                    🎉 Great work! You've earned <strong>{fmt(r.incentive)}</strong> incentive this month.
                  </div>
                )}
                {!r.crossed && (
                  <div style={{
                    marginTop:14,padding:'10px 14px',
                    background:'var(--warn-bg)',borderRadius:'var(--radius)',
                    fontSize:13,color:'var(--warn-text)'
                  }}>
                    💪 Collect <strong>{fmt(r.target - r.totalCollected)}</strong> more to unlock your incentive.
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}