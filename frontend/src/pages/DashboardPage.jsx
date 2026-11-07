import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { workspaceService } from '../services';
import { useAuth } from '../context/AuthContext';
import useBoardsAndActivity from '../hooks/useBoardsAndActivity';
import { getErrorMessage, getGreeting } from '../utils/helpers';
import AppLayout from '../components/AppLayout';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import ActivityList from '../components/ActivityList';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { Skeleton, WorkspaceCardSkeleton, ListSkeleton } from '../components/ui/Skeleton';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await workspaceService.getAll();
        setWorkspaces(res.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { boardsByWs, activity, loading: metaLoading } = useBoardsAndActivity(workspaces, { enabled: !loading });

  const totalBoards = useMemo(() => Object.values(boardsByWs).reduce((n, list) => n + list.length, 0), [boardsByWs]);
  const teammates = useMemo(() => {
    const ids = new Set();
    workspaces.forEach((ws) => {
      ids.add(idOf(ws.owner));
      (ws.members || []).forEach((m) => ids.add(idOf(m.user)));
    });
    ids.delete(user?._id);
    ids.delete(undefined);
    return ids.size;
  }, [workspaces, user?._id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workspaces;
    return workspaces.filter((w) => `${w.name} ${w.description || ''}`.toLowerCase().includes(q));
  }, [workspaces, query]);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const boardsKnown = !loading && !metaLoading;

  return (
    <AppLayout workspaces={workspaces}>
      <div className="page">
        {/* Welcome */}
        <section className="hero">
          <div>
            <h1 className="hero-title">{getGreeting()}, {firstName} 👋</h1>
            <p className="hero-sub">Your workspaces, boards and team activity — everything you need to keep work moving, in one place.</p>
          </div>
          <button id="create-workspace-btn" type="button" className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
            <Icon name="plus" size={18} strokeWidth={2.5} /> New Workspace
          </button>
        </section>

        {/* Stats */}
        <section className="stats" aria-label="Overview">
          <Stat icon="layers" tone="blue" label="Workspaces" value={loading ? null : workspaces.length} />
          <Stat icon="board" tone="lav" label="Boards" value={boardsKnown ? totalBoards : null} />
          <Stat icon="users" tone="green" label="Teammates" value={loading ? null : teammates} />
        </section>

        <div className="dash-grid">
          {/* Workspaces */}
          <section>
            <div className="section-head">
              <h2 className="section-title">
                Your Workspaces {!loading && <span className="count-pill">{workspaces.length}</span>}
              </h2>
              {workspaces.length > 0 && (
                <label className="search" style={{ width: 'min(100%, 260px)' }}>
                  <Icon name="search" size={16} />
                  <input
                    className="input"
                    type="search"
                    placeholder="Search workspaces…"
                    aria-label="Search workspaces"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              )}
            </div>

            {loading ? (
              <div className="grid-cards">{[0, 1, 2].map((i) => <WorkspaceCardSkeleton key={i} />)}</div>
            ) : workspaces.length === 0 ? (
              <EmptyState
                icon="layers"
                title="No workspaces yet"
                description="Create your first workspace to start organising boards, tasks and collaborating with your team."
                action={<button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}><Icon name="plus" size={16} strokeWidth={2.5} /> Create Workspace</button>}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                compact
                icon="search"
                title={`No workspaces match “${query}”`}
                description="Try a different name or clear the search."
                action={<button type="button" className="btn btn-secondary btn-sm" onClick={() => setQuery('')}>Clear search</button>}
              />
            ) : (
              <div className="grid-cards">
                {filtered.map((ws) => (
                  <WorkspaceCard key={ws._id} workspace={ws} boardCount={boardsKnown ? boardsByWs[ws._id]?.length : undefined} />
                ))}
                {!query && (
                  <button type="button" className="add-card" onClick={() => setShowCreate(true)}>
                    <span className="add-card-icon"><Icon name="plus" size={20} /></span>
                    New Workspace
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Recent activity */}
          <aside>
            <div className="section-head">
              <h2 className="section-title"><Icon name="activity" size={18} style={{ color: 'var(--blue)' }} /> Recent Activity</h2>
            </div>
            <div className="card card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {loading || metaLoading ? (
                <div style={{ padding: '12px 0' }}><ListSkeleton rows={4} /></div>
              ) : activity.length === 0 ? (
                <EmptyState compact bare icon="clock" title="Nothing here yet" description="Updates from your boards will appear here as your team works." />
              ) : (
                <ActivityList logs={activity} showBoard />
              )}
            </div>
          </aside>
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(ws) => { setShowCreate(false); navigate(`/workspace/${ws._id}`); }}
      />
    </AppLayout>
  );
}

const TONES = {
  blue: { bg: 'var(--blue-lt)', fg: 'var(--blue-700)' },
  lav: { bg: 'var(--lavender)', fg: '#5B45C7' },
  green: { bg: 'var(--success-bg)', fg: '#0F7A50' },
};

function Stat({ icon, tone, label, value }) {
  const t = TONES[tone];
  return (
    <div className="card stat">
      <div className="stat-icon" style={{ background: t.bg, color: t.fg }}><Icon name={icon} size={21} /></div>
      <div>
        {value === null ? <Skeleton width={36} height={24} style={{ marginBottom: 4 }} /> : <p className="stat-num">{value}</p>}
        <p className="stat-lbl">{label}</p>
      </div>
    </div>
  );
}

function WorkspaceCard({ workspace, boardCount }) {
  const memberCount = (workspace.members?.length || 0) + 1;
  const color = workspace.color || '#3978E8';
  return (
    <Link to={`/workspace/${workspace._id}`} className="card card-hover ws-card">
      <div className="ws-card-top" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="ws-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span className="ws-tile" style={{ width: 44, height: 44, fontSize: 19, borderRadius: 13, background: color, boxShadow: `0 6px 14px ${color}55` }}>
            {workspace.name?.[0]?.toUpperCase() || '?'}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="truncate" style={{ fontSize: 15.5, fontWeight: 700 }}>{workspace.name}</h3>
            <p className="clamp-2" style={{ fontSize: 12.5, color: 'var(--text)', minHeight: 18 }}>
              {workspace.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="meta-row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <div className="meta-row">
            <span><Icon name="users" size={14} /> {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            <span>
              <Icon name="board" size={14} />
              {boardCount === undefined ? '– boards' : `${boardCount} board${boardCount !== 1 ? 's' : ''}`}
            </span>
          </div>
          <Icon name="arrowRight" size={16} className="ws-card-arrow" />
        </div>
      </div>
    </Link>
  );
}
