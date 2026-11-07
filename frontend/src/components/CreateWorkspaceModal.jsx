import { useEffect, useState } from 'react';
import { workspaceService } from '../services';
import { getErrorMessage, workspaceColors } from '../utils/helpers';
import Modal from './Modal';
import ColorSwatches from './ui/ColorSwatches';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', color: '#3978E8' };

/** Shared by the dashboard and the sidebar "+" action. */
export default function CreateWorkspaceModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (isOpen) setForm(EMPTY); }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await workspaceService.create({ ...form, name: form.name.trim() });
      toast.success('Workspace created!');
      onCreated?.(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create workspace"
      subtitle="A workspace groups related boards and the people working on them."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="create-workspace-form" className="btn btn-primary" disabled={creating || !form.name.trim()}>
            {creating ? 'Creating…' : 'Create workspace'}
          </button>
        </>
      }
    >
      <form id="create-workspace-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Live preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: form.color, color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 14px ${form.color}55`, transition: 'background 0.2s' }}>
            {form.name.trim()[0]?.toUpperCase() || 'W'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.name.trim() || 'Your workspace'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text)' }}>Preview</p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="ws-name">Workspace name <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input id="ws-name" className="input" placeholder="e.g., Marketing Team" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus maxLength={60} />
        </div>
        <div>
          <label className="label" htmlFor="ws-description">Description</label>
          <textarea id="ws-description" className="input" style={{ height: 84, resize: 'none' }} placeholder="What is this workspace for?"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <span className="label">Colour</span>
          <ColorSwatches colors={workspaceColors} value={form.color} onChange={(color) => setForm({ ...form, color })} />
        </div>
      </form>
    </Modal>
  );
}
