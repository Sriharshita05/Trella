import { formatRelative, activityLabels } from '../utils/helpers';
import Avatar from './Avatar';

/** One activity row — shared by the dashboard, workspace page and board side panel. */
export function ActivityItem({ log, showBoard = false }) {
  return (
    <div className="activity-item">
      <Avatar user={log.user} size="sm" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="activity-text">
          <b>{log.user?.name || 'Someone'}</b> {activityLabels[log.action] || String(log.action || '').replace(/_/g, ' ')}
          {log.entityName && <> <span className="ent">“{log.entityName}”</span></>}
          {log.metadata?.from && log.metadata?.to && <> from <b>{log.metadata.from}</b> to <b>{log.metadata.to}</b></>}
          {showBoard && log.boardName && <> in <b>{log.boardName}</b></>}
        </p>
        <p className="activity-time">{formatRelative(log.createdAt)}</p>
      </div>
    </div>
  );
}

export default function ActivityList({ logs = [], showBoard = false }) {
  return (
    <div className="activity-list">
      {logs.map((log, i) => <ActivityItem key={log._id || i} log={log} showBoard={showBoard} />)}
    </div>
  );
}
