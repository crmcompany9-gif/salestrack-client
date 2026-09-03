// Avatar initials from name
export const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// Avatar color class based on name
export const avatarColor = (name = '') => {
  const colors = ['green', 'purple', 'warn', 'danger', ''];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

// Format date nicely
export const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  const now  = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (target - today) / (1000 * 60 * 60 * 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Is a follow-up overdue?
export const isOverdue = (d) => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));

// Is a follow-up due today or tomorrow?
export const isDueSoon = (d) => {
  if (!d) return false;
  const target = new Date(d);
  const today  = new Date(new Date().setHours(0,0,0,0));
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 2);
  return target >= today && target < tomorrow;
};

// Format time  e.g. "Today 10:32 AM"
export const fmtDateTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${fmtDate(d)}, ${timeStr}`;
};

// Badge class from outcome/status
export const outcomeBadge = (outcome) => {
  const map = {
    'interested':     'badge-interested',
    'not-interested': 'badge-not-interested',
    'callback':       'badge-callback',
    'no-answer':      'badge-no-answer',
  };
  return map[outcome] || 'badge-no-answer';
};

export const outcomeLabel = (outcome) => {
  const map = {
    'interested':     'Interested',
    'not-interested': 'Not interested',
    'callback':       'Callback',
    'no-answer':      'No answer',
  };
  return map[outcome] || outcome;
};

// Phone SVG icon (reused everywhere)
export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);
