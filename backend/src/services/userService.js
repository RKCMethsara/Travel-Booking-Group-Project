const { auth, firestore } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class UserService {
  // Create user in Firebase Auth and Firestore
  async createUser(email, password, role = 'user', additionalData = {}) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        emailVerified: false
      });

      // Store user data in Firestore
      const userData = {
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        ...additionalData
      };

      await firestore.collection('users').doc(userRecord.uid).set(userData);

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        role,
        ...userData
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by UID
  async getUserByUid(uid) {
    try {
      const userDoc = await firestore.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return {
        uid,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const userRecord = await auth.getUserByEmail(email);
      const userDoc = await firestore.collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        ...userDoc.data()
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(uid, newRole) {
    try {
      await firestore.collection('users').doc(uid).update({
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // Set custom claims for role-based access
      await auth.setCustomUserClaims(uid, { role: newRole });

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const usersSnapshot = await firestore.collection('users').get();
      const users = [];

      usersSnapshot.forEach(doc => {
        users.push({
          uid: doc.id,
          ...doc.data()
        });
      });

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Authenticate user with email and password
  async authenticateUser(email, password) {
    try {
      // Get user by email to check if exists
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      // Authenticate with Firebase Auth
      // Note: Firebase Admin SDK doesn't have signInWithEmailAndPassword
      // We need to use a different approach - either create custom token or use Firebase REST API
      
      // For now, let's use Firebase REST API to authenticate
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      });

      const authData = await response.json();
      
      if (!response.ok) {
        throw new Error(authData.error?.message || 'Authentication failed');
      }

      // Update last login
      await firestore.collection('users').doc(user.uid).update({
        lastLogin: new Date().toISOString()
      });

      return {
        uid: user.uid,
        email: user.email,
        role: user.role,
        ...user
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Verify user login (for custom token generation) - keeping for backward compatibility
  async verifyLogin(email, idToken) {
    try {
      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(idToken);
      
      if (decodedToken.email !== email) {
        throw new Error('Email mismatch');
      }

      // Get user data from Firestore
      const userData = await this.getUserByUid(decodedToken.uid);
      
      if (!userData) {
        throw new Error('User not found in database');
      }

      if (!userData.isActive) {
        throw new Error('User account is deactivated');
      }

      // Update last login
      await firestore.collection('users').doc(decodedToken.uid).update({
        lastLogin: new Date().toISOString()
      });

      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData.role,
        ...userData
      };
    } catch (error) {
      console.error('Error verifying login:', error);
      throw error;
    }
  }

  // Create custom token for user
  async createCustomToken(uid) {
    try {
      const customToken = await auth.createCustomToken(uid);
      return customToken;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(uid) {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(uid);
      
      // Delete from Firestore
      await firestore.collection('users').doc(uid).delete();

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Deactivate user (soft delete)
  async deactivateUser(uid) {
    try {
      await firestore.collection('users').doc(uid).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      // Disable user in Firebase Auth
      await auth.updateUser(uid, { disabled: true });

      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(uid) {
    try {
      await firestore.collection('users').doc(uid).update({
        isActive: true,
        updatedAt: new Date().toISOString()
      });

      // Enable user in Firebase Auth
      await auth.updateUser(uid, { disabled: false });

      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();