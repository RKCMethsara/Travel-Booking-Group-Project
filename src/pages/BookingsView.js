import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput } from '../utils/security';
import authService from '../services/authService';
import { bookingsAPI } from '../services/api';
import places from '../data/places';

export default function BookingsView() {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Fetch bookings from API
      const response = await bookingsAPI.getMyBookings();
      
      if (response.data.success) {
        setUserBookings(response.data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings. Please try again.');
      setUserBookings([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if user is logged in
    const user = authService.getCurrentUser();
    if (!user) {
      alert('⚠️ Please login to view your bookings');
      navigate('/login');
      return;
    }

    loadUserBookings();
  }, [navigate, loadUserBookings]);

  const getPlaceName = useCallback((placeId) => {
    const place = places.find(p => p.id === placeId);
    return place ? place.name : 'Unknown Location';
  }, []);

  const cancelBooking = useCallback(async (bookingId) => {
    if (!window.confirm('⚠️ Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await bookingsAPI.cancelBooking(bookingId);
      
      if (response.data.success) {
        alert('✅ Booking cancelled successfully');
        loadUserBookings();
      } else {
        alert('⚠️ Error cancelling booking. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('⚠️ Error cancelling booking. Please try again.');
    }
  }, [loadUserBookings]);

  const navigateToBook = useCallback(() => {
    navigate('/book');
  }, [navigate]);

  if (loading) {
    return (
      <div className="page bookings-view">
        <div style={{textAlign: 'center', padding: '50px'}}>
          <h2>Loading your bookings...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page bookings-view">
      <h2>📋 My Bookings</h2>
      
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {userBookings.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px'}}>
          <p style={{fontSize: '1.2rem', color: '#666'}}>
            {error ? 'Unable to load bookings.' : 'No bookings yet.'}
          </p>
          <button 
            className="btn primary" 
            onClick={navigateToBook}
            style={{marginTop: '20px', padding: '12px 24px'}}
          >
            Make Your First Booking
          </button>
        </div>
      ) : (
        <ul className="booking-list">
          {userBookings.map(b => (
            <li key={b.id} style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px'}}>
                    📍 {getPlaceName(b.place)}
                  </div>
                  <div style={{color: '#666', marginBottom: '5px'}}>
                    🗓️ Travel Date: <strong>{b.date}</strong>
                  </div>
                  <div style={{color: '#666', marginBottom: '5px'}}>
                    🏨 Hotel: {b.hotel || <em>Not specified</em>}
                  </div>
                  <div style={{color: '#666', marginBottom: '5px'}}>
                    👤 Name: {sanitizeInput(b.name)}
                  </div>
                  {b.email && (
                    <div style={{color: '#666', marginBottom: '5px'}}>
                      📧 Email: {sanitizeInput(b.email)}
                    </div>
                  )}
                  {b.phone && (
                    <div style={{color: '#666', marginBottom: '5px'}}>
                      📱 Phone: {sanitizeInput(b.phone)}
                    </div>
                  )}
                  <div style={{color: '#999', fontSize: '0.9rem', marginTop: '10px'}}>
                    Booked on: {new Date(b.created).toLocaleString()}
                  </div>
                  <div style={{marginTop: '8px'}}>
                    <span style={{
                      background: 
                        b.status === 'pending' ? '#fff3cd' : 
                        b.status === 'confirmed' ? '#d1ecf1' :
                        b.status === 'completed' ? '#d4edda' :
                        b.status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                      color: 
                        b.status === 'pending' ? '#856404' : 
                        b.status === 'confirmed' ? '#0c5460' :
                        b.status === 'completed' ? '#155724' :
                        b.status === 'cancelled' ? '#721c24' : '#383d41',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {b.status === 'pending' && '⏳ Pending'}
                      {b.status === 'confirmed' && '✅ Confirmed'}
                      {b.status === 'completed' && '🎉 Completed'}
                      {b.status === 'cancelled' && '❌ Cancelled'}
                      {!['pending', 'confirmed', 'completed', 'cancelled'].includes(b.status) && b.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => cancelBooking(b.id)}
                  disabled={b.status === 'cancelled' || b.status === 'completed'}
                  style={{
                    background: (b.status === 'cancelled' || b.status === 'completed') ? '#6c757d' : '#dc3545',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: (b.status === 'cancelled' || b.status === 'completed') ? 'not-allowed' : 'pointer',
                    opacity: (b.status === 'cancelled' || b.status === 'completed') ? '0.6' : '1',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
