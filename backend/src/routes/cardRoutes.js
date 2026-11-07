const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCard,
  getCard,
  updateCard,
  moveCard,
  deleteCard,
  addComment,
  deleteComment,
} = require('../controllers/cardController');

router.use(protect);

// Card CRUD
router.post('/lists/:listId/cards', createCard);
router.get('/:cardId', getCard);
router.put('/:cardId', updateCard);
router.put('/:cardId/move', moveCard);
router.delete('/:cardId', deleteCard);

// Comments
router.post('/:cardId/comments', addComment);
router.delete('/:cardId/comments/:commentId', deleteComment);

module.exports = router;
