const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getPhotographers,
  getPhotographerById,
  getCategories
} = require("../controllers/userController");

// Public routes
router.get("/photographers", getPhotographers);
router.get("/photographer/:id", getPhotographerById);
router.get("/categories", getCategories);

// Protected routes
router.get("/user-bookings", protect, (req, res) => {
  // Route logic here
});

module.exports = router;
