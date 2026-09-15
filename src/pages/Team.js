import { useEffect, useState } from 'react';
import axios from 'axios';
import { initials, avatarColor, PhoneIcon } from '../utils/helpers';

const blankForm = { name:'', email:'', phone:'', role:'employee', password:'elbow123' };

export default function Team() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(blankForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg]   = useState('');

  const load = () => axios.get('/api/users').then(r => { setUsers(r.data); setLoading(false); });

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Team';
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axios.post('/api/users', form);
      setShowForm(false); setForm(blankForm); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setSaving(false); }
  };

  const openEdit = (u) => {
    setEditUser(u._id);
    setEditForm({ name: u.name, phone: u.phone || '', role: u.role, newPassword: '' });
    setEditMsg('');
  };

  const handleSaveEdit = async (userId) => {
    setEditSaving(true); setEditMsg('');
    try {
      const payload = {
        name:  editForm.name,
        phone: editForm.phone,
        role:  editForm.role,
      };
      if (editForm.newPassword && editForm.newPassword.length >= 6) {
        payload.password = editForm.newPassword;
      } else if (editForm.newPassword && editForm.newPassword.length < 6) {
        setEditMsg('Password must be at least 6 characters');
        setEditSaving(false); return;
      }
      await axios.put(`/api/users/${userId}`, payload);
      setEditMsg('Saved!');
      setTimeout(() => { setEditUser(null); setEditMsg(''); load(); }, 1000);
    } catch { setEditMsg('Failed to save'); }
    finally { setEditSaving(false); }
  };

  const handleRemove = async (u) => {
    if (!window.confirm(`Remove ${u.name} from the team? This cannot be undone.`)) return;
    try {
      await axios.put(`/api/users/${u._id}`, { isActive: false });
      load();
    } catch { alert('Failed to remove member'); }
  };

  if (loading) return <div className="loading">Loading team…</div>;

  const activeUsers = users.filter(u => u.isActive);

  return (
    <>
      <div className="section-head">
        <div className="section-title">Sales team</div>
        <button className="btn primary" onClick={() => setShowForm(s => !s)}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showForm ? 'Cancel' : '+ Add member'}
        </button>
      </div>

      {showForm && (
        <div className="form-wrap">
          <div className="form-title">Add new team member</div>
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="field"><label>Full name</label><input type="text" placeholder="Riya Sharma" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required /></div>
              <div className="field"><label>Email</label><input type="email" placeholder="riya@elbowgrease.in" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required /></div>
              <div className="field"><label>Phone</label><input type="tel" placeholder="98XXX XXXXX" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                  <option value="employee">Sales executive</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="field"><label>Initial password</label><input type="text" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>
            </div>
            {error && <div style={{color:'var(--danger-text)',fontSize:12,marginTop:8}}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={saving}>{saving?'Adding…':'Add member'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div className="card-title">{activeUsers.length} members</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(u => (
                <>
                  <tr key={u._id}>
                    <td className="td-name" data-label="">
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className={`avatar ${avatarColor(u.name)}`}>{initials(u.name)}</div>
                        {u.name}
                      </div>
                    </td>
                    <td data-label="Email" className="td-light">{u.email}</td>
                    <td data-label="Phone">
                      <div className="call-cell td-light">
                        {u.phone || '—'}
                        {u.phone && (
                          <a className="call-btn" href={`tel:+91${u.phone?.replace(/\s/g,'')}`}
                            onClick={() => window.__stBanner?.(u.name, u.phone)}>
                            <PhoneIcon />
                          </a>
                        )}
                      </div>
                    </td>
                    <td data-label="Role" className="td-muted">
                      {u.role === 'manager' ? 'Manager' : 'Sales executive'}
                    </td>
                    <td data-label="Action">
                      <button
                        className="btn"
                        style={{fontSize:11,padding:'4px 12px'}}
                        onClick={() => editUser === u._id ? setEditUser(null) : openEdit(u)}>
                        {editUser === u._id ? 'Close' : '✏️ Edit'}
                      </button>
                    </td>
                  </tr>

                  {/* Inline edit form */}
                  {editUser === u._id && (
                    <tr key={`edit-${u._id}`}>
                      <td colSpan="5" style={{padding:0}}>
                        <div style={{
                          background:'var(--gray-25)',
                          border:'1px solid var(--border)',
                          borderRadius:'var(--radius-lg)',
                          padding:'18px 20px',
                          margin:'2px 8px 10px',
                        }}>
                          <div style={{fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                            Edit — {u.name}
                          </div>
                          <div className="form-grid">
                            <div className="field">
                              <label>Name</label>
                              <input type="text" value={editForm.name||''} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
                            </div>
                            <div className="field">
                              <label>Phone</label>
                              <input type="tel" value={editForm.phone||''} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} />
                            </div>
                            <div className="field">
                              <label>Role</label>
                              <select value={editForm.role||'employee'} onChange={e=>setEditForm(f=>({...f,role:e.target.value}))}>
                                <option value="employee">Sales executive</option>
                                <option value="manager">Manager</option>
                              </select>
                            </div>
                            <div className="field">
                              <label>New password (leave blank to keep current)</label>
                              <input type="password" placeholder="Min 6 characters" value={editForm.newPassword||''} onChange={e=>setEditForm(f=>({...f,newPassword:e.target.value}))} />
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:14,flexWrap:'wrap'}}>
                            <button className="btn primary" style={{fontSize:12}} onClick={() => handleSaveEdit(u._id)} disabled={editSaving}>
                              {editSaving ? 'Saving…' : 'Save changes'}
                            </button>
                            <button className="btn" style={{fontSize:12}} onClick={() => setEditUser(null)}>Cancel</button>
                            {u.role !== 'manager' && (
                              <button className="btn danger-btn" style={{fontSize:12,marginLeft:'auto'}} onClick={() => handleRemove(u)}>
                                Remove from team
                              </button>
                            )}
                            {editMsg && (
                              <span style={{
                                fontSize:12,fontWeight:600,
                                color: editMsg==='Saved!' ? 'var(--success-text)' : 'var(--danger-text)'
                              }}>{editMsg}</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}