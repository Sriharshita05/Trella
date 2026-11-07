import { useEffect } from 'react';
import Icon from './ui/Icon';

const SIZES = { sm: 440, md: 540, lg: 720, xl: 960 };

/**
 * Shared modal. Header (title + optional subtitle), scrolling body and optional sticky footer.
 * `bare` renders children straight into the shell for fully custom layouts (e.g. task details).
 * Becomes a bottom sheet on phones (see .modal-overlay in index.css).
 */
export default function Modal({ isOpen, onClose, title, subtitle, footer, children, size = 'md', bare = false, label }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal-content" style={{ maxWidth: SIZES[size] || SIZES.md }} role="dialog" aria-modal="true" aria-label={label || title}>
        {bare ? children : (
          <>
            {(title || subtitle) && (
              <div className="modal-header">
                <div style={{ minWidth: 0 }}>
                  {title && <h2 className="modal-title">{title}</h2>}
                  {subtitle && <p className="modal-sub">{subtitle}</p>}
                </div>
                <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close dialog" style={{ marginTop: -4, marginRight: -8 }}>
                  <Icon name="x" size={18} />
                </button>
              </div>
            )}
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </>
        )}
      </div>
    </div>
  );
}
