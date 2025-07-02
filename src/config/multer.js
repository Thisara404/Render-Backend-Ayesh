const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Setup storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = createUploadDir('./public/uploads/portfolio');
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique file name
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Supported formats: jpeg, jpg, png, webp'));
  }
};

module.exports = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 10MB max file size
  fileFilter: fileFilter
});