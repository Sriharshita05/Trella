const Card = require('../models/Card');
const List = require('../models/List');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create card
// @route   POST /api/lists/:listId/cards
const createCard = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignees } = req.body;
    const { listId } = req.params;

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Get max position in this list
    const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await Card.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      assignees: assignees || [],
      list: listId,
      board: list.board,
      position,
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      board: list.board,
      user: req.user._id,
      action: 'card_created',
      entityType: 'card',
      entityId: card._id,
      entityName: card.title,
      metadata: { listName: list.name },
    });

    const populated = await Card.findById(card._id)
      .populate('assignees', 'name email color')
      .populate('createdBy', 'name email color');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get card by ID
// @route   GET /api/cards/:cardId
const getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .populate('assignees', 'name email color')
      .populate('createdBy', 'name email color')
      .populate('list', 'name');

    if (!card) return res.status(404).json({ message: 'Card not found' });

    const comments = await Comment.find({ card: card._id })
      .populate('author', 'name email color')
      .sort({ createdAt: 1 });

    res.json({ card, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update card
// @route   PUT /api/cards/:cardId
const updateCard = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignees, labels, completed, coverColor } = req.body;

    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { title, description, priority, dueDate, assignees, labels, completed, coverColor },
      { new: true, runValidators: true }
    )
      .populate('assignees', 'name email color')
      .populate('createdBy', 'name email color');

    // Log completion change
    const action = completed && !card.completed ? 'card_completed' : 'card_updated';
    await ActivityLog.create({
      board: updatedCard.board,
      user: req.user._id,
      action,
      entityType: 'card',
      entityId: updatedCard._id,
      entityName: updatedCard.title,
    });

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Move card to different list / position
// @route   PUT /api/cards/:cardId/move
const moveCard = async (req, res) => {
  try {
    const { targetListId, position, sourceListId } = req.body;
    const { cardId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const [sourceList, targetList] = await Promise.all([
      List.findById(sourceListId || card.list),
      List.findById(targetListId),
    ]);

    if (!targetList) return res.status(404).json({ message: 'Target list not found' });

    // Update positions of other cards in target list
    await Card.updateMany(
      { list: targetListId, position: { $gte: position }, _id: { $ne: cardId } },
      { $inc: { position: 1 } }
    );

    card.list = targetListId;
    card.position = position;
    await card.save();

    const populated = await Card.findById(cardId)
      .populate('assignees', 'name email color')
      .populate('createdBy', 'name email color');

    await ActivityLog.create({
      board: card.board,
      user: req.user._id,
      action: 'card_moved',
      entityType: 'card',
      entityId: card._id,
      entityName: card.title,
      metadata: {
        from: sourceList ? sourceList.name : 'Unknown',
        to: targetList.name,
      },
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete card
// @route   DELETE /api/cards/:cardId
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    await Comment.deleteMany({ card: req.params.cardId });

    await ActivityLog.create({
      board: card.board,
      user: req.user._id,
      action: 'card_deleted',
      entityType: 'card',
      entityId: card._id,
      entityName: card.title,
    });

    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to card
// @route   POST /api/cards/:cardId/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const comment = await Comment.create({
      text,
      card: card._id,
      author: req.user._id,
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name email color');

    await ActivityLog.create({
      board: card.board,
      user: req.user._id,
      action: 'comment_added',
      entityType: 'comment',
      entityId: comment._id,
      entityName: card.title,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/cards/:cardId/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    const card = await Card.findById(req.params.cardId);
    await Comment.findByIdAndDelete(req.params.commentId);

    await ActivityLog.create({
      board: card.board,
      user: req.user._id,
      action: 'comment_deleted',
      entityType: 'comment',
      entityId: comment._id,
      entityName: card.title,
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk reorder cards within/across lists
// @route   PUT /api/boards/:boardId/cards/reorder
const reorderCards = async (req, res) => {
  try {
    const { updates } = req.body; // [{ cardId, listId, position }]

    const bulkOps = updates.map(({ cardId, listId, position }) => ({
      updateOne: {
        filter: { _id: cardId },
        update: { list: listId, position },
      },
    }));

    await Card.bulkWrite(bulkOps);
    res.json({ message: 'Cards reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCard,
  getCard,
  updateCard,
  moveCard,
  deleteCard,
  addComment,
  deleteComment,
  reorderCards,
};
