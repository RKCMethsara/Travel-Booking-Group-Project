# System Flow Diagram - Tourism Booking System

## Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React)                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Home    │  │  Login/  │  │ Booking  │  │  Admin   │         │
│  │  Page    │  │  Signup  │  │  Pages   │  │  Panel   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │             │             │                 │
│       └─────────────┴─────────────┴─────────────┘                 │
│                          │                                         │
│                          ▼                                         │
│              ┌───────────────────────┐                            │
│              │   React Router        │                            │
│              │   (Route Management)  │                            │
│              └───────────┬───────────┘                            │
│                          │                                         │
│                          ▼                                         │
│              ┌───────────────────────┐                            │
│              │  Protected Routes     │                            │
│              │  (Authentication      │                            │
│              │   Required)           │                            │
│              └───────────┬───────────┘                            │
│                          │                                         │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS Requests
                           │ (JWT Token in Headers)
                           │
┌──────────────────────────▼─────────────────────────────────────────┐
│                    API LAYER (Express.js)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    Middleware Stack                       │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  1. CORS                  (Cross-Origin Resource Sharing)│    │
│  │  2. Body Parser           (JSON parsing)                 │    │
│  │  3. Rate Limiter          (Security)                     │    │
│  │  4. JWT Verification      (Authentication)               │    │
│  │  5. Role Authorization    (Admin check)                  │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                        │
│                           ▼                                        │
│  ┌───────────────────────────────────────────────────────┐       │
│  │                  Route Handlers                        │       │
│  ├───────────────────────────────────────────────────────┤       │
│  │  • /api/auth/*        (Authentication routes)         │       │
│  │  • /api/admin/*       (Admin management routes)       │       │
│  │  • /api/bookings/*    (Booking routes - future)       │       │
│  └────────────────────────┬──────────────────────────────┘       │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            │ Service Layer Calls
                            │
┌───────────────────────────▼────────────────────────────────────────┐
│                    SERVICE LAYER                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  userService     │  │  authService     │  │  Validation  │   │
│  ├──────────────────┤  ├──────────────────┤  │  Utilities   │   │
│  │ • createUser()   │  │ • signin()       │  └──────────────┘   │
│  │ • getAllUsers()  │  │ • signup()       │                      │
│  │ • updateRole()   │  │ • verifyToken()  │                      │
│  │ • deleteUser()   │  │ • resetPassword()│                      │
│  └────────┬─────────┘  └────────┬─────────┘                      │
│           │                     │                                 │
└───────────┼─────────────────────┼─────────────────────────────────┘
            │                     │
            │                     │ Firebase Admin SDK
            │                     │
┌───────────▼─────────────────────▼─────────────────────────────────┐
│                    FIREBASE BACKEND                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐        ┌──────────────────────┐        │
│  │  Firebase Auth       │        │  Firebase Firestore  │        │
│  ├──────────────────────┤        ├──────────────────────┤        │
│  │ • User Authentication│        │ • users collection   │        │
│  │ • JWT Token          │        │ • bookings collection│        │
│  │   Generation         │        │ • Real-time sync     │        │
│  │ • Password Reset     │        │ • Indexes            │        │
│  │ • Email Verification │        │ • Security Rules     │        │
│  └──────────────────────┘        └──────────────────────┘        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 1. User Registration Flow

```
┌────────┐                                    ┌────────────┐
│ User   │                                    │  React     │
│        │──1. Fills signup form─────────────►│  Login     │
│        │    (email, password, name)         │  Component │
└────────┘                                    └──────┬─────┘
                                                     │
                                              2. Validate
                                                     │
                                              ┌──────▼─────┐
                                              │  Frontend  │
                                              │  Validation│
                                              └──────┬─────┘
                                                     │
                                              3. POST request
                                              /api/auth/signup
                                                     │
┌─────────────────────────────────────────────────────▼──────────┐
│                         Backend API                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/signup                                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  4. Validate input (express-validator)                  │  │
│  │  5. Check if user exists                                 │  │
│  │  6. Hash password (Firebase Auth)                        │  │
│  │  7. Create user in Firebase Auth                         │  │
│  │  8. Create user document in Firestore                    │  │
│  │  9. Generate JWT token                                   │  │
│  │ 10. Return token + user data                             │  │
│  └──────────────────────────────────────┬───────────────────┘  │
└─────────────────────────────────────────┼──────────────────────┘
                                          │
                                  11. Response
                                          │
                                    ┌─────▼──────┐
                                    │   React    │
                                    │   App      │
                                    ├────────────┤
                                    │ 12. Store  │
                                    │     token  │
                                    │ 13. Navigate│
                                    │     to home│
                                    └────────────┘
```

---

## 2. User Login Flow

```
┌────────┐                                    ┌────────────┐
│ User   │                                    │  React     │
│        │──1. Enters credentials────────────►│  Login     │
│        │    (email, password)               │  Component │
└────────┘                                    └──────┬─────┘
                                                     │
                                              2. Validate
                                                     │
                                              3. POST request
                                              /api/auth/signin
                                                     │
┌─────────────────────────────────────────────────────▼──────────┐
│                         Backend API                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/signin                                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  4. Validate input                                       │  │
│  │  5. Firebase Auth: signInWithEmailAndPassword()          │  │
│  │  6. Verify password                                      │  │
│  │  7. Get user data from Firestore                         │  │
│  │  8. Check if user is active                              │  │
│  │  9. Generate JWT token (24hr expiry)                     │  │
│  │ 10. Update lastLogin timestamp                           │  │
│  │ 11. Return: { token, user, success }                     │  │
│  └──────────────────────────────────────┬───────────────────┘  │
└─────────────────────────────────────────┼──────────────────────┘
                                          │
                                  12. Response
                                          │
                                    ┌─────▼──────┐
                                    │   React    │
                                    │   App      │
                                    ├────────────┤
                                    │ 13. Store  │
                                    │     token  │
                                    │     in      │
                                    │     localStorage│
                                    │ 14. Set user│
                                    │     state   │
                                    │ 15. Redirect│
                                    │     based on│
                                    │     role    │
                                    └────────────┘
```

---

## 3. Protected Route Access Flow

```
┌────────┐                                    ┌────────────┐
│ User   │                                    │  React     │
│        │──1. Clicks protected page─────────►│  Router    │
│        │    (e.g., /bookings)               │            │
└────────┘                                    └──────┬─────┘
                                                     │
                                              2. ProtectedRoute
                                                 Component
                                                     │
                                          ┌──────────▼─────────┐
                                          │  Check JWT Token   │
                                          │  in localStorage   │
                                          └──────────┬─────────┘
                                                     │
                                          ┌──────────▼─────────┐
                                          │  Token Exists?     │
                                          └──────────┬─────────┘
                                                     │
                              ┌──────────────────────┼──────────────────────┐
                              │ YES                  │ NO                   │
                              ▼                      ▼                      │
                   ┌────────────────────┐   ┌────────────────────┐        │
                   │  Verify Token      │   │  Redirect to       │        │
                   │  (authService)     │   │  /login            │        │
                   └─────────┬──────────┘   └────────────────────┘        │
                             │                                              │
                    ┌────────▼────────┐                                     │
                    │  Token Valid?   │                                     │
                    └────────┬────────┘                                     │
                             │                                              │
              ┌──────────────┼──────────────┐                              │
              │ YES          │ NO            │                              │
              ▼              ▼               │                              │
     ┌────────────────┐ ┌──────────────┐    │                              │
     │ Check Role     │ │ Redirect to  │    │                              │
     │ (if required)  │ │ /login       │    │                              │
     └────────┬───────┘ └──────────────┘    │                              │
              │                              │                              │
     ┌────────▼────────┐                     │                              │
     │ Admin required? │                     │                              │
     └────────┬────────┘                     │                              │
              │                              │                              │
       ┌──────┴──────┐                       │                              │
       │ YES    NO   │                       │                              │
       ▼             ▼                       │                              │
┌──────────────┐ ┌──────────────┐           │                              │
│ Is user      │ │ Render       │           │                              │
│ admin?       │ │ Component    │           │                              │
└──────┬───────┘ └──────────────┘           │                              │
       │                                     │                              │
  ┌────┴────┐                                │                              │
  │ YES  NO │                                │                              │
  ▼         ▼                                │                              │
┌────┐  ┌────────┐                           │                              │
│Render│ │Redirect│                          │                              │
│Page │ │to Home │                           │                              │
└────┘  └────────┘                           │                              │
```

---

## 4. Booking Creation Flow

```
┌────────┐                                    ┌────────────┐
│ User   │                                    │  BookNow   │
│        │──1. Fills booking form────────────►│  Component │
│        │    (destination, dates, guests)    │            │
└────────┘                                    └──────┬─────┘
                                                     │
                                              2. Validate
                                                 form data
                                                     │
                                              3. POST request
                                              /api/bookings
                                              (with JWT token)
                                                     │
┌─────────────────────────────────────────────────────▼──────────┐
│                         Backend API                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Chain:                                       │  │
│  │  1. verifyJWTToken() ──► Extract & verify token         │  │
│  │  2. Attach user to req.user                             │  │
│  └──────────────────────────────────────┬───────────────────┘  │
│                                          │                      │
│  ┌──────────────────────────────────────▼───────────────────┐  │
│  │  POST /api/bookings                                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  3. Validate booking data                                │  │
│  │  4. Check date availability (optional)                   │  │
│  │  5. Create booking document in Firestore                 │  │
│  │     - Add userId from JWT                                │  │
│  │     - Set status: 'pending'                              │  │
│  │     - Add timestamps                                     │  │
│  │  6. Return booking confirmation                          │  │
│  └──────────────────────────────────────┬───────────────────┘  │
└─────────────────────────────────────────┼──────────────────────┘
                                          │
                                  7. Response
                                          │
                                    ┌─────▼──────┐
                                    │   React    │
                                    │   App      │
                                    ├────────────┤
                                    │ 8. Show    │
                                    │    success │
                                    │    message │
                                    │ 9. Navigate│
                                    │    to      │
                                    │    bookings│
                                    │    page    │
                                    └────────────┘
```

---

## 5. Admin Dashboard Flow

```
┌────────┐                                    ┌────────────┐
│ Admin  │                                    │  Admin     │
│ User   │──1. Access /admin─────────────────►│  Component │
└────────┘                                    └──────┬─────┘
                                                     │
                                          2. ProtectedRoute
                                             (requireAdmin)
                                                     │
                                          3. GET requests:
                                             /api/admin/dashboard
                                             /api/admin/users
                                             /api/admin/bookings
                                                     │
┌─────────────────────────────────────────────────────▼──────────┐
│                         Backend API                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Chain:                                       │  │
│  │  1. verifyJWTToken()  ──► Verify JWT                    │  │
│  │  2. requireAdmin()    ──► Check role === 'admin'        │  │
│  └──────────────────────────────────────┬───────────────────┘  │
│                                          │                      │
│  ┌──────────────────────────────────────▼───────────────────┐  │
│  │  GET /api/admin/dashboard                                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  3. Query all users from Firestore                       │  │
│  │  4. Calculate statistics:                                │  │
│  │     - Total users, admin count, user count               │  │
│  │     - Active/inactive users                              │  │
│  │  5. Get recent users (last 10)                           │  │
│  │  6. Return aggregated data                               │  │
│  └──────────────────────────────────────┬───────────────────┘  │
│                                          │                      │
│  ┌──────────────────────────────────────▼───────────────────┐  │
│  │  GET /api/admin/users                                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  7. Query users with filters (role, status, search)      │  │
│  │  8. Apply pagination                                     │  │
│  │  9. Return user list                                     │  │
│  └──────────────────────────────────────┬───────────────────┘  │
│                                          │                      │
│  ┌──────────────────────────────────────▼───────────────────┐  │
│  │  GET /api/admin/bookings                                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 10. Query bookings with filters                          │  │
│  │ 11. Calculate booking stats                              │  │
│  │ 12. Return bookings + stats                              │  │
│  └──────────────────────────────────────┬───────────────────┘  │
└─────────────────────────────────────────┼──────────────────────┘
                                          │
                                  13. Responses
                                          │
                                    ┌─────▼──────┐
                                    │   Admin    │
                                    │   Dashboard│
                                    ├────────────┤
                                    │ 14. Display│
                                    │     stats  │
                                    │ 15. Render │
                                    │     user   │
                                    │     table  │
                                    │ 16. Render │
                                    │     booking│
                                    │     table  │
                                    └────────────┘
```

---

## 6. Admin User Management Flow

```
┌────────┐                                    ┌────────────┐
│ Admin  │                                    │  Admin     │
│ User   │──1. Create/Update/Delete user─────►│  Panel     │
└────────┘                                    └──────┬─────┘
                                                     │
                                          ┌──────────▼─────────┐
                                          │  Action Type?      │
                                          └──────────┬─────────┘
                                                     │
                          ┌──────────────────────────┼──────────────────────┐
                          │                          │                      │
                   CREATE USER                 UPDATE USER            DELETE USER
                          │                          │                      │
                          ▼                          ▼                      ▼
              ┌─────────────────────┐    ┌─────────────────────┐  ┌────────────────┐
              │ POST                │    │ PUT/PATCH           │  │ DELETE         │
              │ /api/admin/         │    │ /api/admin/users/   │  │ /api/admin/    │
              │ create-admin        │    │ :uid/role           │  │ users/:uid     │
              └──────────┬──────────┘    │ or /status          │  └────────┬───────┘
                         │               └──────────┬──────────┘           │
┌────────────────────────▼───────────────────────────▼──────────────────────▼─────┐
│                         Backend API                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  Middleware: verifyJWTToken + requireAdmin                               │  │
│  └──────────────────────────────────────┬───────────────────────────────────┘  │
│                                          │                                      │
│  ┌──────────────────────────────────────▼───────────────────────────────────┐  │
│  │  CREATE ADMIN:                                                            │  │
│  │  1. Validate input (express-validator)                                   │  │
│  │  2. Check if email already exists                                        │  │
│  │  3. Create user in Firebase Auth                                         │  │
│  │  4. Create user document in Firestore with role='admin'                  │  │
│  │  5. Add createdBy field (current admin's uid)                            │  │
│  │  6. Return success + new admin data                                      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  UPDATE USER:                                                             │  │
│  │  1. Validate input                                                        │  │
│  │  2. Check user exists                                                     │  │
│  │  3. Prevent admin from demoting themselves                                │  │
│  │  4. Update user document in Firestore                                    │  │
│  │  5. Update Firebase Auth custom claims (for role)                        │  │
│  │  6. Return success                                                        │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  DELETE USER:                                                             │  │
│  │  1. Check user exists                                                     │  │
│  │  2. Prevent admin from deleting themselves                                │  │
│  │  3. Delete user from Firebase Auth                                       │  │
│  │  4. Delete user document from Firestore                                  │  │
│  │  5. Return success                                                        │  │
│  └──────────────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────────────┼──────────────────────────────────┘
                                              │
                                      Response│
                                              │
                                        ┌─────▼──────┐
                                        │   Admin    │
                                        │   Panel    │
                                        ├────────────┤
                                        │  Update UI │
                                        │  Show msg  │
                                        │  Refresh   │
                                        │  data      │
                                        └────────────┘
```

---

## 7. Security & Validation Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    Security Layers                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Layer 1: Frontend Validation                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • Email format validation                                 │ │
│  │ • Password strength check                                 │ │
│  │ • Required field validation                               │ │
│  │ • Date range validation                                   │ │
│  │ • Rate limiting (client-side)                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          ▼                                     │
│  Layer 2: Network Security                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • HTTPS encryption                                        │ │
│  │ • CORS policy                                             │ │
│  │ • JWT token in Authorization header                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          ▼                                     │
│  Layer 3: Backend Middleware                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • express-validator (input sanitization)                 │ │
│  │ • JWT verification (verifyJWTToken)                       │ │
│  │ • Role authorization (requireAdmin)                       │ │
│  │ • Rate limiting (server-side)                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          ▼                                     │
│  Layer 4: Business Logic                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • User existence checks                                   │ │
│  │ • Permission validation                                   │ │
│  │ • Data ownership verification                             │ │
│  │ • Status checks (isActive)                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          ▼                                     │
│  Layer 5: Database Security                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • Firebase Security Rules                                 │ │
│  │ • Indexed queries only                                    │ │
│  │ • Data encryption at rest                                 │ │
│  │ • Automatic backups                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                               │
├─────────────────────────────────────────────────────────────┤
│  • React 19.2.0                                             │
│  • React Router DOM (Client-side routing)                   │
│  • CSS3 (Modern design with animations)                     │
│  • LocalStorage (JWT token storage)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Backend                                │
├─────────────────────────────────────────────────────────────┤
│  • Node.js 18+                                              │
│  • Express.js 4.18.2                                        │
│  • CORS (Cross-Origin Resource Sharing)                     │
│  • express-validator (Input validation)                     │
│  • JWT (JSON Web Tokens for auth)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Database & Auth                        │
├─────────────────────────────────────────────────────────────┤
│  • Firebase Admin SDK 12.0.0                                │
│  • Firebase Authentication                                  │
│  • Firebase Firestore (NoSQL Database)                      │
│  • Firebase Security Rules                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features Implementation

1. **Authentication System**: JWT-based with 24-hour expiry
2. **Role-Based Access Control**: Admin and User roles
3. **Protected Routes**: Client and server-side validation
4. **Admin Dashboard**: User management, booking management
5. **Booking System**: Create, view, update, delete bookings
6. **Security**: Multi-layer validation, rate limiting, CORS
7. **Responsive Design**: Modern CSS with animations
8. **Real-time Updates**: Firestore real-time listeners (optional)
