import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/api/auth/signup', userData),
  login: (loginData) => api.post('/api/auth/login', loginData),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  verifyToken: () => api.get('/api/auth/verify-token'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  createAdmin: (userData) => api.post('/api/admin/create-admin', userData),
  updateUserRole: (uid, role) => api.put(`/api/admin/users/${uid}/role`, { role }),
  updateUserStatus: (uid, isActive) => api.put(`/api/admin/users/${uid}/status`, { isActive }),
  deleteUser: (uid) => api.delete(`/api/admin/users/${uid}`),
  getUserDetails: (uid) => api.get(`/api/admin/users/${uid}`),
  getBookings: (params) => api.get('/api/admin/bookings', { params }),
  updateBookingStatus: (bookingId, status) => api.patch(`/api/admin/bookings/${bookingId}/status`, { status }),
  deleteBooking: (bookingId) => api.delete(`/api/admin/bookings/${bookingId}`),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/api/bookings', bookingData),
  getMyBookings: () => api.get('/api/bookings/my-bookings'),
  cancelBooking: (bookingId) => api.patch(`/api/bookings/${bookingId}/cancel`),
};

export default api;