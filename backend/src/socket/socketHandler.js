const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Map of boardId -> Set of { socketId, user }
const boardPresence = new Map();

const setupSocket = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user.name})`);

    // Join a board room
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`);

      if (!boardPresence.has(boardId)) {
        boardPresence.set(boardId, new Map());
      }
      boardPresence.get(boardId).set(socket.id, {
        _id: socket.user._id,
        name: socket.user.name,
        color: socket.user.color,
        email: socket.user.email,
      });

      // Broadcast updated presence
      const users = Array.from(boardPresence.get(boardId).values());
      io.to(`board:${boardId}`).emit('presence-update', users);

      socket.currentBoard = boardId;
      console.log(`${socket.user.name} joined board ${boardId}`);
    });

    // Leave a board room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
      handleLeaveBoard(socket, boardId, io);
    });

    // Card events
    socket.on('card-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-created', data);
    });

    socket.on('card-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-updated', data);
    });

    socket.on('card-moved', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-moved', data);
    });

    socket.on('card-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-deleted', data);
    });

    // List events
    socket.on('list-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-created', data);
    });

    socket.on('list-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-updated', data);
    });

    socket.on('list-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-deleted', data);
    });

    socket.on('lists-reordered', (data) => {
      socket.to(`board:${data.boardId}`).emit('lists-reordered', data);
    });

    // Cards reordered (drag-drop)
    socket.on('cards-reordered', (data) => {
      socket.to(`board:${data.boardId}`).emit('cards-reordered', data);
    });

    // Activity log updated
    socket.on('activity-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('activity-updated', data);
    });

    // Comment events
    socket.on('comment-added', (data) => {
      socket.to(`board:${data.boardId}`).emit('comment-added', data);
    });

    socket.on('comment-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('comment-deleted', data);
    });

    // Typing indicator
    socket.on('typing-start', (data) => {
      socket.to(`board:${data.boardId}`).emit('typing-start', {
        ...data,
        user: { name: socket.user.name, color: socket.user.color },
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`board:${data.boardId}`).emit('typing-stop', {
        ...data,
        userId: socket.user._id,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (${socket.user.name})`);
      if (socket.currentBoard) {
        handleLeaveBoard(socket, socket.currentBoard, io);
      }
    });
  });
};

function handleLeaveBoard(socket, boardId, io) {
  if (boardPresence.has(boardId)) {
    boardPresence.get(boardId).delete(socket.id);
    if (boardPresence.get(boardId).size === 0) {
      boardPresence.delete(boardId);
    } else {
      const users = Array.from(boardPresence.get(boardId).values());
      io.to(`board:${boardId}`).emit('presence-update', users);
    }
  }
}

module.exports = setupSocket;
