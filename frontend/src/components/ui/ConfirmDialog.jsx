import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

/**
 * Replaces window.confirm(). Rendered above any open Modal.
 * Pressing Escape closes only this dialog (capture phase) — not the modal underneath.
 */
export default function ConfirmDialog({
  open, title = 'Are you sure?', message, confirmLabel = 'Delete', cancelLabel = 'Cancel',
  tone = 'danger', onConfirm, onCancel,
}) {
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCancel?.(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try { await onConfirm?.(); } finally { setBusy(false); }
  };

  const danger = tone === 'danger';

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 70 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="modal-content" style={{ maxWidth: 420 }} role="alertdialog" aria-modal="true" aria-label={title}>
        <div style={{ padding: 24, display: 'flex', gap: 16 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: danger ? 'var(--danger-bg)' : 'var(--blue-lt)',
              color: danger ? 'var(--danger)' : 'var(--blue)',
            }}
          >
            <Icon name={danger ? 'alert' : 'info'} size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>{title}</h3>
            {message && <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: 'var(--text)' }}>{message}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button ref={cancelRef} type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={handleConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
