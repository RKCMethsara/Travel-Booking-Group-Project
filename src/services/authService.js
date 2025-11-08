import { authAPI, getAuthHeaders, setAuthToken, getAuthToken } from '../config/firebase';

class AuthService {
  constructor() {
    this.user = null;
    this.loading = false;
    this.listeners = [];
    
    // Check if user is already logged in on initialization
    this.initializeAuth();
  }

  // Initialize auth state from localStorage
  async initializeAuth() {
    const token = getAuthToken();
    if (token) {
      try {
        // First try to get user from token
        const userData = this.getCurrentUser();
        if (userData) {
          this.user = userData;
          this.notifyListeners();
        }
        
        // Then validate token with server (optional, for added security)
        // Commented out to avoid unnecessary API calls on every page load
        // await this.validateToken();
      } catch (error) {
        console.error('Token validation failed:', error);
        this.logout();
      }
    }
  }

  // Validate current token with backend
  async validateToken() {
    try {
      const response = await fetch(authAPI.profile, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const userData = await response.json();
        this.user = userData.user;
        this.notifyListeners();
        return userData.user;
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Immediately call callback with current state
    callback(this.user, this.loading);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state changes
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.user, this.loading);
    });
  }

  // Sign up with email and password
  async signup(userData) {
    try {
      this.loading = true;
      this.notifyListeners();

      const response = await fetch(authAPI.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setAuthToken(data.token);
        this.user = data.user;
        this.loading = false;
        this.notifyListeners();
        return { success: true, user: data.user };
      } else {
        this.loading = false;
        this.notifyListeners();
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      this.loading = false;
      this.notifyListeners();
      console.error('Signup error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Sign in with email and password
  async signin(email, password) {
    try {
      this.loading = true;
      this.notifyListeners();

      const response = await fetch(authAPI.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setAuthToken(data.token);
        this.user = data.user;
        this.loading = false;
        this.notifyListeners();
        return { success: true, user: data.user };
      } else {
        this.loading = false;
        this.notifyListeners();
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      this.loading = false;
      this.notifyListeners();
      console.error('Signin error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Sign out
  async logout() {
    try {
      await fetch(authAPI.logout, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      // Clear local auth state regardless of API response
      setAuthToken(null);
      this.user = null;
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setAuthToken(null);
      this.user = null;
      this.notifyListeners();
      return { success: true };
    }
  }

  // Get current user
  getCurrentUser() {
    // If user is in memory, return it
    if (this.user) {
      return this.user;
    }

    // Try to decode user from JWT token
    const token = getAuthToken();
    if (token) {
      try {
        // Decode JWT token (without verification - just to get user data)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is not expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          // Token expired, clear it
          setAuthToken(null);
          return null;
        }
        
        // Return user data from token
        const userData = {
          uid: payload.uid,
          email: payload.email,
          role: payload.role
        };
        
        // Set user in memory for future calls
        this.user = userData;
        return userData;
      } catch (error) {
        console.error('Error decoding token:', error);
        setAuthToken(null);
        return null;
      }
    }

    return null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user && !!getAuthToken();
  }

  // Check if user is admin
  isAdmin() {
    return this.user?.role === 'admin';
  }

  // Get user role
  getUserRole() {
    return this.user?.role || 'user';
  }

  // Reset password
  async resetPassword(email) {
    try {
      const response = await fetch(`${authAPI.login}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;