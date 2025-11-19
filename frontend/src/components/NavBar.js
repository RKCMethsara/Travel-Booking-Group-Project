import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './NavBar.css';

const NavBar = memo(() => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((currentUser, isLoading) => {
      setUser(currentUser);
      setLoading(isLoading);
    });

    // Get current user immediately
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const handleLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        setLoading(true);
        await authService.logout();
        navigate('/');
        alert('✅ You have been logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        alert('⚠️ Logout error, but you have been logged out locally');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
  }, [navigate]);

  return (
    <nav className="navbar responsive-navbar">
      <div className="nav-brand">
        <Link to="/" className="nav-brand-link">
          <img 
            src="/images/website%20project3.png" 
            alt="DREAM CYLON" 
            className="nav-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="nav-brand-text">DREAM CYLON</span>
        </Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/destinations">Destinations</Link></li>
        <li><Link to="/book">Book Now</Link></li>
        <li><Link to="/foods">Foods</Link></li>
        <li><Link to="/hire">Hire Vehicle</Link></li>
        <li><Link to="/bookings">My Bookings</Link></li>
        {user && user.role === 'admin' && (
          <li><Link to="/admin">Admin</Link></li>
        )}
      </ul>
      <div className="nav-login">
        {user ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{color: '#fff'}}>👤 {user.email}</span>
            <button 
              onClick={handleLogout}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
});

NavBar.displayName = 'NavBar';

export default NavBar;
