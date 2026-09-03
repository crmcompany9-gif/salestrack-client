import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor, outcomeBadge, outcomeLabel, fmtDate, fmtDateTime, isOverdue, isDueSoon, PhoneIcon } from '../utils/helpers';

const FILTERS = [
  { label:'All', value:'' },
  { label:'Cold calls', value:'cold' },
  { label:'Follow-ups', value:'followup' },
  { label:'Interested', value:'interested' },
  { label:'Callbacks', value:'callback' },
];

export default function CallLogs() {
  const { user } = useAuth();
  const [calls, setCalls]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');
  const isManager = user?.role === 'manager';

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Call logs';
    const params = {};
    if (filter && ['cold','followup'].includes(filter)) params.callType = filter;
    if (filter && ['interested','callback'].includes(filter)) params.outcome = filter;
    axios.get('/api/calls', { params }).then(r => { setCalls(r.data); setLoading(false); });
  }, [filter]);

  const visible = calls.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.client?.name?.toLowerCase().includes(q) ||
           c.client?.phone?.includes(q) ||
           c.employee?.name?.toLowerCase().includes(q);
  });

  if (loading) return <div className="loading">Loading calls…</div>;

  return (
    <>
      <div className="filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search client or employee…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {FILTERS.map(f => (
          <div key={f.value} className={`filter-chip${filter===f.value?' active':''}`}
            onClick={() => setFilter(f.value)}>{f.label}</div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{visible.length} calls</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {isManager && <th>Employee</th>}
                <th>Client</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Outcome</th>
                <th>Duration</th>
                <th>Date &amp; time</th>
                <th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan="8" className="loading">No calls found</td></tr>
              )}
              {visible.map(call => {
                const overdue = isOverdue(call.nextFollowUp);
                const dueSoon = !overdue && isDueSoon(call.nextFollowUp);
                return (
                  <tr key={call._id}>
                    {/* Client name shown first on mobile as card title */}
                    <td className="td-name" data-label="">{call.client?.name}</td>
                    {isManager && (
                      <td data-label="Employee">
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div className={`avatar sm ${avatarColor(call.employee?.name)}`}>{initials(call.employee?.name)}</div>
                          <span>{call.employee?.name}</span>
                        </div>
                      </td>
                    )}
                    <td data-label="Phone">
                      <div className="call-cell">
                        {call.client?.phone}
                        <a className="call-btn" href={`tel:+91${call.client?.phone?.replace(/\s/g,'')}`}
                          onClick={() => window.__stBanner?.(call.client?.name, call.client?.phone)}>
                          <PhoneIcon />
                        </a>
                      </div>
                    </td>
                    <td data-label="Type">
                      <span className={`badge badge-${call.callType}`}><span className="dot"/>{call.callType === 'cold' ? 'Cold' : 'Follow-up'}</span>
                    </td>
                    <td data-label="Outcome">
                      <span className={`badge ${outcomeBadge(call.outcome)}`}><span className="dot"/>{outcomeLabel(call.outcome)}</span>
                    </td>
                    <td data-label="Duration" className="td-light">{call.duration ? `${call.duration} min` : '—'}</td>
                    <td data-label="Date" className="td-light">{fmtDateTime(call.callDate)}</td>
                    <td data-label="Follow-up" className="td-light">
                      {fmtDate(call.nextFollowUp)}
                      {overdue && <span className="overdue-tag">Overdue</span>}
                      {dueSoon && <span className="duesoon-tag">Due soon</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
