// Frontend will use backend API for all Firebase operations
// No direct Firebase client SDK needed

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth API endpoints
export const authAPI = {
  login: `${API_URL}/auth/login`,
  register: `${API_URL}/auth/register`,
  logout: `${API_URL}/auth/logout`,
  profile: `${API_URL}/auth/profile`,
  refresh: `${API_URL}/auth/refresh`
};

// Database API endpoints  
export const dbAPI = {
  places: `${API_URL}/places`,
  bookings: `${API_URL}/bookings`,
  users: `${API_URL}/users`
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