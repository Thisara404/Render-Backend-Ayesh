const express = require('express');
const { 
  getPhotographerPackages,
  getPublicPackages,
  createPackage,
  updatePackage,
  deletePackage
} = require('../controllers/packageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Photographer routes (protected)
router.route('/')
  .get(protect, authorize('photographer'), getPhotographerPackages)
  .post(protect, authorize('photographer'), createPackage);

router.route('/:id')
  .put(protect, authorize('photographer'), updatePackage)
  .delete(protect, authorize('photographer'), deletePackage);

// Public routes
router.get('/photographer/:photographerId', getPublicPackages);

module.exports = router;