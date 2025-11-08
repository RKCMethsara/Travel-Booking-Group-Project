import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  signup: (userData) => api.post('/auth/signup', userData),
  login: (loginData) => api.post('/auth/login', loginData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify-token'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createAdmin: (userData) => api.post('/admin/create-admin', userData),
  updateUserRole: (uid, role) => api.put(`/admin/users/${uid}/role`, { role }),
  updateUserStatus: (uid, isActive) => api.put(`/admin/users/${uid}/status`, { isActive }),
  deleteUser: (uid) => api.delete(`/admin/users/${uid}`),
  getUserDetails: (uid) => api.get(`/admin/users/${uid}`),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (bookingId, status) => api.patch(`/admin/bookings/${bookingId}/status`, { status }),
  deleteBooking: (bookingId) => api.delete(`/admin/bookings/${bookingId}`),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  cancelBooking: (bookingId) => api.patch(`/bookings/${bookingId}/cancel`),
};

export default api;