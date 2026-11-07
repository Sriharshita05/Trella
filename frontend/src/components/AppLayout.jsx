import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Icon, { BrandMark } from './ui/Icon';

/**
 * Authenticated app shell: sidebar (slide-in drawer below 1024px) + content column.
 * Pages render their own header and body inside `children`.
 * `board` switches the content area to a non-scrolling flex column for the Kanban view.
 */
export default function AppLayout({ workspaces = [], boards = [], currentWorkspaceId, board = false, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar
        workspaces={workspaces}
        boards={boards}
        currentWorkspaceId={currentWorkspaceId}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="app-main">
        <header className="mobile-bar">
          <button type="button" onClick={() => setMobileOpen(true)} className="btn btn-ghost btn-icon" aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>
          <Link to="/" className="brand">
            <BrandMark size={28} />
            <span className="brand-name" style={{ fontSize: 18 }}>Trella</span>
          </Link>
        </header>

        <div className={`app-content ${board ? 'is-board' : ''}`}>{children}</div>
      </div>
    </div>
  );
}
