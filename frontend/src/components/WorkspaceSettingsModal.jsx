import { useEffect, useState } from 'react';
import { workspaceService } from '../services';
import { getErrorMessage, workspaceColors } from '../utils/helpers';
import Modal from './Modal';
import ColorSwatches from './ui/ColorSwatches';
import ConfirmDialog from './ui/ConfirmDialog';
import Icon from './ui/Icon';
import toast from 'react-hot-toast';

/** Edit / delete a workspace via the existing PUT and DELETE /workspaces/:id endpoints. */
export default function WorkspaceSettingsModal({ isOpen, onClose, workspace, onSaved, onDeleted }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#3978E8' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen && workspace) {
      setForm({ name: workspace.name || '', description: workspace.description || '', color: workspace.color || '#3978E8' });
    }
  }, [isOpen, workspace]);

  const dirty = workspace && (
    form.name.trim() !== workspace.name ||
    form.description !== (workspace.description || '') ||
    form.color !== workspace.color
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !dirty) return;
    setSaving(true);
    try {
      await workspaceService.update(workspace._id, { ...form, name: form.name.trim() });
      toast.success('Workspace updated');
      await onSaved?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await workspaceService.delete(workspace._id);
      toast.success('Workspace deleted');
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
        title="Workspace settings"
        subtitle="Update how this workspace appears to your team."
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" form="workspace-settings-form" className="btn btn-primary" disabled={saving || !form.name.trim() || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        }
      >
        <form id="workspace-settings-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="label" htmlFor="wss-name">Workspace name</label>
            <input id="wss-name" className="input" value={form.name} maxLength={60} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="wss-desc">Description</label>
            <textarea id="wss-desc" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <span className="label">Colour</span>
            <ColorSwatches colors={workspaceColors} value={form.color} onChange={(color) => setForm({ ...form, color })} />
          </div>
          <div className="danger-zone">
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#B91C1C' }}>Delete workspace</p>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text)' }}>Permanently removes this workspace and its boards.</p>
            </div>
            <button type="button" className="btn btn-danger-soft btn-sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={14} /> Delete
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${workspace?.name}”?`}
        message="This permanently deletes the workspace and everything inside it. This can’t be undone."
        confirmLabel="Delete workspace"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
