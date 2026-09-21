import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const blank = {
  clientName:'', clientPhone:'', clientCity:'', callType:'cold',
  outcome:'interested', duration:'', notes:'', recordingLink:'',
  nextFollowUp:'', employee:'', amountQuoted:'', amountCollected:''
};

const GEMINI_KEY =  process.env.REACT_APP_GEMINI_KEY;;

export default function LogCall() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]         = useState(blank);
  const [employees, setEmps]    = useState([]);
  const [saving, setSaving]     = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError]       = useState('');
  const isManager = user?.role === 'manager';

  useEffect(() => {
    document.getElementById('page-title').textContent = 'Log a call';
    if (isManager) axios.get('/api/users').then(r => setEmps(r.data.filter(u => u.role === 'employee')));
  }, [isManager]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const enhanceNotes = async () => {
    if (!form.notes || form.notes.trim().length < 10) {
      alert('Please write some notes first before enhancing.');
      return;
    }
    setEnhancing(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a sales call notes enhancer for an Indian business consultancy called Elbow Grease Business Solutions.
Convert these rough sales call notes into a clean, professional summary in 3-4 sentences.
Keep it factual and professional.
Preserve all specific details like amounts, dates, schemes, and client information.
Do not add any information that is not in the original notes.
Write in simple clear English.

Raw notes: ${form.notes}

Enhanced summary:`
              }]
            }],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.3,
            }
          })
        }
      );
      const data = await response.json();
      const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (enhanced) {
        set('notes', enhanced);
      } else {
        alert('AI could not enhance notes. Please try again.');
      }
    } catch (err) {
      alert('AI enhancement failed. Check your internet connection.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isManager) delete payload.employee;
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
            <input type="text" placeholder="Rajesh Agrotech Pvt. Ltd."
              value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
          </div>

          <div className="field">
            <label>Phone number</label>
            <input type="tel" placeholder="98XXX XXXXX"
              value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} required />
          </div>

          <div className="field">
            <label>City</label>
            <input type="text" placeholder="Jaipur"
              value={form.clientCity} onChange={e => set('clientCity', e.target.value)} />
          </div>

          <div className="field">
            <label>Duration (mins)</label>
            <input type="number" placeholder="5" min="0"
              value={form.duration} onChange={e => set('duration', e.target.value)} />
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

          <div className="field">
            <label>Amount quoted (₹)</label>
            <input type="number" placeholder="0" min="0"
              value={form.amountQuoted} onChange={e => set('amountQuoted', e.target.value)} />
          </div>

          <div className="field">
            <label>Amount collected (₹)</label>
            <input type="number" placeholder="0" min="0"
              value={form.amountCollected} onChange={e => set('amountCollected', e.target.value)} />
          </div>

          {/* AI Enhanced Notes */}
          <div className="field full">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
              <label style={{margin:0}}>Notes / remarks</label>
              <button
                type="button"
                onClick={enhanceNotes}
                disabled={enhancing}
                style={{
                  fontSize: 11,
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid var(--accent)',
                  background: enhancing ? 'var(--accent)' : 'var(--accent-bg)',
                  color: enhancing ? '#fff' : 'var(--accent-text)',
                  cursor: enhancing ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}>
                {enhancing ? '✨ Enhancing…' : '✨ Enhance with AI'}
              </button>
            </div>
            <textarea
              placeholder="Write rough notes here — what was discussed, client concerns, objections, next steps… then click Enhance with AI to make it professional"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              style={{minHeight: 110}}
            />
            {enhancing && (
              <div style={{
                fontSize: 11,
                color: 'var(--accent-text)',
                marginTop: 4,
                fontStyle: 'italic',
              }}>
                ✨ AI is enhancing your notes…
              </div>
            )}
          </div>

          <div className="field full">
            <label>Recording link (optional)</label>
            <input type="url" placeholder="https://drive.google.com/…"
              value={form.recordingLink} onChange={e => set('recordingLink', e.target.value)} />
          </div>

        </div>

        {error && (
          <div style={{color:'var(--danger-text)',fontSize:12,marginTop:8}}>
            {error}
          </div>
        )}

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