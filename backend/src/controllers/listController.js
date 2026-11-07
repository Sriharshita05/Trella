const List = require('../models/List');
const Card = require('../models/Card');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create list
// @route   POST /api/boards/:boardId/lists
const createList = async (req, res) => {
  try {
    const { name } = req.body;
    const { boardId } = req.params;

    // Get max position
    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({ name, board: boardId, position });

    await ActivityLog.create({
      board: boardId,
      user: req.user._id,
      action: 'list_created',
      entityType: 'list',
      entityId: list._id,
      entityName: list.name,
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update list
// @route   PUT /api/lists/:listId
const updateList = async (req, res) => {
  try {
    const { name } = req.body;
    const list = await List.findByIdAndUpdate(
      req.params.listId,
      { name },
      { new: true }
    );

    if (!list) return res.status(404).json({ message: 'List not found' });

    await ActivityLog.create({
      board: list.board,
      user: req.user._id,
      action: 'list_renamed',
      entityType: 'list',
      entityId: list._id,
      entityName: list.name,
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete list
// @route   DELETE /api/lists/:listId
const deleteList = async (req, res) => {
  try {
    const list = await List.findByIdAndDelete(req.params.listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Delete all cards in this list
    await Card.deleteMany({ list: req.params.listId });

    await ActivityLog.create({
      board: list.board,
      user: req.user._id,
      action: 'list_deleted',
      entityType: 'list',
      entityId: list._id,
      entityName: list.name,
    });

    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder lists
// @route   PUT /api/boards/:boardId/lists/reorder
const reorderLists = async (req, res) => {
  try {
    const { lists } = req.body; // [{ _id, position }]

    const bulkOps = lists.map(({ _id, position }) => ({
      updateOne: {
        filter: { _id },
        update: { position },
      },
    }));

    await List.bulkWrite(bulkOps);

    await ActivityLog.create({
      board: req.params.boardId,
      user: req.user._id,
      action: 'list_reordered',
      entityType: 'list',
      entityName: 'Lists reordered',
    });

    res.json({ message: 'Lists reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createList, updateList, deleteList, reorderLists };
