const Package = require('../models/Package');
const User = require('../models/User');

// @desc    Get packages for a photographer
// @route   GET /api/packages
// @access  Private/Photographer
exports.getPhotographerPackages = async (req, res) => {
  try {
    console.log('Fetching packages for photographer:', req.user.id);
    const packages = await Package.find({ photographer: req.user.id });
    
    console.log('Found packages:', packages);
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get public packages for a photographer
// @route   GET /api/packages/photographer/:photographerId
// @access  Public
exports.getPublicPackages = async (req, res) => {
  try {
    console.log('Fetching public packages for photographer:', req.params.photographerId);
    const packages = await Package.find({ 
      photographer: req.params.photographerId,
      isActive: true
    });
    
    console.log('Found public packages:', packages);
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Private/Photographer
exports.createPackage = async (req, res) => {
  try {
    console.log('Creating package with data:', req.body);
    // Check if photographer already has 3 packages
    const canAddPackage = await Package.checkPackageLimit(req.user.id);
    
    if (!canAddPackage) {
      return res.status(400).json({
        success: false,
        message: 'You can only create up to 3 packages'
      });
    }
    
    // Add photographer id to request body
    req.body.photographer = req.user.id;
    
    // Create package
    const package = await Package.create(req.body);
    
    console.log('Package created successfully:', package);
    res.status(201).json({
      success: true,
      data: package
    });
  } catch (err) {
    console.error('Error creating package:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create package'
    });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Photographer
exports.updatePackage = async (req, res) => {
  try {
    console.log('Updating package:', req.params.id, 'with data:', req.body);
    let package = await Package.findById(req.params.id);
    
    // Check if package exists
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    // Make sure user is package owner
    if (package.photographer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this package'
      });
    }
    
    // Update package
    package = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    console.log('Package updated successfully:', package);
    res.status(200).json({
      success: true,
      data: package
    });
  } catch (err) {
    console.error('Error updating package:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update package'
    });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Photographer
exports.deletePackage = async (req, res) => {
  try {
    console.log('Deleting package:', req.params.id);
    const package = await Package.findById(req.params.id);
    
    // Check if package exists
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    // Make sure user is package owner
    if (package.photographer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this package'
      });
    }
    
    await package.deleteOne();
    
    console.log('Package deleted successfully');
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting package:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};