const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get boards for a workspace
// @route   GET /api/workspaces/:workspaceId/boards
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      workspace: req.params.workspaceId,
      archived: false,
    })
      .populate('createdBy', 'name email color')
      .sort({ updatedAt: -1 });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a board
// @route   POST /api/workspaces/:workspaceId/boards
const createBoard = async (req, res) => {
  try {
    const { name, description, background } = req.body;

    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];

    const board = await Board.create({
      name,
      description,
      background: background || gradients[Math.floor(Math.random() * gradients.length)],
      workspace: req.params.workspaceId,
      createdBy: req.user._id,
    });

    // Create default lists
    await List.create([
      { name: 'To Do', board: board._id, position: 0 },
      { name: 'In Progress', board: board._id, position: 1 },
      { name: 'Done', board: board._id, position: 2 },
    ]);

    // Log activity
    await ActivityLog.create({
      board: board._id,
      user: req.user._id,
      action: 'board_created',
      entityType: 'board',
      entityId: board._id,
      entityName: board.name,
    });

    const populated = await Board.findById(board._id).populate('createdBy', 'name email color');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get board by ID with lists and cards
// @route   GET /api/boards/:boardId
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('createdBy', 'name email color');

    if (!board) return res.status(404).json({ message: 'Board not found' });

    const lists = await List.find({ board: board._id, archived: false })
      .sort({ position: 1 });

    const cards = await Card.find({ board: board._id, archived: false })
      .populate('assignees', 'name email color')
      .populate('createdBy', 'name email color')
      .sort({ position: 1 });

    // Group cards by list
    const listsWithCards = lists.map((list) => ({
      ...list.toObject(),
      cards: cards.filter((c) => c.list.toString() === list._id.toString()),
    }));

    res.json({ board, lists: listsWithCards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update board
// @route   PUT /api/boards/:boardId
const updateBoard = async (req, res) => {
  try {
    const { name, description, background, starred } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.boardId,
      { name, description, background, starred },
      { new: true }
    ).populate('createdBy', 'name email color');

    if (!board) return res.status(404).json({ message: 'Board not found' });

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:boardId
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    await List.deleteMany({ board: req.params.boardId });
    await Card.deleteMany({ board: req.params.boardId });
    await ActivityLog.deleteMany({ board: req.params.boardId });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get activity log for board
// @route   GET /api/boards/:boardId/activity
const getBoardActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ board: req.params.boardId })
      .populate('user', 'name email color')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  getBoardActivity,
};
