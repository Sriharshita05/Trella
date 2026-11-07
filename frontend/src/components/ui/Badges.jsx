import Icon from './Icon';
import { priorityConfig, formatShortDate, getDueDateStatus } from '../../utils/helpers';

export function PriorityBadge({ priority, withIcon = true }) {
  const cfg = priorityConfig[priority];
  if (!cfg) return null;
  return (
    <span className={`badge ${cfg.className}`}>
      {withIcon && <span style={{ width: 6, height: 6, borderRadius: 99, background: cfg.color }} />}
      {cfg.label}
    </span>
  );
}

const DUE_STYLE = {
  overdue: { cls: 'badge-danger', suffix: 'Overdue' },
  today: { cls: 'badge-warning', suffix: 'Today' },
  tomorrow: { cls: 'badge-high', suffix: 'Tomorrow' },
  upcoming: { cls: 'badge-neutral', suffix: '' },
};

export function DueDateBadge({ date, completed = false }) {
  if (!date) return null;
  const status = completed ? 'upcoming' : getDueDateStatus(date) || 'upcoming';
  const s = DUE_STYLE[status];
  return (
    <span className={`badge ${s.cls}`} title={s.suffix ? `${s.suffix}` : undefined}>
      <Icon name="calendar" size={12} />
      {formatShortDate(date)}
    </span>
  );
}

export function LabelChip({ label, size = 'sm', onRemove }) {
  const color = label.color || '#3978E8';
  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${color}1A`,
        color,
        borderColor: `${color}40`,
        fontSize: size === 'md' ? 12.5 : 11,
        padding: size === 'md' ? '3px 10px' : '1px 8px',
      }}
    >
      {label.text}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove label ${label.text}`}
          style={{ background: 'none', border: 'none', padding: 0, marginLeft: 2, color: 'inherit', cursor: 'pointer', display: 'flex' }}
        >
          <Icon name="x" size={12} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}

const ROLE_STYLE = { owner: 'badge-warning', member: 'badge-blue', viewer: 'badge-neutral' };
export function RoleBadge({ role }) {
  return <span className={`badge ${ROLE_STYLE[role] || 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{role}</span>;
}
