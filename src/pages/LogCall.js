import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const blank = { clientName:'', clientPhone:'', clientCity:'', callType:'cold', outcome:'interested', duration:'', notes:'', recordingLink:'', nextFollowUp:'', employee:'', amountQuoted:'', amountCollected:'' };

export default function LogCall() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState(blank);
  const [employees, setEmps]  = useState([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const isManager = user?.role === 'manager';

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Log a call';
    if (isManager) axios.get('/api/users').then(r => setEmps(r.data.filter(u => u.role === 'employee')));
  }, [isManager]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isManager) delete payload.employee; // backend uses req.user._id
      await axios.post('/api/calls', payload);
      navigate('/calls');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save call. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-title">Log a new call</div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          {isManager && (
            <div className="field">
              <label>Employee</label>
              <select value={form.employee} onChange={e => set('employee', e.target.value)} required>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>
          )}

          <div className="field">
            <label>Call type</label>
            <select value={form.callType} onChange={e => set('callType', e.target.value)}>
              <option value="cold">Cold call</option>
              <option value="followup">Follow-up</option>
            </select>
          </div>

          <div className="field">
            <label>Client name</label>
            <input type="text" placeholder="Rajesh Agrotech Pvt. Ltd." value={form.clientName}
              onChange={e => set('clientName', e.target.value)} required />
          </div>

          <div className="field">
            <label>Phone number</label>
            <input type="tel" placeholder="98XXX XXXXX" value={form.clientPhone}
              onChange={e => set('clientPhone', e.target.value)} required />
          </div>

          <div className="field">
            <label>City</label>
            <input type="text" placeholder="Jaipur" value={form.clientCity}
              onChange={e => set('clientCity', e.target.value)} />
          </div>

          <div className="field">
            <label>Duration (mins)</label>
            <input type="number" placeholder="5" min="0" value={form.duration}
              onChange={e => set('duration', e.target.value)} />
          </div>

          <div className="field">
            <label>Outcome</label>
            <select value={form.outcome} onChange={e => set('outcome', e.target.value)}>
              <option value="interested">Interested</option>
              <option value="not-interested">Not interested</option>
              <option value="callback">Callback requested</option>
              <option value="no-answer">No answer</option>
            </select>
          </div>

          <div className="field">
            <label>Next follow-up date</label>
            <input type="date" value={form.nextFollowUp}
              onChange={e => set('nextFollowUp', e.target.value)} />
          </div>

          <div className="field full">
            <label>Notes / remarks</label>
            <textarea placeholder="What was discussed, objections raised, next steps…"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
<div className="field">
  <label>Amount quoted (₹)</label>
  <input type="number" placeholder="0" min="0" value={form.amountQuoted}
    onChange={e => set('amountQuoted', e.target.value)} />
</div>

<div className="field">
  <label>Amount collected (₹)</label>
  <input type="number" placeholder="0" min="0" value={form.amountCollected}
    onChange={e => set('amountCollected', e.target.value)} />
</div>
          <div className="field full">
            <label>Recording link (optional)</label>
            <input type="url" placeholder="https://drive.google.com/…" value={form.recordingLink}
              onChange={e => set('recordingLink', e.target.value)} />
          </div>

        </div>

        {error && <div className="login-error" style={{textAlign:'left',marginTop:8}}>{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn" onClick={() => setForm(blank)}>Clear</button>
          <button type="submit" className="btn primary" disabled={saving}>
            <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'Saving…' : 'Save call'}
          </button>
        </div>
      </form>
    </div>
  );
}
