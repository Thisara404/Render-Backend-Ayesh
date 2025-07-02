const User = require('../models/User');

// @desc    Update photographer portfolio
// @route   PUT /api/photographer/portfolio
// @access  Private/Photographer
exports.updatePortfolio = async (req, res) => {
  try {
    const { portfolio } = req.body;
    
    if (!portfolio || !Array.isArray(portfolio)) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio should be an array of image URLs'
      });
    }
    
    const user = await User.findById(req.user.id);
    user.portfolio = portfolio;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.portfolio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update photographer availability
// @route   PUT /api/photographer/availability
// @access  Private/Photographer
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    
    if (!availability || typeof availability !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Availability should be an object'
      });
    }
    
    const user = await User.findById(req.user.id);
    user.availability = availability;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get photographer bookings
// @route   GET /api/photographer/bookings
// @access  Private/Photographer
exports.getBookings = async (req, res) => {
  try {
    // This would typically query a Booking model, but for now we'll return a placeholder
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update photographer profile
// @route   PUT /api/photographer/profile
// @access  Private/Photographer
exports.updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse JSON strings if they exist
    if (updateData.categories) {
      updateData.categories = JSON.parse(updateData.categories);
    }
    if (updateData.pricing) {
      updateData.pricing = JSON.parse(updateData.pricing);
    }

    // Add profile image path if uploaded
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const photographer = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!photographer) {
      return res.status(404).json({
        success: false,
        message: 'Photographer not found'
      });
    }

    // Add the full URL for the profile image
    const result = photographer.toObject();
    if (result.profileImage) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      result.profileImage = `${baseUrl}${result.profileImage}`;
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Get all photographers
// @route   GET /api/photographers
// @access  Public
exports.getAllPhotographers = async (req, res) => {
  try {
    const photographers = await User.find({ role: 'photographer' })
      .select('-password')
      .lean();

    // Add full URLs for profile images
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photographersWithUrls = photographers.map(photographer => ({
      ...photographer,
      profileImage: photographer.profileImage ? 
        `${baseUrl}${photographer.profileImage}` : null
    }));

    res.status(200).json({
      success: true,
      data: photographersWithUrls
    });
  } catch (error) {
    console.error('Error fetching photographers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching photographers'
    });
  }
};