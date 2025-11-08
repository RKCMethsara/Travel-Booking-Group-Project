const express = require('express');
const { verifyJWTToken } = require('../middleware/auth');
const { firestore } = require('../config/firebase');
const router = express.Router();

const db = firestore;

// Create a new booking
router.post('/', verifyJWTToken, async (req, res) => {
  try {
    const {
      place,
      hotel,
      date,
      name,
      email,
      phone
    } = req.body;

    // Validation
    if (!place || !hotel || !date || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Get user info from token
    const userId = req.user.uid;
    const userEmail = req.user.email;

    // Check for duplicate bookings (simplified - check same user, place and date)
    // Note: For production, you might want to create a Firestore index for better performance
    const recentBookings = await db.collection('bookings')
      .where('userId', '==', userId)
      .where('place', '==', place)
      .where('date', '==', date)
      .limit(1)
      .get();

    if (!recentBookings.empty) {
      return res.status(400).json({
        success: false,
        error: 'You have already made a booking for this place and date'
      });
    }

    // Create booking object
    const bookingData = {
      userId,
      userEmail,
      place,
      hotel,
      date,
      name,
      email,
      phone,
      status: 'pending',
      created: new Date(),
      updated: new Date()
    };

    // Save to Firestore
    const docRef = await db.collection('bookings').add(bookingData);

    // Return success response
    res.status(201).json({
      success: true,
      booking: {
        id: docRef.id,
        ...bookingData,
        created: bookingData.created.toISOString(),
        updated: bookingData.updated.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', verifyJWTToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .get();

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        ...data,
        created: data.created?.toDate ? data.created.toDate().toISOString() : data.created,
        updated: data.updated?.toDate ? data.updated.toDate().toISOString() : data.updated
      });
    });

    // Sort in memory (newest first)
    bookings.sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Cancel a booking (user can only cancel their own)
router.patch('/:bookingId/cancel', verifyJWTToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.uid;

    // Get the booking first
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const booking = bookingDoc.data();

    // Check if user owns this booking or is admin
    if (booking.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to cancel this booking'
      });
    }

    // Update booking status
    await db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      updated: new Date(),
      cancelledBy: req.user.email
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
