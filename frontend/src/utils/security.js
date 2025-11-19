// Security and Data Validation Utilities

// XSS Protection - Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Validate phone number (international format)
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleaned = phone.replace(/[\s()-]/g, '');
  return phoneRegex.test(cleaned);
};

// Validate name (letters, spaces, hyphens only)
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s-]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Secure localStorage operations with error handling
export const secureStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }
};

// Hash password (simple client-side hashing - for demo purposes)
export const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Validate date (not in past, within reasonable future)
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  
  return date >= today && date <= maxDate;
};

// Rate limiting for form submissions (prevent spam)
const submissionTimes = {};

export const checkRateLimit = (key, limitMs = 3000) => {
  const now = Date.now();
  const lastSubmission = submissionTimes[key] || 0;
  
  if (now - lastSubmission < limitMs) {
    return false; // Too soon
  }
  
  submissionTimes[key] = now;
  return true;
};

// Generate secure random ID
export const generateSecureId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Input length validation
export const validateLength = (input, min, max) => {
  const length = input ? input.trim().length : 0;
  return length >= min && length <= max;
};

// SQL Injection prevention (though we're using localStorage, good practice)
export const preventSQLInjection = (input) => {
  if (typeof input !== 'string') return input;
  const dangerous = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT)\b)/gi;
  return input.replace(dangerous, '');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = secureStorage.get('user');
  return user !== null && user.email;
};

// Check if user is admin
export const isAdmin = () => {
  const user = secureStorage.get('user');
  return user !== null && user.role === 'admin';
};

// Sanitize booking data
export const sanitizeBookingData = (booking) => {
  return {
    id: booking.id,
    place: sanitizeInput(booking.place),
    hotel: sanitizeInput(booking.hotel),
    date: booking.date,
    name: sanitizeInput(booking.name),
    email: sanitizeInput(booking.email),
    phone: sanitizeInput(booking.phone),
    created: booking.created,
    status: booking.status
  };
};

const securityUtils = {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateName,
  validateDate,
  validateLength,
  secureStorage,
  hashPassword,
  checkRateLimit,
  generateSecureId,
  preventSQLInjection,
  isAuthenticated,
  isAdmin,
  sanitizeBookingData
};

export default securityUtils;
