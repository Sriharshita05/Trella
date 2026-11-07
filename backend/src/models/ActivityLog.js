const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'card_created',
        'card_updated',
        'card_moved',
        'card_deleted',
        'card_completed',
        'comment_added',
        'comment_deleted',
        'list_created',
        'list_renamed',
        'list_deleted',
        'list_reordered',
        'member_added',
        'member_removed',
        'board_created',
        'board_updated',
        'assignee_added',
        'assignee_removed',
      ],
    },
    entityType: {
      type: String,
      enum: ['card', 'list', 'board', 'comment', 'member'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    entityName: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ board: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
