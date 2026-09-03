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

  const toggleActive = async (u) => {
    await axios.put(`/api/users/${u._id}`, { ...u, isActive: !u.isActive });
    load();
  };

  if (loading) return <div className="loading">Loading team…</div>;

  return (
    <>
      <div className="section-head">
        <div className="section-title">Sales team</div>
        <button className="btn primary" onClick={() => setShowForm(s => !s)}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showForm ? 'Cancel' : 'Add member'}
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
                  <option value="employee">Sales employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="field"><label>Password</label><input type="text" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>
            </div>
            {error && <div style={{color:'var(--danger-text)',fontSize:12,marginTop:8}}>{error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn primary" disabled={saving}>{saving?'Adding…':'Add member'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
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
                      {u.phone}
                      {u.phone && (
                        <a className="call-btn" href={`tel:+91${u.phone?.replace(/\s/g,'')}`}
                          onClick={() => window.__stBanner?.(u.name, u.phone)}>
                          <PhoneIcon />
                        </a>
                      )}
                    </div>
                  </td>
                  <td data-label="Role" className="td-muted">{u.role === 'manager' ? 'Manager' : 'Sales executive'}</td>
                  <td data-label="Status">
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      <span className="dot"/>{u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Action">
                    <button className="btn" style={{fontSize:11,padding:'4px 10px'}} onClick={() => toggleActive(u)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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
