const express = require('express');
const { 
  createBooking,
  getUserBookings,
  getPhotographerBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/', protect, authorize('user'), createBooking);
router.get('/user', protect, authorize('user'), getUserBookings);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);

// Photographer routes
router.get('/photographer', protect, authorize('photographer'), getPhotographerBookings);
router.put('/:id', protect, authorize('photographer', 'admin'), updateBookingStatus);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBookings);

module.exports = router;