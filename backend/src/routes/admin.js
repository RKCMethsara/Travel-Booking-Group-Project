const express = require('express');
const { body, validationResult } = require('express-validator');
const userService = require('../services/userService');
const { verifyJWTToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyJWTToken, requireAdmin);

// Validation middleware for creating admin users
const validateCreateAdmin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required')
];

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get all users
    const users = await userService.getAllUsers();
    
    // Calculate statistics
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const normalUsers = users.filter(user => user.role === 'user').length;
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = users.filter(user => !user.isActive).length;

    // Get recent users (last 10)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      statistics: {
        totalUsers,
        adminUsers,
        normalUsers,
        activeUsers,
        inactiveUsers
      },
      recentUsers: recentUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    
    let users = await userService.getAllUsers();

    // Apply filters
    if (role && role !== 'all') {
      users = users.filter(user => user.role === role);
    }

    if (status && status !== 'all') {
      const isActive = status === 'active';
      users = users.filter(user => user.isActive === isActive);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.length / limit),
        totalUsers: users.length,
        hasNext: endIndex < users.length,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users'
    });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create new admin user
// @access  Private/Admin
router.post('/create-admin', validateCreateAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email'
      });
    }

    // Create new admin user
    const userData = await userService.createUser(email, password, 'admin', {
      firstName,
      lastName,
      createdBy: req.user.uid
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: userData.createdAt
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    
    let errorMessage = 'Failed to create admin user';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'User already exists with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    
    res.status(400).json({
      error: errorMessage
    });
  }
});

// @route   PUT /api/admin/users/:uid/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:uid/role', [
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { uid } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role to user
    if (uid === req.user.uid && role === 'user') {
      return res.status(400).json({
        error: 'You cannot change your own role to user'
      });
    }

    // Check if user exists
    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update user role
    await userService.updateUserRole(uid, role);

    res.json({
      message: 'User role updated successfully',
      user: {
        uid: user.uid,
        email: user.email,
        role: role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role'
    });
  }
});

// @route   PUT /api/admin/users/:uid/status
// @desc    Activate or deactivate user
// @access  Private/Admin
router.put('/users/:uid/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { uid } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (uid === req.user.uid && !isActive) {
      return res.status(400).json({
        error: 'You cannot deactivate your own account'
      });
    }

    // Check if user exists
    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Activate or deactivate user
    if (isActive) {
      await userService.activateUser(uid);
    } else {
      await userService.deactivateUser(uid);
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        uid: user.uid,
        email: user.email,
        isActive: isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status'
    });
  }
});

// @route   DELETE /api/admin/users/:uid
// @desc    Delete user (permanent)
// @access  Private/Admin
router.delete('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Prevent admin from deleting themselves
    if (uid === req.user.uid) {
      return res.status(400).json({
        error: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Delete user
    await userService.deleteUser(uid);

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        uid: user.uid,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user'
    });
  }
});

// @route   GET /api/admin/users/:uid
// @desc    Get specific user details
// @access  Private/Admin
router.get('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      error: 'Failed to get user details'
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings for admin
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { firestore } = require('../config/firebase');
    const db = firestore;

    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Get all bookings (simpler query without compound index)
    let query = db.collection('bookings');

    // Only filter by status if provided (single field query doesn't need index)
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let bookings = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        ...data,
        created: data.created?.toDate ? data.created.toDate().toISOString() : data.created,
        updated: data.updated?.toDate ? data.updated.toDate().toISOString() : data.updated
      });
    });

    // Sort in memory (newest first)
    bookings.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(booking => 
        booking.name.toLowerCase().includes(searchLower) ||
        booking.email.toLowerCase().includes(searchLower) ||
        booking.place.toLowerCase().includes(searchLower) ||
        booking.hotel.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = bookings.length;
    const paginatedBookings = bookings.slice(offset, offset + parseInt(limit));

    // Calculate stats
    const stats = {
      total: total,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length
    };

    res.json({
      bookings: paginatedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to get bookings'
    });
  }
});

// @route   PATCH /api/admin/bookings/:bookingId/status
// @desc    Update booking status
// @access  Private/Admin
router.patch('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const { firestore } = require('../config/firebase');
    const db = firestore;

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    await bookingRef.update({
      status,
      updated: new Date(),
      updatedBy: req.user.email
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully'
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      error: 'Failed to update booking status'
    });
  }
});

// @route   DELETE /api/admin/bookings/:bookingId
// @desc    Delete a booking
// @access  Private/Admin
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { firestore } = require('../config/firebase');
    const db = firestore;

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    await bookingRef.delete();

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      error: 'Failed to delete booking'
    });
  }
});

module.exports = router;