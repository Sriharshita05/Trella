import { useEffect, useState } from 'react';
import { workspaceService } from '../services';
import { getErrorMessage } from '../utils/helpers';
import Modal from './Modal';
import toast from 'react-hot-toast';

/** Invite by email using the existing POST /workspaces/:id/invite endpoint. */
export default function InviteMemberModal({ isOpen, onClose, workspaceId, onInvited }) {
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => { if (isOpen) setForm({ email: '', role: 'member' }); }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await workspaceService.invite(workspaceId, form);
      toast.success('Member invited!');
      onInvited?.(res.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite a teammate"
      subtitle="They’ll get access to every board in this workspace."
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="invite-form" className="btn btn-primary" disabled={inviting || !form.email.trim()}>
            {inviting ? 'Inviting…' : 'Send invite'}
          </button>
        </>
      }
    >
      <form id="invite-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="label" htmlFor="invite-email">Email address</label>
          <input id="invite-email" className="input" type="email" placeholder="colleague@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="invite-role">Role</label>
          <select id="invite-role" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="member">Member — can edit</option>
            <option value="viewer">Viewer — read only</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
