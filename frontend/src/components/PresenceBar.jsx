import { AvatarGroup } from './Avatar';

/** Live "who's online" indicator fed by the Socket.IO presence-update event. */
export default function PresenceBar({ users = [] }) {
  if (users.length === 0) return null;
  return (
    <div className="presence" title={users.map((u) => u.name).join(', ')}>
      <span className="presence-dot" />
      <span>{users.length} online</span>
      <AvatarGroup users={users} max={4} size="xs" />
    </div>
  );
}
