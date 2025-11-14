import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { checkRateLimit } from '../utils/security';
import {
  validatePasswordStrength,
  auditLog,
  advancedSanitize,
  validateEmailSecure
} from '../utils/advancedSecurity';

export default function Login(){
  const [user, setUser] = useState({
    email: '', 
    password: '', 
    confirmPassword: '', 
    firstName: '', 
    lastName: ''
  });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        if (currentUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    }
  }, [navigate]);

  const submit = useCallback(async () => {
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Rate limiting - prevent spam submissions
    if (!checkRateLimit('login', 2000)) {
      setMsg('⚠️ Please wait before trying again');
      setMsgType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Trim inputs
      const email = user.email.trim().toLowerCase();
      const password = user.password.trim();

      // Advanced validation
      if(!email) { 
        setMsg('⚠️ Please enter your email'); 
        setMsgType('error');
        setIsSubmitting(false);
        return; 
      }
      
      if (!validateEmailSecure(email)) {
        setMsg('⚠️ Please enter a valid email address');
        setMsgType('error');
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setMsg('⚠️ Please enter your password');
        setMsgType('error');
        setIsSubmitting(false);
        return;
      }

      if (isLogin) {
        // Login with backend API
        const response = await authService.signin(email, password);
        
        if (response.success) {
          setMsg('✅ Login successful! Redirecting...');
          setMsgType('success');
          
          // Clear form
          setUser({email: '', password: ''});
          
          // Navigate based on user role
          setTimeout(() => {
            if (response.user.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          setMsg(`❌ ${response.error || 'Login failed'}`);
          setMsgType('error');
          setIsSubmitting(false);
          return;
        }

      } else {
        // Sign up with Firebase
        const { confirmPassword, firstName, lastName } = user;
        
        if (!firstName || !lastName) {
          setMsg('⚠️ Please enter your first and last name');
          setMsgType('error');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setMsg('⚠️ Passwords do not match');
          setMsgType('error');
          setIsSubmitting(false);
          return;
        }

        // Password strength validation for signup
        const passwordCheck = validatePasswordStrength(password);
        if (!passwordCheck.isValid) {
          setMsg('⚠️ Password must be at least 6 characters with uppercase, lowercase, and numbers');
          setMsgType('error');
          setIsSubmitting(false);
          return;
        }

        const response = await authService.signup({
          email,
          password,
          confirmPassword,
          firstName,
          lastName
        });

        if (response.success) {
          setMsg('✅ Account created successfully! You are now logged in.');
          setMsgType('success');
          
          // Clear form
          setUser({email: '', password: '', confirmPassword: '', firstName: '', lastName: ''});
          
          // Navigate based on user role (newly created users are regular users)
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setMsg(`❌ ${response.error || 'Registration failed'}`);
          setMsgType('error');
          setIsSubmitting(false);
          return;
        }
      }

    } catch (error) {
      console.error('Auth error:', error);
      setMsg(`⚠️ ${error.message}`);
      setMsgType('error');
      
      // Audit log for failed attempts
      auditLog.log('LOGIN_FAILED', { 
        email: advancedSanitize(user.email), 
        error: error.message 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, navigate, isSubmitting, isLogin]);

  const handleForgotPassword = async () => {
    if (!resetEmail || !validateEmailSecure(resetEmail.trim())) {
      setMsg('⚠️ Please enter a valid email address');
      setMsgType('error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword(resetEmail.trim().toLowerCase());
      
      if (response.success) {
        setMsg('✅ Password reset email sent! Please check your inbox.');
        setMsgType('success');
        setResetEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setMsg('');
        }, 3000);
      } else {
        setMsg('⚠️ ' + (response.error || 'Failed to send reset email'));
        setMsgType('error');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setMsg('⚠️ ' + (error.response?.data?.error || 'Failed to send reset email. Please try again.'));
      setMsgType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">🏝️</div>
          <h1>Welcome to Sri Lanka Tourism</h1>
          <p className="login-subtitle">
            {isLogin ? 'Sign in to manage your bookings' : 'Create an account to get started'}
          </p>
        </div>

        <div className="login-card">
          <div className="login-tabs">
            <button 
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={(e) => {e.preventDefault(); submit();}}>
            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      <span className="label-icon">👤</span>
                      First Name
                    </label>
                    <input 
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name" 
                      value={user.firstName} 
                      onChange={e=>setUser({...user, firstName: e.target.value})}
                      className="login-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">
                      <span className="label-icon">👤</span>
                      Last Name
                    </label>
                    <input 
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name" 
                      value={user.lastName} 
                      onChange={e=>setUser({...user, lastName: e.target.value})}
                      className="login-input"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <input 
                id="email"
                type="email"
                placeholder="Enter your email" 
                value={user.email} 
                onChange={e=>setUser({...user, email: e.target.value})}
                className="login-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"} 
                  value={user.password} 
                  onChange={e=>setUser({...user, password: e.target.value})}
                  className="login-input"
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  👁
                </button>
              </div>
              {!isLogin && (
                <small className="password-hint">
                  At least 6 characters with uppercase, lowercase, and numbers
                </small>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">🔒</span>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password" 
                    value={user.confirmPassword} 
                    onChange={e=>setUser({...user, confirmPassword: e.target.value})}
                    className="login-input"
                    style={{ paddingRight: '50px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    👁
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                <button 
                  type="button"
                  className="link-btn" 
                  onClick={() => setShowForgotPassword(true)}
                  style={{ fontSize: '0.9rem', color: '#007bff' }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              className="btn-login" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>⏳ {isLogin ? 'Signing In...' : 'Creating Account...'}</>
              ) : (
                <>{isLogin ? '🔐 Sign In' : '✨ Create Account'}</>
              )}
            </button>
          </form>

          {msg && (
            <div className={`login-msg ${msgType}`}>
              {msg}
            </div>
          )}

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button 
                className="link-btn" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Reset Password</h3>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Enter your email address and we'll send you a password reset link.
              </p>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="login-input"
                  style={{ marginBottom: '20px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-login"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  className="link-btn"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={isSubmitting}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    background: '#f5f5f5'
                  }}
                >
                  Cancel
                </button>
              </div>

              {msg && (
                <div className={`login-msg ${msgType}`} style={{ marginTop: '15px' }}>
                  {msg}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🎫</span>
            <span>Easy Booking</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌍</span>
            <span>20+ Destinations</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⭐</span>
            <span>Premium Hotels</span>
          </div>
        </div>
      </div>
    </div>
  );
}
