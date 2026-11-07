import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

/**
 * Small dropdown menu. items: [{ label, icon, onClick, danger }].
 * Closes on outside click, Escape and after choosing an item.
 */
export default function Menu({ items, label = 'More actions', align = 'right', trigger }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="menu-wrap" ref={ref}>
      {trigger ? trigger({ open, toggle: () => setOpen((o) => !o) }) : (
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Icon name="dots" size={16} />
        </button>
      )}
      {open && (
        <div className="menu" role="menu" style={align === 'left' ? { left: 0, right: 'auto', transformOrigin: 'top left' } : undefined}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className={`menu-item ${it.danger ? 'is-danger' : ''}`}
              onClick={() => { setOpen(false); it.onClick?.(); }}
            >
              {it.icon && <Icon name={it.icon} size={15} />}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
