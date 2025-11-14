const express = require('express');
const { body, validationResult } = require('express-validator');
const userService = require('../services/userService');
const { verifyJWTToken, verifyFirebaseToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register new user (normal users only)
// @access  Public
router.post('/register', validateSignup, async (req, res) => {
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

    // Create new user (always as 'user' role for public signup)
    const userData = await userService.createUser(email, password, 'user', {
      firstName: firstName || '',
      lastName: lastName || ''
    });

    // Generate JWT token for the user
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        uid: userData.uid, 
        email: userData.email, 
        role: userData.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token: token,
      user: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    let errorMessage = 'Failed to create user';
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

// @route   POST /api/auth/login
// @desc    Authenticate user and return user data with role
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Authenticate user with Firebase and get user data
    const userData = await userService.authenticateUser(email, password);

    // Generate JWT token for the user
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        uid: userData.uid, 
        email: userData.email, 
        role: userData.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        isActive: userData.isActive
      },
      redirectTo: userData.role === 'admin' ? '/admin' : '/'
    });

  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Invalid credentials';
    if (error.message === 'User not found in database') {
      errorMessage = 'User not found';
    } else if (error.message === 'User account is deactivated') {
      errorMessage = 'Account is deactivated. Please contact administrator.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    }
    
    res.status(401).json({
      error: errorMessage
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user data
// @access  Private
router.get('/profile', verifyJWTToken, requireAuth, async (req, res) => {
  try {
    res.json({
      user: {
        uid: req.user.uid,
        email: req.user.email,
        role: req.user.role,
        firstName: req.user.firstName || '',
        lastName: req.user.lastName || '',
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user data'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token cleanup)
// @access  Private
router.post('/logout', verifyJWTToken, requireAuth, (req, res) => {
  // JWT tokens are stateless, so logout is handled on client-side
  // This endpoint can be used for logging or cleanup if needed
  res.json({
    message: 'Logout successful'
  });
});

// @route   POST /api/auth/reset-password
// @desc    Send password reset email
// @access  Public
router.post('/reset-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const existingUser = await userService.getUserByEmail(email);
    if (!existingUser) {
      // For security reasons, don't reveal if user exists or not
      return res.json({
        message: 'If an account exists with this email, a password reset link will be sent.'
      });
    }

    // Generate password reset link using Firebase Admin
    const { auth } = require('../config/firebase');
    const resetLink = await auth.generatePasswordResetLink(email);

    // In production, send this link via email service
    // For now, we'll just return success (in real app, use SendGrid, AWS SES, etc.)
    console.log('Password reset link for', email, ':', resetLink);

    res.json({
      message: 'If an account exists with this email, a password reset link will be sent.',
      // In development, include the link (REMOVE IN PRODUCTION)
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Failed to process password reset request'
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid and return user role
// @access  Private
router.get('/verify-token', verifyFirebaseToken, requireAuth, (req, res) => {
  res.json({
    valid: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;