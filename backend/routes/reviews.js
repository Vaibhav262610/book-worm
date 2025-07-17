const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews for a book with pagination
// @access  Public
router.get('/', [
  query('bookId').isMongoId().withMessage('Valid book ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('sort').optional().isIn(['helpful', 'rating', 'createdAt']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build sort options
    let sort = {};
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    sort[sortField] = sortOrder;

    // Get reviews with user details
    const reviews = await Review.find({ bookId: req.query.bookId })
      .populate('userId', 'username avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Review.countDocuments({ bookId: req.query.bookId });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Submit a new review
// @access  Private
router.post('/', [
  authenticateToken,
  body('bookId')
    .isMongoId()
    .withMessage('Valid book ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review must be between 10 and 2000 characters'),
  body('spoiler')
    .optional()
    .isBoolean()
    .withMessage('Spoiler must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { bookId, rating, review, spoiler = false } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      bookId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create new review
    const newReview = new Review({
      bookId,
      userId: req.user._id,
      rating,
      review,
      spoiler
    });

    await newReview.save();

    // Update book's average rating
    await book.updateAverageRating();

    // Update user's total reviews count
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalReviews: 1 }
    });

    // Populate user details for response
    const populatedReview = await newReview.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Review submitted successfully',
      review: populatedReview
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review must be between 10 and 2000 characters'),
  body('spoiler')
    .optional()
    .isBoolean()
    .withMessage('Spoiler must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'username avatar');

    // Update book's average rating
    const book = await Book.findById(review.bookId);
    if (book) {
      await book.updateAverageRating();
    }

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const bookId = review.bookId;

    await Review.findByIdAndDelete(req.params.id);

    // Update book's average rating
    const book = await Book.findById(bookId);
    if (book) {
      await book.updateAverageRating();
    }

    // Update user's total reviews count
    const User = require('../models/User');
    await User.findByIdAndUpdate(review.userId, {
      $inc: { totalReviews: -1 }
    });

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful/unhelpful
// @access  Private
router.post('/:id/helpful', [
  authenticateToken,
  body('isHelpful')
    .isBoolean()
    .withMessage('isHelpful must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // User cannot vote on their own review
    if (review.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot vote on your own review' });
    }

    await review.markHelpful(req.user._id, req.body.isHelpful);

    res.json({
      message: 'Vote recorded successfully',
      helpful: review.helpful
    });

  } catch (error) {
    console.error('Helpful vote error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Public
router.get('/user/:userId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId: req.params.userId })
      .populate('bookId', 'title author coverImage')
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId: req.params.userId });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ bookId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews by bookId:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 