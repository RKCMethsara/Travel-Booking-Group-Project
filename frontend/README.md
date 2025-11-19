# Frontend - Travel Booking Application

React-based frontend for the travel booking application.

## Setup

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Configuration

The frontend connects to the backend API at `http://localhost:5000` by default. Update API endpoint in `src/services/api.js` if needed.

## Features

- User authentication (Login/Signup)
- Browse destinations and attractions
- Book travel packages
- Admin dashboard for managing bookings
- Protected routes for authenticated users

## Technology Stack

- React 19.2.0
- React Router DOM 6.30.1
- Axios for API calls
- Firebase Authentication
