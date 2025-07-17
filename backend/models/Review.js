const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean
  }],
  spoiler: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating')) {
    try {
      const Book = mongoose.model('Book');
      const book = await Book.findById(this.bookId);
      if (book) {
        await book.updateAverageRating();
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

reviewSchema.pre('remove', async function(next) {
  try {
    const Book = mongoose.model('Book');
    const book = await Book.findById(this.bookId);
    if (book) {
      await book.updateAverageRating();
    }
  } catch (error) {
    next(error);
  }
  next();
});

reviewSchema.methods.markHelpful = async function(userId, isHelpful) {
  const existingVote = this.helpfulVotes.find(vote => 
    vote.userId.toString() === userId.toString()
  );

  if (existingVote) {
    if (existingVote.isHelpful !== isHelpful) {
      existingVote.isHelpful = isHelpful;
      this.helpful += isHelpful ? 2 : -2;
    }
  } else {
    this.helpfulVotes.push({ userId, isHelpful });
    this.helpful += isHelpful ? 1 : -1;
  }

  return this.save();
};

reviewSchema.statics.getReviewsWithDetails = function(bookId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ bookId })
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema); 