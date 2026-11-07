export function Skeleton({ width = '100%', height = 14, radius, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <Skeleton height={4} radius={0} />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Skeleton width={42} height={42} radius={12} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="85%" height={11} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width={90} height={12} />
          <Skeleton width={60} height={12} />
        </div>
      </div>
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <Skeleton height={76} radius={0} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton width="65%" height={14} />
        <Skeleton width="40%" height={11} />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Skeleton width={28} height={28} radius={99} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width="80%" height={11} />
            <Skeleton width="35%" height={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 16, padding: 20, overflow: 'hidden' }}>
      {[3, 2, 2].map((n, i) => (
        <div key={i} className="kanban-col" style={{ padding: 12, gap: 10 }}>
          <Skeleton width="45%" height={14} style={{ marginBottom: 6 }} />
          {Array.from({ length: n }).map((_, j) => (
            <div key={j} className="task-card" style={{ cursor: 'default' }}>
              <Skeleton width="30%" height={16} radius={99} style={{ marginBottom: 10 }} />
              <Skeleton width="90%" height={13} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={11} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
