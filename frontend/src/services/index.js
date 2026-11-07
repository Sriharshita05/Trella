import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const workspaceService = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  invite: (id, data) => api.post(`/workspaces/${id}/invite`, data),
  removeMember: (workspaceId, userId) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),
  updateMemberRole: (workspaceId, userId, data) =>
    api.put(`/workspaces/${workspaceId}/members/${userId}`, data),
};

export const boardService = {
  getAll: (workspaceId) => api.get(`/workspaces/${workspaceId}/boards`),
  getById: (boardId) => api.get(`/boards/${boardId}`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/boards`, data),
  update: (boardId, data) => api.put(`/boards/${boardId}`, data),
  delete: (boardId) => api.delete(`/boards/${boardId}`),
  getActivity: (boardId) => api.get(`/boards/${boardId}/activity`),
  reorderLists: (boardId, data) => api.put(`/boards/${boardId}/lists/reorder`, data),
  reorderCards: (boardId, data) => api.put(`/boards/${boardId}/cards/reorder`, data),
};

export const listService = {
  create: (boardId, data) => api.post(`/boards/${boardId}/lists`, data),
  update: (listId, data) => api.put(`/lists/${listId}`, data),
  delete: (listId) => api.delete(`/lists/${listId}`),
};

export const cardService = {
  create: (listId, data) => api.post(`/cards/lists/${listId}/cards`, data),
  getById: (cardId) => api.get(`/cards/${cardId}`),
  update: (cardId, data) => api.put(`/cards/${cardId}`, data),
  move: (cardId, data) => api.put(`/cards/${cardId}/move`, data),
  delete: (cardId) => api.delete(`/cards/${cardId}`),
  addComment: (cardId, data) => api.post(`/cards/${cardId}/comments`, data),
  deleteComment: (cardId, commentId) =>
    api.delete(`/cards/${cardId}/comments/${commentId}`),
};
