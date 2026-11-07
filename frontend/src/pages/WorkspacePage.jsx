import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { workspaceService, boardService } from '../services';
import { useAuth } from '../context/AuthContext';
import useBoardsAndActivity from '../hooks/useBoardsAndActivity';
import { getErrorMessage, gradients, formatRelative } from '../utils/helpers';
import AppLayout from '../components/AppLayout';
import Modal from '../components/Modal';
import Avatar, { AvatarGroup } from '../components/Avatar';
import ActivityList from '../components/ActivityList';
import InviteMemberModal from '../components/InviteMemberModal';
import WorkspaceSettingsModal from '../components/WorkspaceSettingsModal';
import BackgroundPicker from '../components/ui/BackgroundPicker';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { RoleBadge } from '../components/ui/Badges';
import { Skeleton, BoardCardSkeleton, ListSkeleton } from '../components/ui/Skeleton';

const EMPTY_BOARD = { name: '', description: '', background: gradients[0] };

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [boardForm, setBoardForm] = useState(EMPTY_BOARD);
  const [creating, setCreating] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => { fetchData(); }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wsRes, boardsRes, allWsRes] = await Promise.all([
        workspaceService.getById(workspaceId),
        boardService.getAll(workspaceId),
        workspaceService.getAll(),
      ]);
      setWorkspace(wsRes.data);
      setBoards(boardsRes.data);
      setWorkspaces(allWsRes.data);
    } catch (err) {
      setWorkspace(null);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspace = async () => {
    try {
      const [wsRes, allWsRes] = await Promise.all([workspaceService.getById(workspaceId), workspaceService.getAll()]);
      setWorkspace(wsRes.data);
      setWorkspaces(allWsRes.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const wsList = useMemo(() => (workspace ? [workspace] : []), [workspace?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  const { activity, loading: activityLoading } = useBoardsAndActivity(wsList, { enabled: !loading && !!workspace, activityBoards: 4, activityLimit: 8 });

  const isOwner = workspace?.owner?._id === user?._id;
  const myRole = isOwner ? 'owner' : workspace?.members?.find((m) => m.user?._id === user?._id)?.role;
  const canEdit = isOwner || myRole === 'member';

  const filteredBoards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? boards.filter((b) => `${b.name} ${b.description || ''}`.toLowerCase().includes(q)) : boards;
  }, [boards, query]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardForm.name.trim()) return;
    setCreating(true);
    try {
      const payload = { ...boardForm, name: boardForm.name.trim(), description: boardForm.description.trim() };
      const res = await boardService.create(workspaceId, payload);
      setBoards([res.data, ...boards]);
      setShowCreateBoard(false);
      setBoardForm(EMPTY_BOARD);
      toast.success('Board created!');
      navigate(`/board/${res.data._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveMember = async () => {
    const m = memberToRemove;
    try {
      const res = await workspaceService.removeMember(workspaceId, m.user?._id);
      setWorkspace(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (member, role) => {
    try {
      await workspaceService.updateMemberRole(workspaceId, member.user?._id, { role });
      await refreshWorkspace();
      toast.success('Role updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  /* ── Loading / not found ── */
  if (loading) {
    return (
      <AppLayout workspaces={workspaces} currentWorkspaceId={workspaceId}>
        <div className="page">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
            <Skeleton width={56} height={56} radius={16} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton width="30%" height={22} />
              <Skeleton width="50%" height={13} />
            </div>
          </div>
          <div className="grid-cards">{[0, 1, 2].map((i) => <BoardCardSkeleton key={i} />)}</div>
        </div>
      </AppLayout>
    );
  }

  if (!workspace) {
    return (
      <AppLayout workspaces={workspaces}>
        <div className="page">
          <EmptyState
            icon="alert"
            title="Workspace not found"
            description="It may have been deleted, or you might not have access to it."
            action={<Link to="/" className="btn btn-primary">Back to dashboard</Link>}
          />
        </div>
      </AppLayout>
    );
  }

  const members = [workspace.owner, ...(workspace.members || []).map((m) => m.user)].filter(Boolean);
  const color = workspace.color || '#3978E8';

  return (
    <AppLayout workspaces={workspaces} boards={boards} currentWorkspaceId={workspaceId}>
      <div className="page">
        <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 18 }}>
          <Link to="/">Dashboard</Link>
          <Icon name="chevronRight" size={14} />
          <span className="current">{workspace.name}</span>
        </nav>

        {/* Header */}
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <span className="ws-tile" style={{ width: 58, height: 58, fontSize: 25, borderRadius: 17, background: color, boxShadow: `0 10px 22px ${color}55` }}>
              {workspace.name?.[0]?.toUpperCase()}
            </span>
            <div style={{ minWidth: 0 }}>
              <h1 className="page-title" style={{ overflowWrap: 'anywhere' }}>{workspace.name}</h1>
              <p className="page-sub" style={{ marginTop: 4 }}>{workspace.description || 'No description yet.'}</p>
            </div>
          </div>

          <div className="page-actions">
            <AvatarGroup users={members} max={4} size="md" />
            {isOwner && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(true)}>
                  <Icon name="userPlus" size={16} /> Invite
                </button>
                <button type="button" className="btn btn-secondary btn-icon" onClick={() => setShowSettings(true)} aria-label="Workspace settings" title="Workspace settings">
                  <Icon name="settings" size={17} />
                </button>
              </>
            )}
            {canEdit && (
              <button type="button" className="btn btn-primary" onClick={() => setShowCreateBoard(true)}>
                <Icon name="plus" size={16} strokeWidth={2.5} /> New Board
              </button>
            )}
          </div>
        </header>

        <div className="dash-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, minWidth: 0 }}>
            {/* Boards */}
            <section>
              <div className="section-head">
                <h2 className="section-title">Boards <span className="count-pill">{boards.length}</span></h2>
                {boards.length > 0 && (
                  <label className="search" style={{ width: 'min(100%, 240px)' }}>
                    <Icon name="search" size={16} />
                    <input className="input" type="search" placeholder="Search boards…" aria-label="Search boards" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </label>
                )}
              </div>

              {boards.length === 0 ? (
                <EmptyState
                  icon="board"
                  title="No boards yet"
                  description={canEdit ? 'Create your first board to start planning work with To Do, In Progress and Done lists.' : 'Boards created in this workspace will show up here.'}
                  action={canEdit && <button type="button" className="btn btn-primary" onClick={() => setShowCreateBoard(true)}><Icon name="plus" size={16} strokeWidth={2.5} /> Create Board</button>}
                />
              ) : filteredBoards.length === 0 ? (
                <EmptyState compact icon="search" title={`No boards match “${query}”`} action={<button type="button" className="btn btn-secondary btn-sm" onClick={() => setQuery('')}>Clear search</button>} />
              ) : (
                <div className="grid-cards">
                  {filteredBoards.map((b) => <BoardCard key={b._id} board={b} />)}
                  {canEdit && !query && (
                    <button type="button" className="add-card" onClick={() => setShowCreateBoard(true)}>
                      <span className="add-card-icon"><Icon name="plus" size={20} /></span>
                      New Board
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Members */}
            <section>
              <div className="section-head">
                <h2 className="section-title">Members <span className="count-pill">{members.length}</span></h2>
                {isOwner && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInvite(true)}>
                    <Icon name="userPlus" size={15} /> Invite
                  </button>
                )}
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <MemberRow user={workspace.owner} role="owner" isCurrentUser={workspace.owner?._id === user?._id} />
                {workspace.members?.map((m) => (
                  <MemberRow
                    key={m._id || m.user?._id}
                    user={m.user}
                    role={m.role}
                    isCurrentUser={m.user?._id === user?._id}
                    canManage={isOwner && m.user?._id !== user?._id}
                    onRoleChange={(role) => handleRoleChange(m, role)}
                    onRemove={() => setMemberToRemove(m)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Activity */}
          <aside>
            <div className="section-head">
              <h2 className="section-title"><Icon name="activity" size={18} style={{ color: 'var(--blue)' }} /> Recent Activity</h2>
            </div>
            <div className="card card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {activityLoading ? (
                <div style={{ padding: '12px 0' }}><ListSkeleton rows={4} /></div>
              ) : activity.length === 0 ? (
                <EmptyState compact bare icon="clock" title="No activity yet" description="Work on a board and updates will appear here." />
              ) : (
                <ActivityList logs={activity} showBoard />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Create board */}
      <Modal
        isOpen={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
        title="Create board"
        subtitle={`A new board in ${workspace.name}.`}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateBoard(false)}>Cancel</button>
            <button type="submit" form="create-board-form" className="btn btn-primary" disabled={creating || !boardForm.name.trim()}>
              {creating ? 'Creating…' : 'Create board'}
            </button>
          </>
        }
      >
        <form id="create-board-form" onSubmit={handleCreateBoard} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ height: 74, borderRadius: 14, background: boardForm.background, display: 'flex', alignItems: 'flex-end', padding: 12, transition: 'background 0.25s' }}>
            <span style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700 }}>
              {boardForm.name.trim() || 'Board preview'}
            </span>
          </div>
          <div>
            <label className="label" htmlFor="board-name">Board name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input id="board-name" className="input" placeholder="e.g., Sprint 1" value={boardForm.name} maxLength={80}
              onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })} required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="board-desc">Description</label>
            <textarea id="board-desc" className="input" style={{ height: 76 }} placeholder="What is this board for?" value={boardForm.description}
              onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })} />
          </div>
          <div>
            <span className="label">Background</span>
            <BackgroundPicker value={boardForm.background} onChange={(background) => setBoardForm({ ...boardForm, background })} />
          </div>
        </form>
      </Modal>

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        workspaceId={workspaceId}
        onInvited={(ws) => { if (ws?._id) setWorkspace(ws); else refreshWorkspace(); }}
      />

      <WorkspaceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        workspace={workspace}
        onSaved={refreshWorkspace}
        onDeleted={() => navigate('/')}
      />

      <ConfirmDialog
        open={!!memberToRemove}
        title={`Remove ${memberToRemove?.user?.name || 'this member'}?`}
        message="They will lose access to every board in this workspace."
        confirmLabel="Remove member"
        onConfirm={handleRemoveMember}
        onCancel={() => setMemberToRemove(null)}
      />
    </AppLayout>
  );
}

function BoardCard({ board }) {
  return (
    <Link to={`/board/${board._id}`} className="card card-hover board-card">
      <div className="board-card-cover" style={{ background: board.background || 'linear-gradient(135deg,#3978E8,#8b5cf6)' }} />
      <div className="board-card-body">
        <h3 className="truncate" style={{ fontSize: 15, fontWeight: 700 }}>{board.name}</h3>
        {board.description && <p className="clamp-2" style={{ fontSize: 12.5, color: 'var(--text)' }}>{board.description}</p>}
        <div className="meta-row" style={{ marginTop: 'auto', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <span style={{ minWidth: 0 }}>
            {board.createdBy && <Avatar user={board.createdBy} size="xs" />}
            <span className="truncate">{board.createdAt ? formatRelative(board.createdAt) : ''}</span>
          </span>
          <Icon name="arrowRight" size={16} className="ws-card-arrow" />
        </div>
      </div>
    </Link>
  );
}

function MemberRow({ user, role, isCurrentUser, canManage, onRoleChange, onRemove }) {
  return (
    <div className="member-row">
      <Avatar user={user} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>
          {user?.name} {isCurrentUser && <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>(you)</span>}
        </p>
        <p className="truncate" style={{ fontSize: 12.5, color: 'var(--text)' }}>{user?.email}</p>
      </div>
      {canManage ? (
        <select className="input" style={{ width: 'auto', minHeight: 34, padding: '4px 34px 4px 12px', fontSize: 13 }} value={role}
          onChange={(e) => onRoleChange(e.target.value)} aria-label={`Role for ${user?.name}`}>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
      ) : (
        <RoleBadge role={role} />
      )}
      {canManage && (
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onRemove} aria-label={`Remove ${user?.name}`} title="Remove member">
          <Icon name="trash" size={16} />
        </button>
      )}
    </div>
  );
}
