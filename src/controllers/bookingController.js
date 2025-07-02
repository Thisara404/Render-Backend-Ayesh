const Booking = require('../models/Booking');
const User = require('../models/User');
const Package = require('../models/Package');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    
    // Add user id to req.body
    req.body.user = req.user.id;
    
    // Validate photographer exists
    const photographer = await User.findById(req.body.photographer);
    if (!photographer || photographer.role !== 'photographer') {
      return res.status(400).json({
        success: false,
        message: 'Selected photographer not found'
      });
    }
    
    // Validate package exists
    const package = await Package.findById(req.body.package);
    if (!package) {
      return res.status(400).json({
        success: false,
        message: 'Selected package not found'
      });
    }
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    console.log('Booking created:', booking);
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create booking'
    });
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/user
// @access  Private/User
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('photographer', 'fullName')
      .populate('package', 'name price duration')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch bookings'
    });
  }
};

// @desc    Get all bookings for logged-in photographer
// @route   GET /api/bookings/photographer
// @access  Private/Photographer
exports.getPhotographerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ photographer: req.user.id })
      .populate('user', 'fullName')
      .populate('package', 'name price duration')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching photographer bookings:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch bookings'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Photographer or Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Find booking
    let booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is the booking's photographer
    if (req.user.role === 'photographer' && booking.photographer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // Update booking status
    booking.status = status;
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update booking status'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/User
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find booking
    let booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking is already cancelled or completed
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to cancel booking'
    });
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'fullName')
      .populate('photographer', 'fullName')
      .populate('package', 'name price')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch bookings'
    });
  }
};