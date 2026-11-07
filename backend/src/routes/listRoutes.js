const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateList, deleteList } = require('../controllers/listController');

router.use(protect);

router.put('/:listId', updateList);
router.delete('/:listId', deleteList);

module.exports = router;
