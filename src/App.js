import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import './styles.css';
import './performance.css';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import PlacePage from './pages/PlacePage';
import BookNow from './pages/BookNow';
import Foods from './pages/Foods';
import Hire from './pages/Hire';
import Login from './pages/Login';
import BookingsView from './pages/BookingsView';
import Admin from './pages/Admin';

function AppContent(){
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="app-root">
      {!isAdminPage && <NavBar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/destinations" element={<Destinations/>} />
          <Route path="/place/:id" element={<PlacePage/>} />
          <Route path="/login" element={<Login/>} />
          
          {/* Protected Routes - Require Login */}
          <Route path="/foods" element={
            <ProtectedRoute>
              <Foods/>
            </ProtectedRoute>
          } />
          <Route path="/hire" element={
            <ProtectedRoute>
              <Hire/>
            </ProtectedRoute>
          } />
          <Route path="/book" element={
            <ProtectedRoute>
              <BookNow/>
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <BookingsView/>
            </ProtectedRoute>
          } />
            
          {/* Admin Only Route */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin/>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App(){
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
