const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Get all users with role 'user'
    const users = await User.find({ role: 'user' }).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all photographers with filters
// @route   GET /api/photographers
// @access  Public
exports.getPhotographers = async (req, res) => {
  try {
    const query = { role: 'photographer' };
    
    // Build filter query
    if (req.query.categories) {
      // Split comma-separated categories
      const categories = req.query.categories.split(',');
      
      // This is the key change - include photographers with either:
      // 1. Matching categories OR
      // 2. No categories at all OR 
      // 3. Empty categories array
      query.$or = [
        { categories: { $in: categories } },
        { categories: { $exists: false } },
        { categories: { $size: 0 } }
      ];
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    
    // Search by name, specialty, or location
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { specialty: searchRegex },
        { location: searchRegex }
      ];
    }
    
    const photographers = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: photographers.length,
      data: photographers
    });
  } catch (error) {
    console.error('Error in getPhotographers:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get photographer by ID
// @route   GET /api/photographer/:id
// @access  Public
exports.getPhotographerById = async (req, res) => {
  try {
    const photographer = await User.findOne({ 
      _id: req.params.id, 
      role: 'photographer' 
    }).select('-password');
    
    if (!photographer) {
      return res.status(404).json({
        success: false,
        error: 'Photographer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: photographer
    });
  } catch (error) {
    console.error('Error in getPhotographerById:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Either fetch from a Category model if you have one
    // Or return a predefined list of categories
    const categories = [
      { name: "portrait", displayName: "Portrait Photography" },
      { name: "wedding", displayName: "Wedding Photography" },
      { name: "family", displayName: "Family Photography" },
      { name: "event", displayName: "Event Photography" },
      { name: "commercial", displayName: "Commercial Photography" },
      { name: "fashion", displayName: "Fashion Photography" },
      { name: "product", displayName: "Product Photography" },
      { name: "landscape", displayName: "Landscape Photography" },
      { name: "travel", displayName: "Travel Photography" },
      { name: "corporate", displayName: "Corporate Photography" }
    ];
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};