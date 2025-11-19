// Frontend will use backend API for all Firebase operations
// No direct Firebase client SDK needed

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Auth API endpoints
export const authAPI = {
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/auth/register`,
  logout: `${API_URL}/api/auth/logout`,
  profile: `${API_URL}/api/auth/profile`,
  refresh: `${API_URL}/api/auth/refresh`,
  resetPassword: `${API_URL}/api/auth/reset-password`
};

// Database API endpoints  
export const dbAPI = {
  places: `${API_URL}/api/places`,
  bookings: `${API_URL}/api/bookings`,
  users: `${API_URL}/api/users`
};

// Helper function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Helper function to get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};