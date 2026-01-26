import api from './client';

export const authAPI = {
  // Admin Auth
  adminLogin: (credentials) => 
    api.post('/admin/login', credentials),
  
  adminLogout: () => 
    api.post('/admin/logout'),
  
  adminProfile: () => 
    api.get('/admin/profile'),

  // User Auth
  userLogin: (credentials) => 
    api.post('/user/login', credentials),
  
  userRegister: (data) => 
    api.post('/user/register', data),
  
  userLogout: () => 
    api.post('/user/logout'),
  
  userProfile: () => 
    api.get('/user/profile'),
};

export const listsAPI = {
  // Get lists
  getUserLists: () => 
    api.get('/user/lists'),
  
  getList: (listId) => 
    api.get(`/user/lists/${listId}`),
  
  getListAdjectives: (listId) => 
    api.get(`/user/lists/${listId}/adjectives`),
  
  // Create/Update/Delete list
  createList: (data) => 
    api.post('/user/lists', data),
  
  updateList: (listId, data) => 
    api.put(`/user/lists/${listId}`, data),
  
  deleteList: (listId) => 
    api.delete(`/user/lists/${listId}`),
  
  // Adjectives CRUD
  createAdjective: (listId, data) => 
    api.post(`/user/lists/${listId}/adjectives`, data),
  
  updateAdjective: (listId, adjectiveId, data) => 
    api.put(`/user/lists/${listId}/adjectives/${adjectiveId}`, data),
  
  deleteAdjective: (listId, adjectiveId) => 
    api.delete(`/user/lists/${listId}/adjectives/${adjectiveId}`),
  
  // QR Code
  getListQRCode: (listId) => 
    api.get(`/user/lists/${listId}/qr`, { responseType: 'blob' }),
};

export const studentAPI = {
  // Get adjectives for sorting
  getDefaultAdjectives: () => 
    api.get('/api/lists/default/adjectives'),
  
  getListAdjectives: (listId) => 
    api.get(`/api/lists/${listId}/adjectives`),
  
  // Session management
  createSession: (listId) => 
    api.post(`/api/lists/${listId}/session`),
  
  finishSession: (listId, sessionId) => 
    api.put(`/api/lists/${listId}/session/${sessionId}`),
  
  // Record assignment
  recordAssignment: (sessionId, data) => 
    api.post(`/api/sessions/${sessionId}/record-assignment`, data),
  
  // PDF export
  exportPDF: (sessionId) => 
    api.post(`/api/sessions/${sessionId}/pdf`, {}, { responseType: 'blob' }),
};

export const shareAPI = {
  // Public share endpoints
  getShareLinkData: (token) => 
    api.get(`/l/${token}/data`),
  
  getDefaultList: () => 
    api.get('/l'),
};

export const adminAPI = {
  // Pending inbox
  getPendingUsers: () => 
    api.get('/admin/pending-users'),
  
  getPendingSchools: () => 
    api.get('/admin/pending-schools'),
  
  approveUser: (userId) => 
    api.post(`/admin/users/${userId}/approve`),
  
  rejectUser: (userId) => 
    api.post(`/admin/users/${userId}/reject`),
  
  approveSchool: (schoolId) => 
    api.post(`/admin/schools/${schoolId}/approve`),
  
  rejectSchool: (schoolId) => 
    api.post(`/admin/schools/${schoolId}/reject`),
  
  // User management
  getUsers: () => 
    api.get('/admin/users'),
  
  getUser: (userId) => 
    api.get(`/admin/users/${userId}`),
  
  createUser: (data) => 
    api.post('/admin/users', data),
  
  updateUser: (userId, data) => 
    api.put(`/admin/users/${userId}`, data),
  
  deleteUser: (userId) => 
    api.delete(`/admin/users/${userId}`),
  
  // School management
  getSchools: () => 
    api.get('/admin/schools'),
  
  createSchool: (data) => 
    api.post('/admin/schools', data),
  
  updateSchool: (schoolId, data) => 
    api.put(`/admin/schools/${schoolId}`, data),
  
  deleteSchool: (schoolId) => 
    api.delete(`/admin/schools/${schoolId}`),
  
  // Analytics
  getAnalyticsSummary: () => 
    api.get('/admin/analytics/summary'),
  
  getAnalyticsSessions: (params) => 
    api.get('/admin/analytics/sessions', { params }),
  
  getSessionDetails: (sessionId) => 
    api.get(`/admin/analytics/sessions/${sessionId}`),
  
  // Standard list
  getStandardList: () => 
    api.get('/admin/standard-list'),
  
  updateStandardAdjective: (adjectiveId, data) => 
    api.put(`/admin/standard-list/${adjectiveId}`, data),
  
  deleteStandardAdjective: (adjectiveId) => 
    api.delete(`/admin/standard-list/${adjectiveId}`),
};
