const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

// Connect to database
connectDB();

const migrateCategories = async () => {
  try {
    console.log('Starting category migration...');
    
    // Find all photographers without categories
    const photographersToUpdate = await User.find({ 
      role: 'photographer',
      $or: [
        { categories: { $exists: false } },
        { categories: { $size: 0 } }
      ]
    });
    
    console.log(`Found ${photographersToUpdate.length} photographers without categories`);
    
    if (photographersToUpdate.length === 0) {
      console.log('No photographers need category migration.');
      process.exit(0);
    }
    
    // Default general category
    const defaultCategory = ['portrait'];
    
    // Update all photographers without categories
    for (const photographer of photographersToUpdate) {
      photographer.categories = defaultCategory;
      await photographer.save();
      console.log(`Updated photographer: ${photographer.fullName} with default categories`);
    }
    
    console.log('Category migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during category migration:', err);
    process.exit(1);
  }
};

migrateCategories();