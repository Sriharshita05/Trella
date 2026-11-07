const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

listSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('List', listSchema);
