const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  photographer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      caption: String,
      isFeatured: {
        type: Boolean,
        default: false
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  category: {
    type: String,
    enum: ['portrait', 'wedding', 'family', 'event', 'commercial', 'fashion', 'product', 'landscape', 'travel', 'corporate'],
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);