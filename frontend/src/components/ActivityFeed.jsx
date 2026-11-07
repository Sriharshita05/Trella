import Icon from './ui/Icon';
import EmptyState from './ui/EmptyState';
import ActivityList from './ActivityList';

/** Board activity side panel (real-time via the activity-updated socket event). */
export default function ActivityFeed({ logs, onClose }) {
  return (
    <aside className="side-panel" aria-label="Board activity">
      <div className="side-panel-head">
        <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="activity" size={17} style={{ color: 'var(--blue)' }} /> Activity
        </h3>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close activity panel">
          <Icon name="x" size={17} />
        </button>
      </div>
      <div className="side-panel-body">
        {logs.length === 0
          ? <div style={{ paddingTop: 16 }}><EmptyState compact bare icon="activity" title="No activity yet" description="Changes to this board will show up here." /></div>
          : <ActivityList logs={logs} />}
      </div>
    </aside>
  );
}
