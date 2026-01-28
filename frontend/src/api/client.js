import axios from 'axios';

// In dev, use Vite's proxy (relative URLs). In prod, use configured API base.
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || ''
  : '';

/**
 * Create axios instance with default config
 * Use relative URLs so Vite proxy handles all requests to backend
 * In production, this will be replaced with the API domain
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session auth
});

/**
 * Request interceptor - add auth tokens or other headers if needed
 */
api.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL ? config.baseURL + config.url : config.url;
    console.log('[API Request]', config.method?.toUpperCase(), 'baseURL:', config.baseURL, 'url:', config.url, 'full:', fullUrl);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = (error.config?.url || '').split('?')[0];
      const isSessionCheck = url === '/user/profile' || url === '/admin/profile';

      // Allow public pages to stay accessible when the optional session check returns 401
      if (!isSessionCheck) {
        const isAdminRoute = url.startsWith('/admin');
        const target = isAdminRoute ? '/admin/login' : '/user/login';
        window.location.href = target;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Analytics API
 */
export const analyticsApi = {
  startSession: (listId, themeId) =>
    api.post('/api/analytics/session/start', { list_id: listId || null, theme_id: themeId || null }),

  recordAssignment: (sessionId, adjectiveId, bucket) =>
    api.post('/api/analytics/assignment', { analytics_session_id: sessionId, adjective_id: adjectiveId, bucket }),

  finishSession: (sessionId) =>
    api.post('/api/analytics/session/finish', { analytics_session_id: sessionId }),

  exportPdf: (sessionId, schoolName) =>
    api.post('/api/analytics/session/pdf-export', { analytics_session_id: sessionId, school_name: schoolName }),
};

/**
 * Student sorting API
 */
export const studentApi = {
  getDefaultAdjectives: () =>
    api.get('/api/lists/default/adjectives'),

  getListAdjectives: (listId) =>
    api.get(`/api/lists/${listId}/adjectives`),
};

/**
 * User authentication API
 */
export const authApi = {
  registerUser: (email, password, firstName, lastName, school, role = 'teacher') =>
    api.post('/user/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      school,
      role,
    }),

  loginUser: (email, password) =>
    api.post('/user/login', { email, password }),

  logoutUser: () =>
    api.post('/user/logout'),

  getUserProfile: () =>
    api.get('/user/me'),
};

/**
 * Admin authentication API
 */
export const adminAuthApi = {
  loginAdmin: (email, password) =>
    api.post('/admin/login', { email, password }),

  logoutAdmin: () =>
    api.post('/admin/logout'),

  getAdminProfile: () =>
    api.get('/admin/me'),
};

/**
 * List management API
 */
export const listsApi = {
  getUserLists: () =>
    api.get('/lists'),

  createList: (name, isPublic = false) =>
    api.post('/lists', { name, is_public: isPublic }),

  getList: (listId) =>
    api.get(`/lists/${listId}`),

  updateList: (listId, data) =>
    api.put(`/lists/${listId}`, data),

  deleteList: (listId) =>
    api.delete(`/lists/${listId}`),

  getAdjectives: (listId) =>
    api.get(`/lists/${listId}/adjectives`),

  addAdjective: (listId, adjective) =>
    api.post(`/lists/${listId}/adjectives`, { adjective }),

  removeAdjective: (listId, adjectiveId) =>
    api.delete(`/lists/${listId}/adjectives/${adjectiveId}`),
};

/**
 * Share link API
 */
export const shareApi = {
  getPublicList: (shareToken) =>
    api.get(`/api/l/${shareToken}`),

  getShareLink: (listId) =>
    api.get(`/lists/${listId}/share`),

  createShareLink: (listId) =>
    api.post(`/lists/${listId}/share`),

  deleteShareLink: (listId) =>
    api.delete(`/lists/${listId}/share`),

  getQrCode: (listId) =>
    api.get(`/lists/${listId}/qr`, { responseType: 'blob' }),
};

/**
 * Admin management API
 */
export const adminApi = {
  getUsers: (page = 1, limit = 50) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),

  getUser: (userId) =>
    api.get(`/admin/users/${userId}`),

  resetUserPassword: (userId) =>
    api.post(`/admin/users/${userId}/reset-password`),

  activateUser: (userId) =>
    api.post(`/admin/users/${userId}/activate`),

  deactivateUser: (userId) =>
    api.post(`/admin/users/${userId}/deactivate`),

  getAnalytics: () =>
    api.get('/admin/analytics'),

  getPendingInbox: () =>
    api.get('/admin/inbox/pending'),
};
