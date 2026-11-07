const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const User = require('../models/User');

// @desc    Get all workspaces for current user
// @route   GET /api/workspaces
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color')
      .sort({ updatedAt: -1 });

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create workspace
// @route   POST /api/workspaces
const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const colors = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];
    const wsColor = color || colors[Math.floor(Math.random() * colors.length)];

    const workspace = await Workspace.create({
      name,
      description,
      color: wsColor,
      owner: req.user._id,
      members: [],
    });

    const populated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:workspaceId
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color');

    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:workspaceId
const updateWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      { name, description, color },
      { new: true }
    )
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color');

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:workspaceId
const deleteWorkspace = async (req, res) => {
  try {
    await Workspace.findByIdAndDelete(req.params.workspaceId);
    // Cascade delete boards (in production use a proper cascade)
    await Board.deleteMany({ workspace: req.params.workspaceId });
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite user to workspace
// @route   POST /api/workspaces/:workspaceId/invite
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspace = req.workspace;

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    if (workspace.owner.toString() === userToInvite._id.toString()) {
      return res.status(400).json({ message: 'User is already the owner' });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({
      user: userToInvite._id,
      role: role || 'member',
    });

    await workspace.save();

    const updated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:workspaceId/members/:userId
const removeMember = async (req, res) => {
  try {
    const workspace = req.workspace;
    const { userId } = req.params;

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== userId
    );

    await workspace.save();

    const updated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member role
// @route   PUT /api/workspaces/:workspaceId/members/:userId
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const workspace = req.workspace;
    const { userId } = req.params;

    const member = workspace.members.find(
      (m) => m.user.toString() === userId
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = role;
    await workspace.save();

    const updated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email color')
      .populate('members.user', 'name email color');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
};
