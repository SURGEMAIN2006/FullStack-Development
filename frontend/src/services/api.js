const API_BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('librasphere_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('librasphere_token', token);
  } else {
    localStorage.removeItem('librasphere_token');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during request.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// API Methods
export const api = {
  // Auth
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me'),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/books${query ? `?${query}` : ''}`);
  },
  getBookById: (id) => apiFetch(`/books/${id}`),
  createBook: (data) => apiFetch('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => apiFetch(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id) => apiFetch(`/books/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => apiFetch('/categories'),
  createCategory: (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/users${query ? `?${query}` : ''}`);
  },
  getUserById: (id) => apiFetch(`/users/${id}`),
  createUser: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

  // Issues
  getIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/issues${query ? `?${query}` : ''}`);
  },
  getOverdueIssues: () => apiFetch('/issues/overdue'),
  issueBook: (data) => apiFetch('/issues', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (issueId, data) => apiFetch(`/issues/${issueId}/return`, { method: 'PUT', body: JSON.stringify(data) }),

  // Bookings
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/bookings${query ? `?${query}` : ''}`);
  },
  createBooking: (data) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id, data) => apiFetch(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelBooking: (id) => apiFetch(`/bookings/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markNotificationRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),

  // Dashboard Stats
  getDashboardStats: () => apiFetch('/dashboard/stats')
};
