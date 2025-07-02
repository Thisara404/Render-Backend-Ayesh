const express = require('express');
const { getUsers, getPhotographers } = require('../controllers/userController');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getAllUsers, 
  getUserById, 
  createUser,
  updateUser, 
  deleteUser 
} = require('../controllers/adminController');

// All these routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

  // User and photographer routes
router.get('/users', getUsers);
router.get('/photographers', getPhotographers);

module.exports = router;