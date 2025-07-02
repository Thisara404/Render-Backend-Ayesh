const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  photographer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a package name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a package description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration'],
  },
  includes: [{
    type: String,
    required: [true, 'Please add at least one inclusion']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Limit packages to 3 per photographer
PackageSchema.statics.checkPackageLimit = async function(photographerId) {
  const count = await this.countDocuments({ photographer: photographerId });
  return count < 3;
};

module.exports = mongoose.model('Package', PackageSchema);