const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://render-frontend-ayesh.onrender.com'],
  credentials: true
}));

// Route files
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const portfolioRoutes = require('./src/routes/portfolioRoutes');
const userRoutes = require('./src/routes/userRoutes'); // Add the user routes
const packageRoutes = require('./src/routes/packageRoutes'); // Add package routes
const bookingRoutes = require('./src/routes/bookingRoutes'); // Add booking routes
const photographerRoutes = require('./src/routes/photographerRoutes'); // Add photographer routes

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'public', 'uploads', 'portfolio');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Make the 'public' folder accessible for static files
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));
app.use('/uploads', express.static('public/uploads')); // Serve uploaded files

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api', userRoutes); // Mount the user routes
app.use('/api/packages', packageRoutes); // Mount package routes
app.use('/api/bookings', bookingRoutes); // Mount booking routes
app.use('/api/photographers', photographerRoutes); // Mount photographer routes

// Add basic route for testing API health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Static files: http://localhost:${PORT}/uploads`);
});