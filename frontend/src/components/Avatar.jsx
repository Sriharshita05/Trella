import { getInitials, getAvatarColor } from '../utils/helpers';

const SIZES = {
  xs: { wh: 24, fs: 10 },
  sm: { wh: 30, fs: 11.5 },
  md: { wh: 36, fs: 13 },
  lg: { wh: 42, fs: 15 },
  xl: { wh: 56, fs: 20 },
};

export default function Avatar({ user, size = 'md', showTooltip = true, ring = false }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div
      title={showTooltip ? user?.name : undefined}
      style={{
        width: s.wh, height: s.wh, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: s.fs, color: '#fff', letterSpacing: '0.02em',
        backgroundColor: getAvatarColor(user),
        boxShadow: ring ? '0 0 0 2px #fff' : 'inset 0 -2px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden', userSelect: 'none',
      }}
    >
      {user?.avatar
        ? <img src={user.avatar} alt={user.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : getInitials(user?.name || '?')}
    </div>
  );
}

/** Overlapping avatars with a "+N" overflow chip. */
export function AvatarGroup({ users = [], max = 4, size = 'sm' }) {
  const list = users.filter(Boolean);
  const visible = list.slice(0, max);
  const remaining = list.length - visible.length;
  const wh = (SIZES[size] || SIZES.sm).wh;
  return (
    <div className="avatar-stack">
      {visible.map((u, i) => (
        <Avatar key={u._id || i} user={u} size={size} ring />
      ))}
      {remaining > 0 && (
        <div
          style={{
            width: wh, height: wh, borderRadius: '50%', background: 'var(--blue-lt)', color: 'var(--blue-700)',
            boxShadow: '0 0 0 2px #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontWeight: 700,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
