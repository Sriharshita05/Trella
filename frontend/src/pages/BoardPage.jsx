import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { boardService, listService, cardService, workspaceService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getErrorMessage } from '../utils/helpers';
import AppLayout from '../components/AppLayout';
import KanbanList from '../components/KanbanList';
import { CardView } from '../components/CardItem';
import CardDetailModal from '../components/CardDetailModal';
import ActivityFeed from '../components/ActivityFeed';
import PresenceBar from '../components/PresenceBar';
import InviteMemberModal from '../components/InviteMemberModal';
import BoardSettingsModal from '../components/BoardSettingsModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { AvatarGroup } from '../components/Avatar';
import { KanbanSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { boardId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { joinBoard, leaveBoard, emit, on, off } = useSocket();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [fullWorkspace, setFullWorkspace] = useState(null);
  const [siblingBoards, setSiblingBoards] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );

  // Fetch board data
  useEffect(() => {
    fetchBoard();
    fetchWorkspaces();
    return () => {
      leaveBoard(boardId);
    };
  }, [boardId]);

  // Socket.IO events
  useEffect(() => {
    if (!boardId) return;

    joinBoard(boardId);

    const handlers = {
      'presence-update': (users) => setOnlineUsers(users),
      'card-created': ({ card, listId }) => {
        setLists((prev) =>
          prev.map((l) =>
            l._id === listId ? { ...l, cards: [...l.cards, card] } : l
          )
        );
      },
      'card-updated': ({ card }) => {
        setLists((prev) =>
          prev.map((l) => ({
            ...l,
            cards: l.cards.map((c) => (c._id === card._id ? card : c)),
          }))
        );
      },
      'card-moved': ({ cardId, sourceListId, targetListId, position, card }) => {
        setLists((prev) => {
          let movedCard = card;
          return prev.map((l) => {
            if (l._id === sourceListId) {
              return { ...l, cards: l.cards.filter((c) => c._id !== cardId) };
            }
            if (l._id === targetListId) {
              const newCards = [...l.cards.filter((c) => c._id !== cardId)];
              newCards.splice(position, 0, movedCard || { _id: cardId });
              return { ...l, cards: newCards };
            }
            return l;
          });
        });
      },
      'card-deleted': ({ cardId, listId }) => {
        setLists((prev) =>
          prev.map((l) =>
            l._id === listId
              ? { ...l, cards: l.cards.filter((c) => c._id !== cardId) }
              : l
          )
        );
      },
      'list-created': ({ list }) => {
        setLists((prev) => [...prev, { ...list, cards: [] }]);
      },
      'list-updated': ({ list }) => {
        setLists((prev) => prev.map((l) => (l._id === list._id ? { ...l, name: list.name } : l)));
      },
      'list-deleted': ({ listId }) => {
        setLists((prev) => prev.filter((l) => l._id !== listId));
      },
      'lists-reordered': ({ lists: reordered }) => {
        setLists((prev) => {
          const sorted = [...prev].sort((a, b) => {
            const ai = reordered.findIndex((r) => r._id === a._id);
            const bi = reordered.findIndex((r) => r._id === b._id);
            return ai - bi;
          });
          return sorted;
        });
      },
      'cards-reordered': ({ updates }) => {
        setLists((prev) => {
          const next = prev.map((l) => ({ ...l, cards: [...l.cards] }));
          updates.forEach(({ cardId, listId, position }) => {
            next.forEach((l) => {
              const idx = l.cards.findIndex((c) => c._id === cardId);
              if (idx !== -1) l.cards.splice(idx, 1);
            });
            const targetList = next.find((l) => l._id === listId);
            if (targetList) {
              const card = prev.flatMap((l) => l.cards).find((c) => c._id === cardId);
              if (card) targetList.cards.splice(position, 0, card);
            }
          });
          return next;
        });
      },
      'activity-updated': ({ log }) => {
        setActivityLogs((prev) => [log, ...prev].slice(0, 50));
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => on(event, handler));

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => off(event, handler));
    };
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const [boardRes, activityRes] = await Promise.all([
        boardService.getById(boardId),
        boardService.getActivity(boardId),
      ]);
      setBoard(boardRes.data.board);
      setLists(boardRes.data.lists);
      setWorkspace(boardRes.data.board.workspace);
      setActivityLogs(activityRes.data);
      loadWorkspaceContext(boardRes.data.board.workspace);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Members/roles + sibling boards for the header and sidebar (tolerates failures).
  const loadWorkspaceContext = async (ws) => {
    const wsId = ws && typeof ws === 'object' ? ws._id : ws;
    if (!wsId) return;
    const [wsRes, boardsRes] = await Promise.allSettled([workspaceService.getById(wsId), boardService.getAll(wsId)]);
    if (wsRes.status === 'fulfilled') setFullWorkspace(wsRes.value.data);
    if (boardsRes.status === 'fulfilled' && Array.isArray(boardsRes.value.data)) setSiblingBoards(boardsRes.value.data);
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await workspaceService.getAll();
      setWorkspaces(res.data);
    } catch {}
  };

  // Drag and drop
  const findListByCardId = (cardId) =>
    lists.find((l) => l.cards.some((c) => c._id === cardId));

  const handleDragStart = ({ active }) => {
    const cardId = active.id;
    const list = findListByCardId(cardId);
    if (list) {
      const card = list.cards.find((c) => c._id === cardId);
      setActiveCard(card);
      setActiveList(list);
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
    setActiveList(null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);
    setActiveList(null);

    if (!over || active.id === over.id) return;

    // Determine source and target
    const sourceList = findListByCardId(active.id);
    let targetList = findListByCardId(over.id);

    // If over is a list ID (empty list)
    if (!targetList) {
      targetList = lists.find((l) => l._id === over.id);
    }

    if (!sourceList || !targetList) return;

    const sourceCards = [...sourceList.cards];
    const cardIdx = sourceCards.findIndex((c) => c._id === active.id);
    const movedCard = sourceCards[cardIdx];

    let newPosition = 0;

    if (sourceList._id === targetList._id) {
      // Same list — reorder
      const targetIdx = sourceCards.findIndex((c) => c._id === over.id);
      if (targetIdx === -1 || cardIdx === targetIdx) return;

      const newCards = arrayMove(sourceCards, cardIdx, targetIdx);
      newPosition = targetIdx;

      setLists((prev) =>
        prev.map((l) =>
          l._id === sourceList._id ? { ...l, cards: newCards } : l
        )
      );

      const updates = newCards.map((card, i) => ({
        cardId: card._id,
        listId: sourceList._id,
        position: i,
      }));

      try {
        await boardService.reorderCards(boardId, { updates });
        emit('cards-reordered', { boardId, updates });
      } catch (err) {
        toast.error('Failed to reorder cards');
        fetchBoard();
      }
    } else {
      // Different list — move
      const targetCards = [...targetList.cards];
      const overIdx = targetCards.findIndex((c) => c._id === over.id);
      newPosition = overIdx === -1 ? targetCards.length : overIdx;

      const newSourceCards = sourceCards.filter((c) => c._id !== active.id);
      const newTargetCards = [...targetCards];
      newTargetCards.splice(newPosition, 0, { ...movedCard, list: targetList._id });

      setLists((prev) =>
        prev.map((l) => {
          if (l._id === sourceList._id) return { ...l, cards: newSourceCards };
          if (l._id === targetList._id) return { ...l, cards: newTargetCards };
          return l;
        })
      );

      try {
        const res = await cardService.move(active.id, {
          sourceListId: sourceList._id,
          targetListId: targetList._id,
          position: newPosition,
        });

        emit('card-moved', {
          boardId,
          cardId: active.id,
          sourceListId: sourceList._id,
          targetListId: targetList._id,
          position: newPosition,
          card: res.data,
        });
      } catch (err) {
        toast.error('Failed to move card');
        fetchBoard();
      }
    }
  };

  const handleAddList = async (name) => {
    try {
      const res = await listService.create(boardId, { name });
      const newList = { ...res.data, cards: [] };
      setLists((prev) => [...prev, newList]);
      emit('list-created', { boardId, list: res.data });
      toast.success('List created!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRenameList = async (listId, name) => {
    try {
      const res = await listService.update(listId, { name });
      setLists((prev) => prev.map((l) => (l._id === listId ? { ...l, name } : l)));
      emit('list-updated', { boardId, list: res.data });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await listService.delete(listId);
      setLists((prev) => prev.filter((l) => l._id !== listId));
      emit('list-deleted', { boardId, listId });
      toast.success('List deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddCard = async (listId, title) => {
    try {
      const res = await cardService.create(listId, { title });
      setLists((prev) =>
        prev.map((l) =>
          l._id === listId ? { ...l, cards: [...l.cards, res.data] } : l
        )
      );
      emit('card-created', { boardId, listId, card: res.data });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteCard = async (cardId, listId) => {
    try {
      await cardService.delete(cardId);
      setLists((prev) =>
        prev.map((l) =>
          l._id === listId
            ? { ...l, cards: l.cards.filter((c) => c._id !== cardId) }
            : l
        )
      );
      emit('card-deleted', { boardId, cardId, listId });
      toast.success('Card deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCardUpdated = (updatedCard) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c._id === updatedCard._id ? updatedCard : c)),
      }))
    );
    emit('card-updated', { boardId, card: updatedCard });
  };

  const scrollerRef = useRef(null);
  useEffect(() => {
    if (addingList && scrollerRef.current) {
      scrollerRef.current.scrollTo({ left: scrollerRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [addingList]);

  const wsId = workspace && typeof workspace === 'object' ? workspace._id : workspace;
  const wsName = (workspace && typeof workspace === 'object' && workspace.name)
    || fullWorkspace?.name
    || workspaces.find((w) => w._id === wsId)?.name
    || 'Workspace';

  const isOwner = fullWorkspace?.owner?._id === user?._id;
  const myRole = isOwner ? 'owner' : fullWorkspace?.members?.find((m) => m.user?._id === user?._id)?.role;
  const canEdit = myRole !== 'viewer';
  const members = fullWorkspace
    ? [fullWorkspace.owner, ...(fullWorkspace.members || []).map((m) => m.user)].filter(Boolean)
    : [];

  if (loading) {
    return (
      <AppLayout workspaces={workspaces} board>
        <KanbanSkeleton />
      </AppLayout>
    );
  }

  if (!board) {
    return (
      <AppLayout workspaces={workspaces}>
        <div className="page">
          <EmptyState
            icon="alert"
            title="Board not found"
            description="It may have been deleted, or you might not have access to it."
            action={<Link to="/" className="btn btn-primary">Back to dashboard</Link>}
          />
        </div>
      </AppLayout>
    );
  }

  const accent = board.background || 'linear-gradient(90deg,#3978E8,#8b5cf6)';

  return (
    <AppLayout workspaces={workspaces} boards={siblingBoards} currentWorkspaceId={wsId} board>
      {/* ── Board header ── */}
      <header className="board-header">
        <div className="board-accent" style={{ background: accent }} />
        <div className="board-header-inner">
          <div style={{ minWidth: 0 }}>
            <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 6 }}>
              <Link to="/">Dashboard</Link>
              <Icon name="chevronRight" size={13} />
              {wsId ? <Link to={`/workspace/${wsId}`}>{wsName}</Link> : <span>{wsName}</span>}
            </nav>
            <h1 className="board-title">
              <span style={{ width: 30, height: 30, borderRadius: 9, background: accent, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }} />
              <span className="truncate">{board.name}</span>
            </h1>
            {board.description && <p className="board-desc clamp-2">{board.description}</p>}
          </div>

          <div className="board-tools">
            <PresenceBar users={onlineUsers} />
            {members.length > 0 && <AvatarGroup users={members} max={4} size="sm" />}
            {isOwner && wsId && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInvite(true)} aria-label="Invite members">
                <Icon name="userPlus" size={15} /> <span className="btn-label">Invite</span>
              </button>
            )}
            <button
              type="button"
              className={`btn btn-sm ${showActivity ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowActivity(!showActivity)}
              aria-pressed={showActivity}
              aria-label="Activity"
            >
              <Icon name="activity" size={15} /> <span className="btn-label">Activity</span>
            </button>
            {canEdit && (
              <>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddingList(true)} aria-label="Add list">
                  <Icon name="plus" size={15} strokeWidth={2.5} /> <span className="btn-label">Add list</span>
                </button>
                <button type="button" className="btn btn-secondary btn-icon btn-sm" onClick={() => setShowSettings(true)} aria-label="Board settings" title="Board settings">
                  <Icon name="settings" size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Kanban ── */}
      <div className="board-body">
        <div className="board-scroller" ref={scrollerRef}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {lists.map((list, i) => (
              <KanbanList
                key={list._id}
                list={list}
                index={i}
                canEdit={canEdit}
                onAddCard={handleAddCard}
                onRenameList={handleRenameList}
                onDeleteList={(id) => setListToDelete(lists.find((l) => l._id === id))}
                onCardClick={setSelectedCard}
                onDeleteCard={(cardId, listId) => setCardToDelete({ cardId, listId, title: findListByCardId(cardId)?.cards.find((c) => c._id === cardId)?.title })}
              />
            ))}

            {canEdit && <AddListColumn adding={addingList} setAdding={setAddingList} onAdd={handleAddList} isFirst={lists.length === 0} />}

            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
              {activeCard ? <CardView card={activeCard} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {showActivity && <ActivityFeed logs={activityLogs} onClose={() => setShowActivity(false)} />}
      </div>

      {/* ── Task details ── */}
      {selectedCard && (
        <CardDetailModal
          cardId={selectedCard._id}
          boardId={boardId}
          onClose={() => setSelectedCard(null)}
          onUpdated={handleCardUpdated}
          onDeleted={(cardId) => {
            const list = findListByCardId(cardId);
            if (list) handleDeleteCard(cardId, list._id);
            setSelectedCard(null);
          }}
          emit={emit}
          canEdit={canEdit}
        />
      )}

      {/* ── Header actions ── */}
      {wsId && (
        <InviteMemberModal
          isOpen={showInvite}
          onClose={() => setShowInvite(false)}
          workspaceId={wsId}
          onInvited={(ws) => { if (ws?._id) setFullWorkspace(ws); else loadWorkspaceContext(wsId); }}
        />
      )}
      <BoardSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        board={board}
        onSaved={(changes) => setBoard((b) => ({ ...b, ...changes }))}
        onDeleted={() => navigate(wsId ? `/workspace/${wsId}` : '/')}
      />

      <ConfirmDialog
        open={!!listToDelete}
        title={`Delete “${listToDelete?.name}”?`}
        message={listToDelete?.cards?.length ? `This list and its ${listToDelete.cards.length} card${listToDelete.cards.length !== 1 ? 's' : ''} will be permanently deleted.` : 'This list will be permanently deleted.'}
        confirmLabel="Delete list"
        onConfirm={async () => { await handleDeleteList(listToDelete._id); setListToDelete(null); }}
        onCancel={() => setListToDelete(null)}
      />
      <ConfirmDialog
        open={!!cardToDelete}
        title="Delete this card?"
        message={cardToDelete?.title ? `“${cardToDelete.title}” will be permanently deleted.` : 'This card will be permanently deleted.'}
        confirmLabel="Delete card"
        onConfirm={async () => { await handleDeleteCard(cardToDelete.cardId, cardToDelete.listId); setCardToDelete(null); }}
        onCancel={() => setCardToDelete(null)}
      />
    </AppLayout>
  );
}

function AddListColumn({ adding, setAdding, onAdd, isFirst }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => { setAdding(false); setName(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    await onAdd(name.trim());
    setBusy(false);
    close();
  };

  if (!adding) {
    return (
      <div className="add-list">
        <button type="button" className="add-list-btn" onClick={() => setAdding(true)}>
          <Icon name="plus" size={17} /> {isFirst ? 'Add your first list' : 'Add list'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="add-list add-list-form">
      <input
        className="input"
        style={{ marginBottom: 10 }}
        placeholder="List name, e.g. In Review"
        value={name}
        maxLength={60}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={!name.trim() || busy} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
          {busy ? 'Adding…' : 'Add list'}
        </button>
        <button type="button" onClick={close} className="btn btn-secondary btn-sm btn-icon" aria-label="Cancel">
          <Icon name="x" size={16} />
        </button>
      </div>
    </form>
  );
}
