import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { adminAPI } from '../services/api';
import './AdminStyles.css';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, usersResponse, bookingsResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getBookings({ limit: 50 })
      ]);

      setDashboardData(dashboardResponse.data);
      setUsers(usersResponse.data.users);
      setBookings(bookingsResponse.data.bookings);
      setBookingStats(bookingsResponse.data.stats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.email || !newAdmin.password || !newAdmin.firstName || !newAdmin.lastName) {
      setError('All fields are required');
      return;
    }

    // Validate password on frontend
    if (newAdmin.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(newAdmin.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
      return;
    }

    try {
      setIsCreatingAdmin(true);
      setError('');

      await adminAPI.createAdmin(newAdmin);
      
      // Reset form
      setNewAdmin({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      });

      // Reload data
      await loadDashboardData();
      
      setError('');
      setActiveTab('users');
    } catch (error) {
      console.error('Error creating admin:', error);
      
      // Show detailed error from backend
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(err => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.error || 'Failed to create admin user');
      }
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleUpdateUserRole = async (uid, newRole) => {
    try {
      await adminAPI.updateUserRole(uid, newRole);
      await loadDashboardData();
      setError('');
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  const handleUpdateUserStatus = async (uid, isActive) => {
    try {
      await adminAPI.updateUserStatus(uid, isActive);
      await loadDashboardData();
      setError('');
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, status);
      await loadDashboardData();
      setError('');
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This cannot be undone.')) {
      try {
        await adminAPI.deleteBooking(bookingId);
        await loadDashboardData();
        setError('');
      } catch (error) {
        console.error('Error deleting booking:', error);
        setError('Failed to delete booking');
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await authService.logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if API call fails, redirect to login
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="page admin-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div className="admin-title">
          <h1>🛡️ Admin Dashboard</h1>
          <p>Welcome back, {user?.firstName} {user?.lastName}</p>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">
            🏠 Back to Site
          </button>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create-admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('create-admin')}
        >
          ➕ Create Admin
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {activeTab === 'dashboard' && dashboardData && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{dashboardData.statistics.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛡️</div>
              <div className="stat-info">
                <h3>{dashboardData.statistics.adminUsers}</h3>
                <p>Admin Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <h3>{dashboardData.statistics.normalUsers}</h3>
                <p>Normal Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{dashboardData.statistics.activeUsers}</h3>
                <p>Active Users</p>
              </div>
            </div>
          </div>

          <div className="recent-users">
            <h2>Recent Users</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.map(user => (
                    <tr key={user.uid}>
                      <td>{user.email}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <h2>All Users ({users.length})</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid}>
                    <td>{u.email}</td>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUpdateUserRole(u.uid, e.target.value)}
                        disabled={u.uid === user?.uid}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <label className="toggle">
                        <input 
                          type="checkbox" 
                          checked={u.isActive}
                          onChange={(e) => handleUpdateUserStatus(u.uid, e.target.checked)}
                          disabled={u.uid === user?.uid}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            // handleDeleteUser(u.uid);
                          }
                        }}
                        disabled={u.uid === user?.uid}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bookings-content">
          <h2>All Bookings ({bookings.length})</h2>
          
          {bookingStats && (
            <div className="booking-stats">
              <div className="stat-card">
                <div className="stat-value">{bookingStats.total}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{bookingStats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{bookingStats.confirmed}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{bookingStats.cancelled}</div>
                <div className="stat-label">Cancelled</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{bookingStats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          )}

          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Destination</th>
                  <th>Hotel</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td>{booking.name}</td>
                    <td>{booking.email}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.place}</td>
                    <td>{booking.hotel}</td>
                    <td>
                      <select 
                        value={booking.status} 
                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                        className={`status-select status-${booking.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteBooking(booking.id)}
                        title="Delete booking"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="no-data">
              <p>📅 No bookings found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create-admin' && (
        <div className="create-admin-content">
          <h2>Create New Admin User</h2>
          <div className="create-admin-form">
            <form onSubmit={handleCreateAdmin}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin({...newAdmin, firstName: e.target.value})}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  placeholder="Create a strong password"
                  required
                  minLength="8"
                />
                <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                  Must be at least 8 characters and include:
                  <ul style={{marginTop: '5px', paddingLeft: '20px', fontSize: '0.85rem'}}>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                  Example: Admin@2025
                </small>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={isCreatingAdmin}
              >
                {isCreatingAdmin ? '⏳ Creating...' : '➕ Create Admin User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
