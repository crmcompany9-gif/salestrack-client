import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor, outcomeBadge, outcomeLabel, fmtDateTime, PhoneIcon } from '../utils/helpers';
import NoticeBoard from '../components/NoticeBoard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isManager = user?.role === 'manager';
  const [brief, setBrief]           = useState('');
const [briefLoading, setBriefLoading] = useState(false);
const [briefGenerated, setBriefGenerated] = useState(false);

  useEffect(() => {
  document.getElementById('page-title').textContent = 'Dashboard';
  axios.get('/api/dashboard').then(r => {
    setData(r.data);
    setLoading(false);
    generateBrief({ ...r.data, userName: user?.name });
  });
}, []);

  const fillColor = (pct) => pct >= 80 ? 'fill-green' : pct >= 50 ? 'fill-blue' : 'fill-warn';

  const generateBrief = async (dashData) => {
  setBriefLoading(true);
  try {
    const prompt = isManager
      ? `You are a sales manager assistant for Elbow Grease Business Solutions, an Indian business consultancy.
Generate a sharp morning brief in 4-5 bullet points based on this dashboard data.
Be direct, actionable, and specific. Use Indian business context.
Data:
- Overdue follow-ups: ${dashData.overdue}
- Follow-ups due today: ${dashData.followUpsDue}
- Calls today so far: ${dashData.callsToday}
- Interested today: ${dashData.interestedToday}
- Calls this month total: ${dashData.callsThisMonth}
- Team target progress: ${dashData.targetPct}%
- Team stats: ${JSON.stringify(dashData.teamStats?.map(e => ({name: e.name, calls: e.calls, pct: e.pct})))}
Write 4-5 bullet points starting with an emoji. Be motivating but honest. End with one action priority.`
      : `You are a sales coach assistant for Elbow Grease Business Solutions.
Generate a personal morning brief for ${dashData.userName || 'the sales executive'} in 3-4 bullet points.
Be direct, motivating, and specific. Use Indian business context.
Data:
- Overdue follow-ups: ${dashData.overdue}
- Follow-ups due today: ${dashData.followUpsDue}
- Calls today: ${dashData.callsToday}
- Calls this month: ${dashData.callsThisMonth}
- Target progress: ${dashData.targetPct}%
Write 3-4 bullet points starting with an emoji. Be encouraging. End with today's top priority.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      }
    );
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) setBrief(text);
  } catch (err) {
    console.error('Brief generation failed:', err);
  } finally {
    setBriefLoading(false);
    setBriefGenerated(true);
  }
};

  const pctColor = (pct) => pct >= 80 ? 'pct-green' : pct >= 50 ? 'pct-blue' : 'pct-warn';

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <>
      {/* Mobile greeting — only shows on mobile */}
      <div style={{
        display: 'none',
        marginBottom: 16,
        padding: '12px 14px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }} className="mobile-greeting">
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
          Logged in as
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          👋 {user?.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
          {isManager ? 'Manager' : 'Sales executive'}
        </div>
      </div>
      {/* AI Daily Brief */}
{(briefLoading || brief) && (
  <div style={{
    background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
    borderRadius: 'var(--radius-xl)',
    padding: '18px 22px',
    marginBottom: 20,
    color: '#fff',
    boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
  }}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:18}}>✨</span>
        <span style={{fontSize:13,fontWeight:700,letterSpacing:'-0.01em'}}>
          AI Morning Brief
        </span>
      </div>
      {!briefLoading && (
        <button
          onClick={() => generateBrief({...data, userName: user?.name})}
          style={{
            background:'rgba(255,255,255,0.15)',
            border:'1px solid rgba(255,255,255,0.3)',
            color:'#fff',
            fontSize:11,
            padding:'3px 10px',
            borderRadius:20,
            cursor:'pointer',
            fontWeight:600,
          }}>
          Refresh
        </button>
      )}
    </div>
    {briefLoading ? (
      <div style={{fontSize:12,opacity:0.8,fontStyle:'italic'}}>
        ✨ Generating your morning brief…
      </div>
    ) : (
      <div style={{fontSize:13,lineHeight:1.7,whiteSpace:'pre-line',opacity:0.95}}>
        {brief}
      </div>
    )}
  </div>
)}
      {/* Notice Board */}
      <NoticeBoard />

      {/* Follow-up alert */}
      {(data.overdue > 0 || data.followUpsDue > 0) && (
        <div style={{
          background: data.overdue > 0 ? 'var(--danger-bg)' : 'var(--warn-bg)',
          border: `1px solid ${data.overdue > 0 ? 'var(--danger)' : 'var(--warn)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{data.overdue > 0 ? '🚨' : '⏰'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: data.overdue > 0 ? 'var(--danger-text)' : 'var(--warn-text)' }}>
                {data.overdue > 0
                  ? `${data.overdue} overdue follow-up${data.overdue > 1 ? 's' : ''} — call them now`
                  : `${data.followUpsDue} follow-up${data.followUpsDue > 1 ? 's' : ''} due today`
                }
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                Go to Clients page to see who needs a call
              </div>
            </div>
          </div>
          <button className="btn" style={{
            fontSize: 12,
            borderColor: data.overdue > 0 ? 'var(--danger)' : 'var(--warn)',
            color: data.overdue > 0 ? 'var(--danger-text)' : 'var(--warn-text)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
            onClick={() => navigate('/clients')}>
            View clients →
          </button>
        </div>
      )}

      {/* Stats strip */}
      <div className="stats-grid">
        <div className="stat accent-left">
          <div className="stat-label">Calls today</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{data.callsToday}</div>
          <div className="stat-sub">Total calls logged today</div>
        </div>
        <div className="stat success-left">
          <div className="stat-label">Interested today</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{data.interestedToday}</div>
          <div className="stat-sub">
            {data.callsToday > 0 ? `${Math.round((data.interestedToday / data.callsToday) * 100)}% conversion` : 'No calls yet'}
          </div>
        </div>
        <div className="stat warn-left">
          <div className="stat-label">Follow-ups due</div>
          <div className="stat-value" style={{ color: 'var(--warn)' }}>{data.followUpsDue}</div>
          <div className="stat-sub warn">{data.overdue} overdue</div>
        </div>
        <div className="stat purple-left">
          <div className="stat-label">Monthly target</div>
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{data.targetPct}%</div>
          <div className="stat-sub">{data.callsThisMonth} calls this month</div>
        </div>
      </div>

      {/* Team performance — manager only */}
      {isManager && data.teamStats?.length > 0 && (
        <>
          <div className="section-head">
            <div className="section-title">Team performance this month</div>
            <button className="btn" onClick={() => navigate('/targets')}>View targets</button>
          </div>
          <div className="emp-grid">
            {data.teamStats.map(emp => (
              <div className="emp-card" key={emp._id}>
                <div className="emp-head">
                  <div className={`avatar ${avatarColor(emp.name)}`}>{initials(emp.name)}</div>
                  <div>
                    <div className="emp-name">{emp.name}</div>
                    <div className="emp-meta">{emp.calls} calls this month</div>
                  </div>
                </div>
                <div className="progress-label">
                  <span>Target progress</span>
                  <span className={pctColor(emp.pct)}>{emp.pct}%</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${fillColor(emp.pct)}`} style={{ width: `${Math.min(emp.pct, 100)}%` }} />
                </div>
                <div className="emp-stats">
                  <div>
                    <div className="emp-stat-val" style={{ color: 'var(--success)' }}>{emp.interested}</div>
                    <div className="emp-stat-lbl">Interested</div>
                  </div>
                  <div>
                    <div className="emp-stat-val">{emp.callTarget}</div>
                    <div className="emp-stat-lbl">Target</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent calls */}
      <div className="section-head">
        <div className="section-title">Recent calls</div>
        <button className="btn" onClick={() => navigate('/calls')}>View all</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {isManager && <th>Employee</th>}
                <th>Client</th>
                <th>Type</th>
                <th>Outcome</th>
                <th>Date &amp; time</th>
                <th>Quoted (₹)</th>
                <th>Collected (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCalls.length === 0 && (
                <tr><td colSpan="5" className="loading">No calls logged yet</td></tr>
              )}
              {data.recentCalls.map(call => (
                <tr key={call._id}>
                  {isManager && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={`avatar sm ${avatarColor(call.employee?.name)}`}>{initials(call.employee?.name)}</div>
                        <span className="td-name">{call.employee?.name}</span>
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="call-cell">
                      <span className="td-muted">{call.client?.name}</span>
                      <a className="call-btn" href={`tel:+91${call.client?.phone?.replace(/\s/g, '')}`}
                        onClick={() => window.__stBanner?.(call.client?.name, call.client?.phone)}>
                        <PhoneIcon />
                      </a>
                    </div>
                  </td>
                  <td><span className={`badge badge-${call.callType}`}><span className="dot" />{call.callType === 'cold' ? 'Cold' : 'Follow-up'}</span></td>
                  <td><span className={`badge ${outcomeBadge(call.outcome)}`}><span className="dot" />{outcomeLabel(call.outcome)}</span></td>
                  <td className="td-light">{fmtDateTime(call.callDate)}</td>
                  <td className="td-light">
                    {call.amountQuoted > 0 ? `₹${call.amountQuoted.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="td-light">
                    {call.amountCollected > 0 ? `₹${call.amountCollected.toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
