const jwt = require('jsonwebtoken');
const { auth, firestore } = require('../config/firebase');

// Verify JWT Token
const verifyJWTToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization header missing or invalid format' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User not found in database' 
      });
    }

    const userData = userDoc.data();
    
    // Check if user is still active
    if (!userData.isActive) {
      return res.status(403).json({ 
        error: 'User account is deactivated' 
      });
    }
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || 'user',
      ...userData
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

// Verify Firebase ID Token (keep for backward compatibility)
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization header missing or invalid format' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User not found in database' 
      });
    }

    const userData = userDoc.data();
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || 'user',
      ...userData
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }

  next();
};

// Check if user is authenticated (any role)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }
  
  next();
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  verifyJWTToken,
  verifyFirebaseToken,
  requireAdmin,
  requireAuth,
  requireRole
};