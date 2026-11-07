import { useEffect, useState } from 'react';
import { boardService } from '../services';
import { getErrorMessage } from '../utils/helpers';
import Modal from './Modal';
import BackgroundPicker from './ui/BackgroundPicker';
import ConfirmDialog from './ui/ConfirmDialog';
import Icon from './ui/Icon';
import toast from 'react-hot-toast';

/** Rename / restyle / delete a board via the existing PUT and DELETE /boards/:id endpoints. */
export default function BoardSettingsModal({ isOpen, onClose, board, onSaved, onDeleted }) {
  const [form, setForm] = useState({ name: '', background: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen && board) setForm({ name: board.name || '', background: board.background || '' });
  }, [isOpen, board]);

  const dirty = board && (form.name.trim() !== board.name || form.background !== board.background);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !dirty) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), background: form.background };
      await boardService.update(board._id, payload);
      toast.success('Board updated');
      onSaved?.(payload);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await boardService.delete(board._id);
      toast.success('Board deleted');
      setConfirmDelete(false);
      onDeleted?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Board settings"
        subtitle="Rename this board or change its colour."
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" form="board-settings-form" className="btn btn-primary" disabled={saving || !form.name.trim() || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        }
      >
        <form id="board-settings-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="label" htmlFor="bs-name">Board name</label>
            <input id="bs-name" className="input" value={form.name} maxLength={80} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <span className="label">Background</span>
            <BackgroundPicker value={form.background} onChange={(background) => setForm({ ...form, background })} />
          </div>
          <div className="danger-zone">
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#B91C1C' }}>Delete board</p>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text)' }}>Removes the board with all its lists and cards.</p>
            </div>
            <button type="button" className="btn btn-danger-soft btn-sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={14} /> Delete
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${board?.name}”?`}
        message="All lists and cards on this board will be permanently deleted. This can’t be undone."
        confirmLabel="Delete board"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
