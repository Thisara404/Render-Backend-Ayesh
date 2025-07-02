const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// @desc    Create new portfolio collection
// @route   POST /api/portfolio
// @access  Private/Photographer
exports.createPortfolio = async (req, res) => {
  try {
    console.log("Creating portfolio with data:", req.body);
    // Add photographer (user) id to req.body
    req.body.photographer = req.user.id;
    
    // Create portfolio
    const portfolio = await Portfolio.create(req.body);
    
    console.log("Portfolio created:", portfolio);
    res.status(201).json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error("Error creating portfolio:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create portfolio collection'
    });
  }
};

// @desc    Upload images to portfolio
// @route   POST /api/portfolio/:id/images
// @access  Private/Photographer
exports.uploadPortfolioImages = async (req, res) => {
  try {
    console.log("Uploading images to portfolio:", req.params.id);
    const portfolio = await Portfolio.findById(req.params.id);
    
    // Check if portfolio exists
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    // Make sure user is portfolio owner
    if (portfolio.photographer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this portfolio'
      });
    }
    
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }
    
    console.log("Files received:", req.files.length);
    
    // Process and add images
    const uploadedImages = [];
    
    for (const file of req.files) {
      // Create image path relative to server root for database storage
      const imagePath = `/uploads/portfolio/${file.filename}`;
      
      // Add image to portfolio
      portfolio.images.push({
        url: imagePath,
        caption: file.originalname,
        isFeatured: portfolio.images.length === 0 // Make first image the featured one
      });
      
      uploadedImages.push(imagePath);
    }
    
    // Save updated portfolio
    await portfolio.save();
    
    console.log("Images added to portfolio:", uploadedImages);
    res.status(200).json({
      success: true,
      data: portfolio,
      uploadedImages
    });
  } catch (err) {
    console.error("Error uploading images:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload images'
    });
  }
};

// @desc    Get all portfolios for a photographer
// @route   GET /api/portfolio
// @access  Private/Photographer
exports.getPhotographerPortfolios = async (req, res) => {
  try {
    // Find all portfolios where photographer is the logged in user
    const portfolios = await Portfolio.find({ photographer: req.user.id }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (err) {
    console.error("Error fetching portfolios:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch portfolios'
    });
  }
};

// @desc    Get public portfolios for a specific photographer
// @route   GET /api/portfolio/photographer/:photographerId
// @access  Public
exports.getPublicPortfolios = async (req, res) => {
  try {
    const { photographerId } = req.params;
    console.log("Fetching public portfolios for photographer:", photographerId);
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(photographerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photographer ID format'
      });
    }
    
    const query = { 
      photographer: photographerId,
      isPublished: true
    };
    
    const portfolios = await Portfolio.find(query).sort('-createdAt');
    
    console.log(`Found ${portfolios.length} public portfolios`);
    
    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (err) {
    console.error("Error fetching public portfolios:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch portfolios'
    });
  }
};

// @desc    Delete portfolio image
// @route   DELETE /api/portfolio/:id/images/:imageId
// @access  Private/Photographer
exports.deletePortfolioImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    // Find portfolio
    const portfolio = await Portfolio.findById(id);
    
    // Check if portfolio exists
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    // Make sure user is portfolio owner
    if (portfolio.photographer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this portfolio'
      });
    }
    
    // Find image in portfolio
    const imageIndex = portfolio.images.findIndex(img => img._id.toString() === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in portfolio'
      });
    }
    
    // Get image path to delete the file from disk
    const imagePath = portfolio.images[imageIndex].url;
    const fullPath = path.join(__dirname, '../../public', imagePath);
    
    // Try to delete physical file (don't fail if file doesn't exist on disk)
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn("Failed to delete image file:", err);
      // Continue with database removal even if file deletion fails
    }
    
    // Remove image from portfolio
    portfolio.images.splice(imageIndex, 1);
    
    // If we removed the featured image, set another one as featured
    if (portfolio.images.length > 0 && !portfolio.images.some(img => img.isFeatured)) {
      portfolio.images[0].isFeatured = true;
    }
    
    // Save updated portfolio
    await portfolio.save();
    
    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete image'
    });
  }
};