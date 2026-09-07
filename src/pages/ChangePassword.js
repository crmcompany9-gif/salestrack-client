import { useState } from 'react';
import axios from 'axios';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match');
    }
    if (form.newPassword.length < 6) {
      return setError('New password must be at least 6 characters');
    }
    setSaving(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="form-wrap">
        <div className="form-title">🔒 Change password</div>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Current password</label>
            <input type="password" placeholder="Your current password"
              value={form.currentPassword}
              onChange={e => set('currentPassword', e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>New password</label>
            <input type="password" placeholder="At least 6 characters"
              value={form.newPassword}
              onChange={e => set('newPassword', e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Confirm new password</label>
            <input type="password" placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)} required />
          </div>
          {error   && <div style={{ color:'var(--danger-text)', fontSize:12, marginBottom:10 }}>{error}</div>}
          {success && <div style={{ color:'var(--success-text)', fontSize:12, marginBottom:10 }}>{success}</div>}
          <div className="form-actions" style={{ borderTop:'none', paddingTop:0, marginTop:4 }}>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}