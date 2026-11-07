import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import ProfileModal from './ProfileModal';
import Icon, { BrandMark } from './ui/Icon';

const COLLAPSE_KEY = 'trella.sidebar.collapsed';
const readCollapsed = () => { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; } };

/**
 * Left navigation. On ≥1024px it is a collapsible rail; below that it is a slide-in drawer
 * controlled by AppLayout (`mobileOpen` / `onMobileClose`).
 */
export default function Sidebar({ workspaces = [], boards = [], currentWorkspaceId, mobileOpen = false, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch { /* storage unavailable */ }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const onDashboard = !currentWorkspaceId && !boardId;

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onMobileClose} aria-hidden="true" />}

      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-head">
          <Link to="/" className="brand" title="Trella" aria-label="Trella home">
            <BrandMark size={34} />
            {!collapsed && <span className="brand-name nav-hide">Trella</span>}
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={collapsed ? 'chevronsRight' : 'chevronsLeft'} size={17} />
          </button>
          {mobileOpen && (
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onMobileClose} aria-label="Close menu" style={{ marginLeft: 'auto' }}>
              <Icon name="x" size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${onDashboard ? 'is-active' : ''}`} title="Dashboard" aria-current={onDashboard ? 'page' : undefined}>
            <Icon name="grid" size={18} />
            <span className="nav-text">Dashboard</span>
          </Link>

          <div className="sidebar-label-row">
            {!collapsed && <span className="section-label nav-hide">Workspaces</span>}
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              style={{ width: 26, height: 26, minHeight: 0 }}
              onClick={() => setShowCreate(true)}
              aria-label="Create workspace"
              title="Create workspace"
            >
              <Icon name="plus" size={15} />
            </button>
          </div>

          {workspaces.length === 0 && !collapsed && (
            <p style={{ padding: '4px 10px', fontSize: 12.5, color: 'var(--text-2)' }}>No workspaces yet.</p>
          )}

          {workspaces.map((ws) => {
            const active = currentWorkspaceId === ws._id;
            const showBoards = active && !collapsed && boards.length > 0;
            return (
              <div key={ws._id}>
                <Link
                  to={`/workspace/${ws._id}`}
                  className={`nav-item ${active && !boardId ? 'is-active' : ''}`}
                  title={ws.name}
                  aria-current={active && !boardId ? 'page' : undefined}
                >
                  <span className="ws-tile" style={{ width: 24, height: 24, fontSize: 12, background: ws.color || 'var(--blue)' }}>
                    {ws.name?.[0]?.toUpperCase() || '?'}
                  </span>
                  <span className="nav-text">{ws.name}</span>
                </Link>

                {showBoards && (
                  <div className="nav-sub">
                    {boards.map((b) => (
                      <Link key={b._id} to={`/board/${b._id}`} className={`nav-item ${boardId === b._id ? 'is-active' : ''}`} title={b.name}>
                        <Icon name="board" size={14} />
                        <span className="nav-text">{b.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="user-card">
            <button type="button" className="user-btn" onClick={() => setShowProfile(true)} title="Profile settings" aria-label="Open profile settings">
              <Avatar user={user} size="md" showTooltip={false} />
              <span className="user-meta" style={{ minWidth: 0, flex: 1 }}>
                <p className="user-name">{user?.name}</p>
                <p className="user-mail">{user?.email}</p>
              </span>
            </button>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={handleLogout} aria-label="Log out" title="Log out">
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <CreateWorkspaceModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(ws) => { setShowCreate(false); onMobileClose?.(); navigate(`/workspace/${ws._id}`); }}
      />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
