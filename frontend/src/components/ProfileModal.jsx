import { useEffect, useState } from 'react';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import Modal from './Modal';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

/** Profile settings — name is editable via the existing PUT /auth/profile endpoint. */
export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (isOpen) setName(user?.name || ''); }, [isOpen, user?.name]);

  const dirty = name.trim() && name.trim() !== user?.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      const next = res.data?.user || res.data || {};
      updateUser({ name: next.name || name.trim(), ...(next.avatar ? { avatar: next.avatar } : {}) });
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile settings"
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="profile-form" className="btn btn-primary" disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar user={{ ...user, name: name || user?.name }} size="xl" showTooltip={false} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || user?.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="profile-name">Full name</label>
          <input id="profile-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="profile-email">Email</label>
          <input id="profile-email" className="input" value={user?.email || ''} disabled readOnly style={{ background: 'var(--bg)', color: 'var(--text)' }} />
          <p className="hint">Your email is used to sign in and can’t be changed here.</p>
        </div>
      </form>
    </Modal>
  );
}
