const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { requireWorkspaceAccess, requireBoardAccess } = require('../middleware/permissions');
const {
  getBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  getBoardActivity,
} = require('../controllers/boardController');
const { createList, reorderLists } = require('../controllers/listController');
const { reorderCards } = require('../controllers/cardController');

router.use(protect);

// Workspace-scoped
router.get('/', requireWorkspaceAccess, getBoards);
router.post('/', requireWorkspaceAccess, createBoard);

// Board-scoped
router.get('/:boardId', requireBoardAccess, getBoard);
router.put('/:boardId', requireBoardAccess, updateBoard);
router.delete('/:boardId', requireBoardAccess, deleteBoard);
router.get('/:boardId/activity', requireBoardAccess, getBoardActivity);

// Lists within board
router.post('/:boardId/lists', requireBoardAccess, createList);
router.put('/:boardId/lists/reorder', requireBoardAccess, reorderLists);

// Card reorder (bulk)
router.put('/:boardId/cards/reorder', requireBoardAccess, reorderCards);

module.exports = router;
