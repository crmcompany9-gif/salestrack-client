import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor, outcomeBadge, outcomeLabel, fmtDateTime, PhoneIcon } from '../utils/helpers';
import NoticeBoard from '../components/NoticeBoard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const isManager = user?.role === 'manager';

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Dashboard';
    axios.get('/api/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  const fillColor = (pct) => pct >= 80 ? 'fill-green' : pct >= 50 ? 'fill-blue' : 'fill-warn';
  const pctColor  = (pct) => pct >= 80 ? 'pct-green' : pct >= 50 ? 'pct-blue' : 'pct-warn';

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <>
      {/* Notice Board */}
      <NoticeBoard />

      {/* Stats strip */}
      <div className="stats-grid">
        <div className="stat accent-left">
          <div className="stat-label">Calls today</div>
          <div className="stat-value" style={{color:'var(--accent)'}}>{data.callsToday}</div>
          <div className="stat-sub">Total calls logged today</div>
        </div>
        <div className="stat success-left">
          <div className="stat-label">Interested today</div>
          <div className="stat-value" style={{color:'var(--success)'}}>{data.interestedToday}</div>
          <div className="stat-sub">
            {data.callsToday > 0 ? `${Math.round((data.interestedToday/data.callsToday)*100)}% conversion` : 'No calls yet'}
          </div>
        </div>
        <div className="stat warn-left">
          <div className="stat-label">Follow-ups due</div>
          <div className="stat-value" style={{color:'var(--warn)'}}>{data.followUpsDue}</div>
          <div className="stat-sub warn">{data.overdue} overdue</div>
        </div>
        <div className="stat purple-left">
          <div className="stat-label">Monthly target</div>
          <div className="stat-value" style={{color:'var(--purple)'}}>{data.targetPct}%</div>
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
                  <div className={`progress-fill ${fillColor(emp.pct)}`} style={{width:`${Math.min(emp.pct,100)}%`}} />
                </div>
                <div className="emp-stats">
                  <div>
                    <div className="emp-stat-val" style={{color:'var(--success)'}}>{emp.interested}</div>
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
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className={`avatar sm ${avatarColor(call.employee?.name)}`}>{initials(call.employee?.name)}</div>
                        <span className="td-name">{call.employee?.name}</span>
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="call-cell">
                      <span className="td-muted">{call.client?.name}</span>
                      <a className="call-btn" href={`tel:+91${call.client?.phone?.replace(/\s/g,'')}`}
                        onClick={() => window.__stBanner?.(call.client?.name, call.client?.phone)}>
                        <PhoneIcon />
                      </a>
                    </div>
                  </td>
                  <td><span className={`badge badge-${call.callType}`}><span className="dot"/>{call.callType === 'cold' ? 'Cold' : 'Follow-up'}</span></td>
                  <td><span className={`badge ${outcomeBadge(call.outcome)}`}><span className="dot"/>{outcomeLabel(call.outcome)}</span></td>
                  <td className="td-light">{fmtDateTime(call.callDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
