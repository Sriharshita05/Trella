const Workspace = require('../models/Workspace');
const Board = require('../models/Board');

// Check workspace access (any role)
const requireWorkspaceAccess = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.hasAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking workspace access' });
  }
};

// Check workspace edit permissions (owner or member)
const requireWorkspaceEdit = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.canEdit(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You do not have edit permissions in this workspace' });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking workspace permissions' });
  }
};

// Check workspace ownership
const requireWorkspaceOwner = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only workspace owner can perform this action' });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking workspace ownership' });
  }
};

// Check board access through workspace membership
const requireBoardAccess = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id;
    const board = await Board.findById(boardId).populate('workspace');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.workspace.hasAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to this board' });
    }

    req.board = board;
    req.workspace = board.workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking board access' });
  }
};

module.exports = {
  requireWorkspaceAccess,
  requireWorkspaceEdit,
  requireWorkspaceOwner,
  requireBoardAccess,
};
