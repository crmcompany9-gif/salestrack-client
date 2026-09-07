import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor, outcomeBadge, outcomeLabel, fmtDate, fmtDateTime, isOverdue, isDueSoon, PhoneIcon, makeExotelCall } from '../utils/helpers';
import * as XLSX from 'xlsx';

const FILTERS = [
  { label:'All', value:'' },
  { label:'Cold calls', value:'cold' },
  { label:'Follow-ups', value:'followup' },
  { label:'Interested', value:'interested' },
  { label:'Callbacks', value:'callback' },
];

export default function CallLogs() {
  const { user } = useAuth();
  const [calls, setCalls]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('');
  const [editing, setEditing]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const isManager = user?.role === 'manager';

  const load = () => {
    const params = {};
    if (filter && ['cold','followup'].includes(filter)) params.callType = filter;
    if (filter && ['interested','callback'].includes(filter)) params.outcome = filter;
    axios.get('/api/calls', { params }).then(r => { setCalls(r.data); setLoading(false); });
  };

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Call logs';
    load();
  }, [filter]);

  const visible = calls.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.client?.name?.toLowerCase().includes(q) ||
           c.client?.phone?.includes(q) ||
           c.employee?.name?.toLowerCase().includes(q);
  });

  const openEdit = (call) => {
    setEditing(call._id);
    setEditForm({
      callType:      call.callType,
      outcome:       call.outcome,
      duration:      call.duration || '',
      notes:         call.notes || '',
      recordingLink: call.recordingLink || '',
      nextFollowUp:  call.nextFollowUp ? call.nextFollowUp.slice(0,10) : '',
    });
  };

  const closeEdit = () => { setEditing(null); setEditForm({}); };

  const handleSave = async (callId) => {
    setSaving(true);
    try {
      await axios.put(`/api/calls/${callId}`, editForm);
      closeEdit();
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const setF = (k, v) => setEditForm(f => ({ ...f, [k]: v }));
  
  const exportToExcel = () => {
  const rows = visible.map(call => ({
    'Client':      call.client?.name || '',
    'Phone':       call.client?.phone || '',
    'City':        call.client?.city || '',
    'Employee':    call.employee?.name || '',
    'Type':        call.callType === 'cold' ? 'Cold call' : 'Follow-up',
    'Outcome':     outcomeLabel(call.outcome),
    'Duration':    call.duration ? `${call.duration} min` : '',
    'Notes':       call.notes || '',
    'Date':        call.callDate ? new Date(call.callDate).toLocaleDateString('en-IN') : '',
    'Follow-up':   call.nextFollowUp ? new Date(call.nextFollowUp).toLocaleDateString('en-IN') : '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Call Logs');
  XLSX.writeFile(wb, `SalesTrack_CallLogs_${new Date().toLocaleDateString('en-IN').replace(/\//g,'-')}.xlsx`);
};

  if (loading) return <div className="loading">Loading calls...</div>;

  return (
    <>
      <div className="filter-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search client or employee..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {FILTERS.map(f => (
          <div key={f.value} className={`filter-chip${filter===f.value?' active':''}`}
            onClick={() => setFilter(f.value)}>{f.label}</div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{visible.length} calls</div>
  {isManager && (
    <button className="btn" onClick={exportToExcel}>
      <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export Excel
    </button>
  )}
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
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan="9" className="loading">No calls found</td></tr>
              )}
              {visible.map(call => {
                const overdue  = isOverdue(call.nextFollowUp);
                const dueSoon  = !overdue && isDueSoon(call.nextFollowUp);
                const isEdit   = editing === call._id;
                return (
                  <>
                    <tr key={call._id}>
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
                       <button className="call-btn"
  onClick={() => makeExotelCall(call.client?.phone, call.client?.name, call.client?._id, window.__stBanner)}>
  <PhoneIcon />
</button>
                        </div>
                      </td>
                      <td data-label="Type">
                        <span className={`badge badge-${call.callType}`}><span className="dot"/>{call.callType === 'cold' ? 'Cold' : 'Follow-up'}</span>
                      </td>
                      <td data-label="Outcome">
                        <span className={`badge ${outcomeBadge(call.outcome)}`}><span className="dot"/>{outcomeLabel(call.outcome)}</span>
                      </td>
                      <td data-label="Duration" className="td-light">{call.duration ? `${call.duration} min` : '-'}</td>
                      <td data-label="Date" className="td-light">{fmtDateTime(call.callDate)}</td>
                      <td data-label="Follow-up" className="td-light">
                        {fmtDate(call.nextFollowUp)}
                        {overdue && <span className="overdue-tag">Overdue</span>}
                        {dueSoon && <span className="duesoon-tag">Due soon</span>}
                      </td>
                      <td data-label="Edit">
                        <button className="btn" style={{fontSize:11,padding:'4px 10px'}}
                          onClick={() => isEdit ? closeEdit() : openEdit(call)}>
                          {isEdit ? 'Cancel' : 'Edit'}
                        </button>
                      </td>
                    </tr>

                    {isEdit && (
                      <tr key={`edit-${call._id}`}>
                        <td colSpan="9" style={{padding:0}}>
                          <div style={{
                            background:'var(--accent-bg)',
                            border:'1px solid var(--accent)',
                            borderRadius:'var(--radius-lg)',
                            padding:'16px 18px',
                            margin:'4px 8px 8px'
                          }}>
                            <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:'var(--accent-text)'}}>
                              Editing call — {call.client?.name}
                            </div>
                            <div className="form-grid">
                              <div className="field">
                                <label>Call type</label>
                                <select value={editForm.callType} onChange={e => setF('callType', e.target.value)}>
                                  <option value="cold">Cold call</option>
                                  <option value="followup">Follow-up</option>
                                </select>
                              </div>
                              <div className="field">
                                <label>Outcome</label>
                                <select value={editForm.outcome} onChange={e => setF('outcome', e.target.value)}>
                                  <option value="interested">Interested</option>
                                  <option value="not-interested">Not interested</option>
                                  <option value="callback">Callback requested</option>
                                  <option value="no-answer">No answer</option>
                                </select>
                              </div>
                              <div className="field">
                                <label>Duration (mins)</label>
                                <input type="number" value={editForm.duration} onChange={e => setF('duration', e.target.value)} min="0" />
                              </div>
                              <div className="field">
                                <label>Next follow-up date</label>
                                <input type="date" value={editForm.nextFollowUp} onChange={e => setF('nextFollowUp', e.target.value)} />
                              </div>
                              <div className="field full">
                                <label>Notes</label>
                                <textarea value={editForm.notes} onChange={e => setF('notes', e.target.value)} style={{minHeight:60}} />
                              </div>
                              <div className="field full">
                                <label>Recording link</label>
                                <input type="url" value={editForm.recordingLink} onChange={e => setF('recordingLink', e.target.value)} placeholder="https://drive.google.com/..." />
                              </div>
                            </div>
                            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                              <button className="btn" onClick={closeEdit}>Cancel</button>
                              <button className="btn primary" onClick={() => handleSave(call._id)} disabled={saving}>
                                {saving ? 'Saving...' : 'Save changes'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}