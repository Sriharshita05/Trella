import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CardItem from './CardItem';
import Menu from './ui/Menu';
import Icon from './ui/Icon';
import { getColumnColor } from '../utils/helpers';

export default function KanbanList({
  list,
  index = 0,
  canEdit = true,
  onAddCard,
  onRenameList,
  onDeleteList,
  onCardClick,
  onDeleteCard,
}) {
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [adding, setAdding] = useState(false);
  const nameInputRef = useRef(null);

  const { setNodeRef, isOver } = useDroppable({ id: list._id });
  const color = getColumnColor(list.name, index);

  useEffect(() => { setListName(list.name); }, [list.name]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleAddCard = async (e) => {
    e?.preventDefault();
    if (!cardTitle.trim() || adding) return;
    setAdding(true);
    await onAddCard(list._id, cardTitle.trim());
    setCardTitle('');
    setAdding(false);
    setAddingCard(false);
  };

  const handleRenameSubmit = () => {
    if (listName.trim() && listName.trim() !== list.name) {
      onRenameList(list._id, listName.trim());
    } else {
      setListName(list.name);
    }
    setEditingName(false);
  };

  const cardIds = list.cards.map((c) => c._id);

  return (
    <section className={`kanban-col ${isOver ? 'is-over' : ''}`} style={{ '--col': color, borderTop: `3px solid ${color}` }} aria-label={list.name}>
      <div className="kanban-head">
        <span className="col-dot" />
        {editingName ? (
          <input
            ref={nameInputRef}
            className="input"
            style={{ flex: 1, minHeight: 32, padding: '4px 10px', fontSize: 14, fontWeight: 700 }}
            value={listName}
            maxLength={60}
            onChange={(e) => setListName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setListName(list.name); setEditingName(false); }
            }}
          />
        ) : (
          <button type="button" className="col-name" onClick={() => canEdit && setEditingName(true)} title={canEdit ? 'Click to rename' : list.name}>
            {list.name}
          </button>
        )}

        <span className="col-count" aria-label={`${list.cards.length} cards`}>{list.cards.length}</span>

        {canEdit && (
          <Menu
            label={`List actions for ${list.name}`}
            items={[
              { label: 'Rename list', icon: 'edit', onClick: () => setEditingName(true) },
              { label: 'Delete list', icon: 'trash', danger: true, onClick: () => onDeleteList(list._id) },
            ]}
          />
        )}
      </div>

      <div ref={setNodeRef} className="kanban-body">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem
              key={card._id}
              card={card}
              onClick={() => onCardClick(card)}
              onDelete={canEdit ? () => onDeleteCard(card._id, list._id) : undefined}
            />
          ))}
        </SortableContext>

        {list.cards.length === 0 && !addingCard && <div className="kanban-empty">Drop tasks here</div>}
      </div>

      {canEdit && (
        <div className="kanban-foot">
          {addingCard ? (
            <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                className="input"
                style={{ height: 78, minHeight: 78, resize: 'none', fontSize: 14 }}
                placeholder="Task title…"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                  if (e.key === 'Escape') { setAddingCard(false); setCardTitle(''); }
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={adding || !cardTitle.trim()} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  {adding ? 'Adding…' : 'Add task'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm btn-icon" aria-label="Cancel" onClick={() => { setAddingCard(false); setCardTitle(''); }}>
                  <Icon name="x" size={16} />
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="add-task-btn" onClick={() => setAddingCard(true)}>
              <Icon name="plus" size={16} /> Add task
            </button>
          )}
        </div>
      )}
    </section>
  );
}
