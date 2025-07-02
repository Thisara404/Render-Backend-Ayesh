const express = require('express');
const { 
  createPortfolio,
  uploadPortfolioImages,
  getPhotographerPortfolios,
  getPublicPortfolios,
  deletePortfolioImage
} = require('../controllers/portfolioController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// Photographer routes (protected)
router.route('/')
  .post(protect, authorize('photographer'), createPortfolio)
  .get(protect, authorize('photographer'), getPhotographerPortfolios);

router.post(
  '/:id/images',
  protect, 
  authorize('photographer'),
  upload.array('images', 10), // Allow up to 10 images per upload
  uploadPortfolioImages
);

router.delete(
  '/:id/images/:imageId',
  protect,
  authorize('photographer'),
  deletePortfolioImage
);

// Public routes for viewing portfolios
router.get('/photographer/:photographerId', getPublicPortfolios);

module.exports = router;