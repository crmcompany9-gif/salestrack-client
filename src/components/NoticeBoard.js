import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TYPE_CONFIG = {
  general: { label: 'General',  color: 'var(--accent)',  bg: 'var(--accent-bg)',  emoji: '📢' },
  holiday: { label: 'Holiday',  color: 'var(--danger)',  bg: 'var(--danger-bg)',  emoji: '🎉' },
  target:  { label: 'Target',   color: 'var(--warn)',    bg: 'var(--warn-bg)',    emoji: '🎯' },
  urgent:  { label: 'Urgent',   color: 'var(--danger)',  bg: 'var(--danger-bg)',  emoji: '🔴' },
};

const blank = { title: '', message: '', type: 'general' };

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(blank);
  const [saving, setSaving]     = useState(false);
  const isManager = user?.role === 'manager';

  const load = () => axios.get('/api/notices').then(r => setNotices(r.data));

  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/notices', form);
      setForm(blank);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await axios.delete(`/api/notices/${id}`);
    load();
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-head">
        <div className="card-title">📋 Notice Board</div>
        {isManager && (
          <button className="btn primary" style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Post notice'}
          </button>
        )}
      </div>

      {/* Post form — manager only */}
      {showForm && isManager && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <form onSubmit={handlePost}>
            <div className="form-grid" style={{ marginBottom: 10 }}>
              <div className="field">
                <label>Title</label>
                <input type="text" placeholder="e.g. Office closed on Diwali"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="general">📢 General</option>
                  <option value="holiday">🎉 Holiday</option>
                  <option value="target">🎯 Target</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div className="field full">
                <label>Message</label>
                <textarea placeholder="Write your notice here…"
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required
                  style={{ minHeight: 70 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? 'Posting…' : 'Post notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices list */}
      <div style={{ padding: notices.length === 0 ? '24px 18px' : '8px 18px' }}>
        {notices.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No notices posted yet
          </div>
        )}
        {notices.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
          return (
            <div key={n._id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 0', borderBottom: '1px solid var(--border)'
            }}>
              {/* Color bar */}
              <div style={{
                width: 4, borderRadius: 4, alignSelf: 'stretch',
                background: cfg.color, flexShrink: 0, minHeight: 40
              }} />

              {/* Emoji + content */}
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{cfg.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                    background: cfg.bg, color: cfg.color
                  }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 4 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Posted by {n.postedByName} · {fmtDate(n.createdAt)}
                </div>
              </div>

              {/* Delete — manager only */}
              {isManager && (
                <button onClick={() => handleDelete(n._id)} title="Delete notice"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text3)', fontSize: 16, padding: '2px 4px', flexShrink: 0
                  }}>✕</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
