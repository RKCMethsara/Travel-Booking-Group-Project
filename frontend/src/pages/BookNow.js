import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import places from '../data/places';
import authService from '../services/authService';
import { bookingsAPI } from '../services/api';
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateName,
  validateDate,
  checkRateLimit
} from '../utils/security';

const hotels = [
  'Ceylon Tea Trails', 'Galle Fort Hotel', 'Heritance Kandalama',
  'Jetwing Lighthouse', 'Shangri-La Hambantota', 'Taj Samudra',
  'Mount Lavinia Hotel', 'Amangalla', 'Anantara Peace Haven', 'Wild Coast Tented Lodge'
];

export default function BookNow() {
  const [form, setForm] = useState({place: '', hotel: '', date: '', name: '', email: '', phone: ''});
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      alert('Please login to make a booking');
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  async function save() {
    // Check if user is still authenticated
    if (!user) {
      setMsg('⚠️ Please login to make a booking');
      setMsgType('error');
      navigate('/login');
      return;
    }

    // Rate limiting - prevent spam bookings
    if (!checkRateLimit('booking', 3000)) {
      setMsg('⚠️ Please wait a moment before making another booking');
      setMsgType('error');
      return;
    }

    // Clear previous messages
    setMsg('');
    setMsgType('');
    setLoading(true);

    // Trim inputs
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    // Required field validation
    if (!form.place || !form.date || !name) {
      setMsg('⚠️ Please fill in all required fields (marked with *)');
      setMsgType('error');
      return;
    }

    // Name validation
    if (!validateName(name)) {
      setMsg('⚠️ Name should contain only letters and spaces (2-50 characters)');
      setMsgType('error');
      return;
    }

    // Date validation
    if (!validateDate(form.date)) {
      setMsg('⚠️ Please select a valid future date (within 2 years)');
      setMsgType('error');
      return;
    }

    // Email validation (if provided)
    if (email && !validateEmail(email)) {
      setMsg('⚠️ Please enter a valid email address');
      setMsgType('error');
      return;
    }

    // Phone validation (if provided)
    if (phone && !validatePhone(phone)) {
      setMsg('⚠️ Please enter a valid phone number (e.g., +94771234567)');
      setMsgType('error');
      return;
    }

    // Ensure at least one contact method is provided
    if (!email && !phone) {
      setMsg('⚠️ Please provide at least an email or phone number');
      setMsgType('error');
      return;
    }

    // Validate place exists
    const placeExists = places.some(p => p.id === form.place);
    if (!placeExists) {
      setMsg('⚠️ Invalid destination selected');
      setMsgType('error');
      return;
    }

    try {
      // Create booking object
      const bookingData = {
        place: sanitizeInput(form.place),
        hotel: sanitizeInput(form.hotel),
        date: form.date,
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        phone: sanitizeInput(phone)
      };

      // Send booking to server
      const response = await bookingsAPI.createBooking(bookingData);

      if (response.data.success) {
        setMsg('✅ Booking confirmed! Our team will contact you soon.');
        setMsgType('success');
        setForm({place: '', hotel: '', date: '', name: '', email: '', phone: ''});
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setMsg('');
          setMsgType('');
        }, 5000);
      } else {
        setMsg('⚠️ ' + (response.data.error || 'Error creating booking'));
        setMsgType('error');
      }

    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.error || 'Error processing booking. Please try again.';
      setMsg('⚠️ ' + errorMessage);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page book-now-page">
      <div className="booking-hero">
        <div className="booking-hero-content">
          <h1> Book Your Dream Vacation</h1>
          <p className="hero-subtitle">Discover the beauty of Sri Lanka</p>
        </div>
      </div>

      <div className="booking-container">
        <div className="booking-card">
          <div className="booking-header">
            <h2> Reservation Details</h2>
            <p className="booking-subtitle">Fill in your information to secure your spot</p>
          </div>

          <form className="booking-form" onSubmit={(e) => {e.preventDefault(); save();}}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="place"><span className="label-icon"></span> Destination *</label>
                <select id="place" value={form.place} onChange={e=>setForm({...form, place: e.target.value})} className="booking-input" required>
                  <option value="">Choose your destination</option>
                  {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="hotel"><span className="label-icon"></span> Preferred Hotel</label>
                <select id="hotel" value={form.hotel} onChange={e=>setForm({...form, hotel: e.target.value})} className="booking-input">
                  <option value="">Select a hotel (optional)</option>
                  {hotels.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date"><span className="label-icon"></span> Travel Date *</label>
                <input id="date" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="booking-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="name"><span className="label-icon"></span> Full Name *</label>
                <input id="name" type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="John Doe" className="booking-input" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email"><span className="label-icon"></span> Email Address</label>
                <input id="email" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="john@example.com" className="booking-input" />
              </div>
              <div className="form-group">
                <label htmlFor="phone"><span className="label-icon"></span> Phone Number</label>
                <input id="phone" type="tel" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="+94 77 123 4567" className="booking-input" />
              </div>
            </div>

            <button className="btn-booking" type="submit"> Confirm Reservation</button>
            <p className="form-helper">* Required fields</p>
          </form>

          {msg && <div className={`booking-msg ${msgType}`}>{msg}</div>}
        </div>

        <div className="booking-info">
          <div className="info-card">
            <div className="info-icon"></div>
            <h3>Quick & Easy</h3>
            <p>Book your destination in just a few clicks</p>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <h3>Secure Booking</h3>
            <p>Your information is safe with us</p>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <h3>Best Locations</h3>
            <p>Handpicked destinations across Sri Lanka</p>
          </div>
        </div>
      </div>
    </div>
  );
}
