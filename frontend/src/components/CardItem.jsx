import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AvatarGroup } from './Avatar';
import Icon from './ui/Icon';
import { PriorityBadge, DueDateBadge, LabelChip } from './ui/Badges';

/** Pure presentation of a task card — also used inside the DragOverlay. */
export function CardView({ card, onDelete, isOverlay = false, isGhost = false, innerRef, style, ...rest }) {
  const cls = ['task-card', card.completed ? 'is-done' : '', isOverlay ? 'is-overlay' : '', isGhost ? 'is-ghost' : ''].filter(Boolean).join(' ');
  return (
    <div ref={innerRef} style={style} className={cls} {...rest}>
      {card.coverColor && <div className="task-cover" style={{ background: card.coverColor }} />}

      {card.labels?.length > 0 && (
        <div className="task-labels">
          {card.labels.map((label, i) => <LabelChip key={`${label.text}-${i}`} label={label} />)}
        </div>
      )}

      <p className="task-title" style={onDelete ? { paddingRight: 22 } : undefined}>{card.title}</p>
      {card.description && <p className="task-desc clamp-2">{card.description}</p>}

      <div className="task-foot">
        <div className="task-meta">
          {card.priority && <PriorityBadge priority={card.priority} />}
          {card.dueDate && <DueDateBadge date={card.dueDate} completed={card.completed} />}
          {card.completed && <span className="badge badge-success"><Icon name="check" size={11} strokeWidth={3} /> Done</span>}
        </div>
        {card.assignees?.length > 0 && <AvatarGroup users={card.assignees} max={3} size="xs" />}
      </div>

      {onDelete && !isOverlay && (
        <button
          type="button"
          className="task-del"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Delete card ${card.title}`}
          title="Delete card"
        >
          <Icon name="trash" size={13} />
        </button>
      )}
    </div>
  );
}

/** Sortable wrapper — keeps the existing dnd-kit behaviour (same id, same listeners). */
export default function CardItem({ card, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id });

  return (
    <CardView
      card={card}
      onDelete={onDelete}
      isGhost={isDragging}
      innerRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onClick}
      {...attributes}
      {...listeners}
    />
  );
}
