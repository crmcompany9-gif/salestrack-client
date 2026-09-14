import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor, outcomeBadge, outcomeLabel, fmtDate, isOverdue, isDueSoon, PhoneIcon, makeExotelCall } from '../utils/helpers';

const STATUS_FILTERS = [
  { label:'All', value:'' },
  { label:'Interested', value:'interested' },
  { label:'Callback', value:'callback' },
  { label:'No answer', value:'no-answer' },
  { label:'Not interested', value:'not-interested' },
];

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');
  const [sending, setSending] = useState(null); // client id being sent
  const isManager = user?.role === 'manager';

  const load = (f = filter) => {
    const params = f ? { status: f } : {};
    axios.get('/api/clients', { params }).then(r => { setClients(r.data); setLoading(false); });
  };

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Clients';
    load();
  }, [filter]);

  const visible = clients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.city?.toLowerCase().includes(q);
  });

  const sendToERP = async (client) => {
    if (!window.confirm(`Send "${client.name}" to GrowTrack ERP?\n\nThey will appear in Stage 1 (Accounts & MOU) automatically.`)) return;
    setSending(client._id);
    try {
      const res = await axios.post(`/api/clients/${client._id}/send-to-erp`);
      if (res.data.alreadyExisted) {
        alert(`⚠️ ${client.name} already existed in ERP — marked as sent.`);
      } else {
        alert(`✅ ${client.name} successfully added to GrowTrack ERP at Stage 1!`);
      }
      load();
    } catch (err) {
      alert(`❌ Failed: ${err.response?.data?.message || 'Something went wrong'}`);
    } finally {
      setSending(null);
    }
  };

    const handleDelete = async (clientId, clientName) => {
    if (!window.confirm(`Delete "${clientName}"? This will also delete all their call logs. This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/clients/${clientId}`);
      setClients(prev => prev.filter(c => c._id !== clientId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client');
    }
  };

  if (loading) return <div className="loading">Loading clients…</div>;

  return (
    <>
      <div className="filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search name, phone, city…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {STATUS_FILTERS.map(f => (
          <div key={f.value} className={`filter-chip${filter===f.value?' active':''}`}
            onClick={() => setFilter(f.value)}>{f.label}</div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{visible.length} clients</div>
          {isManager && (
            <div style={{fontSize:11,color:'var(--text3)'}}>
              Green "Send to ERP" button appears for Interested clients
            </div>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Phone</th>
                <th>City</th>
                {isManager && <th>Assigned to</th>}
                <th>Status</th>
                <th>Last contact</th>
                <th>Follow-up</th>
                <th>Calls</th>
                {isManager && <th>ERP</th>}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan="9" className="loading">No clients found</td></tr>
              )}
              {visible.map(client => {
                const overdue = isOverdue(client.nextFollowUp);
                const dueSoon = !overdue && isDueSoon(client.nextFollowUp);
                return (
                  <tr key={client._id}>
                    <td className="td-name" data-label="">{client.name}</td>
                    <td data-label="Phone">
                      <div className="call-cell">
                        {client.phone}
                        <button className="call-btn"
  onClick={() => makeExotelCall(client.phone, client.name, client._id, window.__stBanner)}>
  <PhoneIcon />
</button>
                      </div>
                    </td>
                    <td data-label="City" className="td-light">{client.city || '—'}</td>
                    {isManager && (
                      <td data-label="Assigned to">
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <div className={`avatar sm ${avatarColor(client.assignedTo?.name)}`}>{initials(client.assignedTo?.name)}</div>
                          <span className="td-muted">{client.assignedTo?.name || '—'}</span>
                        </div>
                      </td>
                    )}
                    <td data-label="Status">
                      <span className={`badge ${outcomeBadge(client.status)}`}><span className="dot"/>{outcomeLabel(client.status)}</span>
                    </td>
                    <td data-label="Last contact" className="td-light">{fmtDate(client.lastContact)}</td>
                    <td data-label="Follow-up" className="td-light">
                      {fmtDate(client.nextFollowUp)}
                      {overdue && <span className="overdue-tag">Overdue</span>}
                      {dueSoon && <span className="duesoon-tag">Due soon</span>}
                    </td>
                    <td data-label="Total calls" className="td-light">{client.totalCalls}</td>

                    {/* Send to ERP — manager only */}
                   {isManager && (
  <td data-label="ERP">
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {client.sentToERP ? (
        <span style={{fontSize:11,color:'var(--success-text)',fontWeight:600}}>✓ In ERP</span>
      ) : client.status === 'interested' ? (
        <button
          className="btn primary"
          style={{fontSize:11,padding:'4px 10px',background:'var(--success)',borderColor:'var(--success)'}}
          onClick={() => sendToERP(client)}
          disabled={sending === client._id}
        >
          {sending === client._id ? 'Sending…' : 'Send to ERP'}
        </button>
      ) : (
        <span style={{fontSize:11,color:'var(--text3)'}}>—</span>
      )}
      <button
        className="btn danger-btn"
        style={{fontSize:11,padding:'4px 10px'}}
        onClick={() => handleDelete(client._id, client.name)}
      >
        🗑 Delete
      </button>
    </div>
  </td>
)}
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
