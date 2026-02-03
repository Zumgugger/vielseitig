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
  
  // Share token management
  regenerateShareToken: (listId) =>
    api.post(`/user/lists/${listId}/regenerate-token`),
  
  // Adjectives CRUD
  createAdjective: (listId, data) => 
    api.post(`/user/lists/${listId}/adjectives`, data),
  
  updateAdjective: (listId, adjectiveId, data) => 
    api.put(`/user/lists/${listId}/adjectives/${adjectiveId}`, data),
  
  deleteAdjective: (listId, adjectiveId) => 
    api.delete(`/user/lists/${listId}/adjectives/${adjectiveId}`),
  
  // Fork / Copy-on-Write
  forkList: (listId) => 
    api.post(`/user/lists/${listId}/fork`),
  
  // QR Code
  getListQRCode: (listId) => 
    api.get(`/user/lists/${listId}/qr`, { responseType: 'blob' }),
};

export const analyticsAPI = {
  // Session lifecycle
  startSession: (listId, themeId) =>
    api.post('/api/analytics/session/start', { list_id: listId || null, theme_id: themeId || null }),

  recordAssignment: (sessionId, adjectiveId, bucket) =>
    api.post('/api/analytics/assignment', { analytics_session_id: sessionId, adjective_id: adjectiveId, bucket }),

  finishSession: (sessionId) =>
    api.post('/api/analytics/session/finish', { analytics_session_id: sessionId }),

  exportPdf: (sessionId, schoolName) =>
    api.post('/api/analytics/session/pdf-export', { analytics_session_id: sessionId, school_name: schoolName }),
};

export const studentAPI = {
  // Get adjectives for sorting
  getDefaultAdjectives: () => 
    api.get('/api/lists/default/adjectives'),
  
  getListAdjectives: (listId) => 
    api.get(`/api/lists/${listId}/adjectives`),

  // PDF export (aliased for backward compatibility)
  exportPDF: (sessionId, data) => 
    api.post(`/api/sessions/${sessionId}/pdf`, data, { responseType: 'blob' }),
};

// Aliases for backward compatibility
export const studentApi = studentAPI;
export const analyticsApi = analyticsAPI;

export const shareAPI = {
  // Public share endpoints
  getShareLinkData: (token) => 
    api.get(`/api/l/${token}/data`),
  
  getDefaultList: () => 
    api.get('/api/l'),

  getPublicList: (token) =>
    api.get(`/api/l/${token}`),
};

// Alias for backward compatibility
export const shareApi = shareAPI;

export const adminAPI = {
  // Pending inbox
  getPendingUsers: () => 
    api.get('/admin/pending-users'),
  
  getPendingSchools: () => 
    api.get('/admin/pending-schools'),
  
  approveUser: (userId, data = {}) => 
    api.post(`/admin/users/${userId}/approve`, data),
  
  rejectUser: (userId, data = {}) => 
    api.post(`/admin/users/${userId}/reject`, data),
  
  approveSchool: (schoolId, data = {}) => 
    api.post(`/admin/schools/${schoolId}/approve`, data),
  
  rejectSchool: (schoolId, data = {}) => 
    api.post(`/admin/schools/${schoolId}/reject`, data),
  
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
  
  resetUserPassword: (userId) =>
    api.post(`/admin/users/${userId}/reset-password`),
  
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
  
  getAnalyticsTimeseries: (days = 30) =>
    api.get('/admin/analytics/timeseries', { params: { days } }),
  
  // Standard list
  getStandardList: () => 
    api.get('/admin/standard-list'),
  
  updateStandardAdjective: (adjectiveId, data) => 
    api.put(`/admin/standard-list/${adjectiveId}`, data),
  
  deleteStandardAdjective: (adjectiveId) => 
    api.delete(`/admin/standard-list/${adjectiveId}`),
};
