import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { cardService } from '../services';
import { getErrorMessage, formatRelative, priorityConfig, getDueDateStatus } from '../utils/helpers';
import Avatar from './Avatar';
import Modal from './Modal';
import ColorSwatches from './ui/ColorSwatches';
import ConfirmDialog from './ui/ConfirmDialog';
import Icon from './ui/Icon';
import { LabelChip, DueDateBadge } from './ui/Badges';
import { Skeleton } from './ui/Skeleton';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const LABEL_COLORS = ['#3978E8', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6'];
const toDateInput = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

/**
 * Task details. Two-column on desktop (content + properties), stacked bottom-sheet on phones.
 * Same API calls as before: GET/PUT /cards/:id and POST/DELETE /cards/:id/comments.
 */
export default function CardDetailModal({ cardId, boardId, onClose, onUpdated, onDeleted, emit, canEdit = true }) {
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [baseline, setBaseline] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState({ text: '', color: LABEL_COLORS[0] });
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { fetchCard(); }, [cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const formFromCard = (c) => ({
    title: c.title,
    description: c.description || '',
    priority: c.priority,
    dueDate: toDateInput(c.dueDate),
    completed: c.completed,
    labels: c.labels || [],
  });

  const fetchCard = async () => {
    try {
      const res = await cardService.getById(cardId);
      setCard(res.data.card);
      setComments(res.data.comments);
      const f = formFromCard(res.data.card);
      setForm(f);
      setBaseline(f);
    } catch (err) {
      toast.error(getErrorMessage(err));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const dirty = useMemo(() => baseline && JSON.stringify({ ...form, completed: 0 }) !== JSON.stringify({ ...baseline, completed: 0 }), [form, baseline]);

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const res = await cardService.update(cardId, { ...form, title: form.title.trim(), dueDate: form.dueDate || null });
      setCard(res.data);
      onUpdated(res.data);
      const f = formFromCard(res.data);
      setForm(f);
      setBaseline(f);
      toast.success('Task updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    try {
      const res = await cardService.update(cardId, { ...form, dueDate: form.dueDate || null, completed: !card.completed });
      setCard(res.data);
      setForm((f) => ({ ...f, completed: res.data.completed }));
      setBaseline((b) => ({ ...b, completed: res.data.completed }));
      onUpdated(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await cardService.addComment(cardId, { text: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
      emit?.('comment-added', { boardId, cardId, comment: res.data });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await cardService.deleteComment(cardId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      emit?.('comment-deleted', { boardId, cardId, commentId });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddLabel = () => {
    if (!newLabel.text.trim()) return;
    setForm((f) => ({ ...f, labels: [...f.labels, { text: newLabel.text.trim(), color: newLabel.color }] }));
    setNewLabel({ text: '', color: LABEL_COLORS[0] });
    setShowLabelForm(false);
  };

  const handleRemoveLabel = (index) => setForm((f) => ({ ...f, labels: f.labels.filter((_, i) => i !== index) }));

  if (loading) {
    return (
      <Modal isOpen onClose={onClose} title="Loading task…" size="xl">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          <Skeleton width="60%" height={22} />
          <Skeleton height={90} radius={12} />
          <Skeleton width="40%" height={14} />
        </div>
      </Modal>
    );
  }

  if (!card) return null;

  const dueStatus = getDueDateStatus(form.dueDate);

  return (
    <>
      <Modal isOpen onClose={onClose} size="xl" bare label={`Task: ${card.title}`}>
        {/* Top bar */}
        <div className="modal-header" style={{ paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span className="badge badge-blue"><Icon name="columns" size={12} /> {card.list?.name || 'Task'}</span>
            {card.completed && <span className="badge badge-success"><Icon name="check" size={11} strokeWidth={3} /> Completed</span>}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close task" style={{ marginTop: -4, marginRight: -8 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="cd-grid">
          {/* ── Main column ── */}
          <div className="cd-main">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={!canEdit}
                className={`check-btn ${card.completed ? 'is-on' : ''}`}
                aria-pressed={!!card.completed}
                aria-label={card.completed ? 'Mark as not completed' : 'Mark as completed'}
                title={card.completed ? 'Mark as not completed' : 'Mark as completed'}
                style={{ marginTop: 3 }}
              >
                {card.completed && <Icon name="check" size={14} strokeWidth={3.2} />}
              </button>
              <input
                className="cd-title"
                value={form.title}
                maxLength={200}
                readOnly={!canEdit}
                aria-label="Task title"
                placeholder="Task title"
                style={card.completed ? { textDecoration: 'line-through', color: 'var(--text)' } : undefined}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <section style={{ marginBottom: 26 }}>
              <h3 className="cd-section-title"><Icon name="alignLeft" size={16} style={{ color: 'var(--text)' }} /> Description</h3>
              <textarea
                className="input"
                style={{ minHeight: 120 }}
                placeholder={canEdit ? 'Add a more detailed description…' : 'No description'}
                value={form.description}
                readOnly={!canEdit}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </section>

            <section>
              <h3 className="cd-section-title">
                <Icon name="message" size={16} style={{ color: 'var(--text)' }} /> Comments <span className="count-pill">{comments.length}</span>
              </h3>

              {canEdit && (
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                  <textarea
                    className="input"
                    style={{ minHeight: 44, height: 44, resize: 'vertical' }}
                    placeholder="Write a comment…"
                    aria-label="Write a comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(e); }}
                  />
                  <button type="submit" disabled={submittingComment || !commentText.trim()} className="btn btn-primary btn-icon" aria-label="Post comment" title="Post comment (Ctrl+Enter)">
                    <Icon name="send" size={16} />
                  </button>
                </form>
              )}

              {comments.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-2)', padding: '4px 0 8px' }}>No comments yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {comments.map((c) => <CommentItem key={c._id} comment={c} onDelete={canEdit ? () => handleDeleteComment(c._id) : undefined} />)}
                </div>
              )}
            </section>
          </div>

          {/* ── Properties column ── */}
          <aside className="cd-aside" aria-label="Task properties">
            <div>
              <h4 className="cd-aside-title">Priority</h4>
              <div className="segmented" role="radiogroup" aria-label="Priority">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={form.priority === p}
                    disabled={!canEdit}
                    className={`seg-btn ${form.priority === p ? 'is-on' : ''}`}
                    style={{ '--c': priorityConfig[p].color }}
                    onClick={() => setForm({ ...form, priority: p })}
                  >
                    <span className="dot" /> {priorityConfig[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="cd-aside-title">Due date</h4>
              <input type="date" className="input" value={form.dueDate} readOnly={!canEdit} disabled={!canEdit} aria-label="Due date" onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              {form.dueDate && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DueDateBadge date={form.dueDate} completed={card.completed} />
                  {!card.completed && dueStatus === 'overdue' && <span style={{ fontSize: 12, color: '#B91C1C', fontWeight: 600 }}>Overdue</span>}
                  {!card.completed && dueStatus === 'today' && <span style={{ fontSize: 12, color: '#96620A', fontWeight: 600 }}>Due today</span>}
                  {canEdit && <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setForm({ ...form, dueDate: '' })}>Clear</button>}
                </div>
              )}
            </div>

            <div>
              <h4 className="cd-aside-title">Assigned to</h4>
              {card.assignees?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {card.assignees.map((a) => (
                    <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={a} size="sm" />
                      <span className="truncate" style={{ fontSize: 13.5, fontWeight: 500 }}>{a.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Nobody assigned</p>
              )}
            </div>

            <div>
              <h4 className="cd-aside-title">Labels</h4>
              {form.labels?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {form.labels.map((label, i) => (
                    <LabelChip key={`${label.text}-${i}`} label={label} size="md" onRemove={canEdit ? () => handleRemoveLabel(i) : undefined} />
                  ))}
                </div>
              )}
              {canEdit && (showLabelForm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <input
                    className="input"
                    style={{ minHeight: 36 }}
                    placeholder="Label name"
                    aria-label="Label name"
                    value={newLabel.text}
                    maxLength={24}
                    autoFocus
                    onChange={(e) => setNewLabel({ ...newLabel, text: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLabel(); } }}
                  />
                  <ColorSwatches colors={LABEL_COLORS} value={newLabel.color} onChange={(color) => setNewLabel({ ...newLabel, color })} shape="circle" size={24} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={handleAddLabel} disabled={!newLabel.text.trim()} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Add label</button>
                    <button type="button" onClick={() => setShowLabelForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowLabelForm(true)} className="btn btn-secondary btn-sm">
                  <Icon name="tag" size={14} /> Add label
                </button>
              ))}
              {!canEdit && !form.labels?.length && <p style={{ fontSize: 13, color: 'var(--text-2)' }}>No labels</p>}
            </div>

            {card.createdBy && (
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <h4 className="cd-aside-title">Created by</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={card.createdBy} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>{card.createdBy.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatRelative(card.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {canEdit ? (
            <button type="button" className="btn btn-danger-soft btn-sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={14} /> Delete
            </button>
          ) : <span />}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {dirty && <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>Unsaved changes</span>}
            <button type="button" className="btn btn-secondary" onClick={onClose}>{dirty ? 'Discard' : 'Close'}</button>
            {canEdit && (
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this card?"
        message={`“${card.title}” and its comments will be permanently deleted.`}
        confirmLabel="Delete card"
        onConfirm={() => { setConfirmDelete(false); onDeleted(cardId); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function CommentItem({ comment, onDelete }) {
  return (
    <div className="comment">
      <Avatar user={comment.author} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{comment.author?.name}</span>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatRelative(comment.createdAt)}</span>
          {onDelete && (
            <button type="button" onClick={onDelete} className="btn btn-ghost btn-icon btn-sm comment-del" style={{ marginLeft: 'auto', width: 28, height: 28, minHeight: 0 }} aria-label="Delete comment" title="Delete comment">
              <Icon name="trash" size={14} />
            </button>
          )}
        </div>
        <div className="comment-bubble">{comment.text}</div>
      </div>
    </div>
  );
}
