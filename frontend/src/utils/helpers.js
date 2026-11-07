import { format, formatDistance, isPast, isToday, isTomorrow, isThisYear } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return null;
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatShortDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return format(d, isThisYear(d) ? 'MMM d' : 'MMM d, yyyy');
};

export const formatRelative = (date) => {
  if (!date) return null;
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const getDueDateStatus = (dueDate) => {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isPast(d) && !isToday(d)) return 'overdue';
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  return 'upcoming';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    'An unexpected error occurred'
  );
};

export const priorityConfig = {
  low: { label: 'Low', className: 'badge-low', color: '#16A36A' },
  medium: { label: 'Medium', className: 'badge-medium', color: '#F59E0B' },
  high: { label: 'High', className: 'badge-high', color: '#EA6A12' },
  urgent: { label: 'Urgent', className: 'badge-urgent', color: '#EF4444' },
};

export const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #fd7979 0%, #feca57 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

export const workspaceColors = [
  '#3978E8', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4',
];

export const getGreeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/** Subtle accent colour for a Kanban column — keyed off its name, falling back to a rotating palette. */
const COLUMN_PALETTE = ['#3978E8', '#F59E0B', '#16A36A', '#8B5CF6', '#EC4899', '#14B8A6'];
export const getColumnColor = (name = '', index = 0) => {
  const n = name.toLowerCase();
  if (/(to ?-?do|backlog|todo|open|new)/.test(n)) return '#3978E8';
  if (/(progress|doing|review|wip|active)/.test(n)) return '#F59E0B';
  if (/(done|complete|closed|shipped|finished)/.test(n)) return '#16A36A';
  return COLUMN_PALETTE[index % COLUMN_PALETTE.length];
};

const AVATAR_PALETTE = ['#3978E8', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#EAB308', '#22C55E'];
export const getAvatarColor = (user) => {
  if (user?.color) return user.color;
  const key = user?.name || user?.email || '?';
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};

export const activityLabels = {
  card_created: 'created card',
  card_updated: 'updated card',
  card_moved: 'moved card',
  card_deleted: 'deleted card',
  card_completed: 'completed card',
  comment_added: 'commented on',
  comment_deleted: 'deleted a comment on',
  list_created: 'created list',
  list_renamed: 'renamed list',
  list_deleted: 'deleted list',
  list_reordered: 'reordered lists',
  member_added: 'added member',
  member_removed: 'removed member',
  board_created: 'created board',
  board_updated: 'updated board',
};
