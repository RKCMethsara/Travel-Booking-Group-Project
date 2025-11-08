# Firebase Backend Setup Guide

This guide will help you set up the Firebase backend for the travel booking application with authentication and role-based access control.

## 🚀 Quick Setup

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and Firestore Database

### 2. Firebase Authentication Setup

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable other providers you want to support

### 3. Firestore Database Setup

1. In Firebase Console, go to **Firestore Database**
2. Create database in test mode (or production mode with proper rules)
3. The backend will automatically create the required collections

### 4. Firebase Admin SDK Setup

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Extract the values for your `.env` file

### 5. Backend Installation

```bash
cd backend
npm install
```

### 6. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Firebase credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration (from your service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# JWT Secret (generate a strong secret)
JWT_SECRET=your-strong-jwt-secret-key-here

# Initial Admin Account
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=Admin123!@#
```

### 7. Frontend Configuration

1. In the root directory, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update with your Firebase web app config:
```env
# Firebase Web App Configuration
REACT_APP_FIREBASE_API_KEY=your-web-app-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

### 8. Install Frontend Dependencies

```bash
npm install
```

### 9. Initialize Admin Account

```bash
cd backend
npm run init-admin
```

This will create the initial admin user in Firebase.

### 10. Start the Applications

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm start
```

## 🔑 Default Admin Credentials

After running the init-admin script, you can login with:
- **Email**: admin@example.com (or your INITIAL_ADMIN_EMAIL)
- **Password**: Admin123!@# (or your INITIAL_ADMIN_PASSWORD)

⚠️ **Important**: Change these credentials after first login!

## 📚 API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user (normal users only)
- `POST /api/auth/login` - User login with role detection
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-token` - Verify token validity

### Admin Routes (Admin Only)
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users with pagination
- `POST /api/admin/create-admin` - Create new admin user
- `PUT /api/admin/users/:uid/role` - Update user role
- `PUT /api/admin/users/:uid/status` - Activate/deactivate user
- `DELETE /api/admin/users/:uid` - Delete user
- `GET /api/admin/users/:uid` - Get user details

## 🛡️ Security Features

- Firebase Authentication for secure user management
- Role-based access control (Admin/User)
- JWT token verification
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Brute force protection

## 🎯 User Roles

### Normal Users
- Can signup through the website
- Can login and access user features
- Cannot access admin dashboard
- Role: `user`

### Admin Users
- Can access admin dashboard
- Can create other admin users
- Can manage all users (view, edit roles, activate/deactivate)
- Can view user statistics
- Role: `admin`

## 🔄 Role-Based Redirects

- **Normal Users**: Login redirects to `/`
- **Admin Users**: Login redirects to `/admin`

## 🐛 Troubleshooting

### Firebase Connection Issues
1. Check your Firebase project ID and credentials
2. Ensure Firestore is enabled
3. Verify service account permissions

### Authentication Issues
1. Check Firebase Auth is enabled for Email/Password
2. Verify frontend Firebase config matches your web app
3. Check CORS settings in backend

### Admin Creation Issues
1. Ensure Firebase Admin SDK is properly configured
2. Check environment variables are set correctly
3. Verify Firestore write permissions

## 📱 Frontend Features

- Firebase Authentication integration
- Automatic role detection
- Protected routes based on user role
- Admin dashboard with user management
- Responsive design
- Real-time user status updates

## 🚀 Production Deployment

1. Update environment variables for production
2. Set up Firebase security rules
3. Configure proper CORS origins
4. Use production Firebase project
5. Set NODE_ENV=production
6. Use secure JWT secrets

## 📞 Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
4. Check network connectivity and Firebase service status