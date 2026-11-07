const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  requireWorkspaceAccess,
  requireWorkspaceEdit,
  requireWorkspaceOwner,
} = require('../middleware/permissions');
const {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/workspaceController');

router.use(protect);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:workspaceId', requireWorkspaceAccess, getWorkspace);
router.put('/:workspaceId', requireWorkspaceOwner, updateWorkspace);
router.delete('/:workspaceId', requireWorkspaceOwner, deleteWorkspace);

// Member management (owner only)
router.post('/:workspaceId/invite', requireWorkspaceOwner, inviteMember);
router.delete('/:workspaceId/members/:userId', requireWorkspaceOwner, removeMember);
router.put('/:workspaceId/members/:userId', requireWorkspaceOwner, updateMemberRole);

module.exports = router;
