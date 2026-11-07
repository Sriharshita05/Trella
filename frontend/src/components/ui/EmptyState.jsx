import Icon from './Icon';

/** Friendly empty state used on every screen that can have no data. */
export default function EmptyState({ icon = 'folder', title, description, action, dashed = false, compact = false, bare = false }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: compact ? '28px 20px' : '64px 24px',
        background: dashed || bare ? 'transparent' : '#fff',
        border: dashed ? '2px dashed var(--border-2)' : bare ? 'none' : '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        boxShadow: dashed || bare ? 'none' : 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          width: compact ? 48 : 68, height: compact ? 48 : 68, borderRadius: compact ? 14 : 20,
          margin: `0 auto ${compact ? 12 : 18}px`,
          background: 'linear-gradient(135deg, var(--blue-lt) 0%, var(--lavender) 100%)',
          color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={compact ? 22 : 30} strokeWidth={1.7} />
      </div>
      <h3 style={{ margin: 0, fontSize: compact ? 14.5 : 18, fontWeight: 700, color: 'var(--navy)' }}>{title}</h3>
      {description && (
        <p style={{ margin: '8px auto 0', maxWidth: 380, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
