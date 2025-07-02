const express = require('express');
const router = express.Router();
const multer = require('multer');
const { updateProfile, getAllPhotographers } = require('../controllers/photographerController');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/profiles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Profile update route
router.put('/profile', 
  protect, 
  authorize('photographer'), 
  upload.single('profileImage'), 
  updateProfile
);

// Public route to get all photographers
router.get('/', getAllPhotographers);

module.exports = router;