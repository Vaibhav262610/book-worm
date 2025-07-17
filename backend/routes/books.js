const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Book = require('../models/Book');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with pagination, search, and filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('genre').optional().isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Other']).withMessage('Invalid genre'),
  query('sort').optional().isIn(['title', 'author', 'publishedYear', 'averageRating', 'createdAt']).withMessage('Invalid sort field'),
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
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Genre filter
    if (req.query.genre) {
      query.genre = req.query.genre;
    }

    // Sort options
    let sort = {};
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    sort[sortField] = sortOrder;

    // Execute query
    const books = await Book.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'username');

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/featured
// @desc    Get featured books
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredBooks = await Book.find({ featured: true })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(6)
      .populate('addedBy', 'username');

    res.json({ books: featuredBooks });
  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/:id
// @desc    Get a specific book by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'username');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has reviewed this book
    let userReview = null;
    if (req.user) {
      const Review = require('../models/Review');
      userReview = await Review.findOne({
        bookId: book._id,
        userId: req.user._id
      });
    }

    res.json({
      book,
      userReview
    });

  } catch (error) {
    console.error('Get book error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/books
// @desc    Add a new book (admin only)
// @access  Private/Admin
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('author')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author is required and must be less than 100 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('genre')
    .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Other'])
    .withMessage('Invalid genre'),
  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Published year must be valid'),
  body('isbn').optional().isString().withMessage('ISBN must be a string'),
  body('pages').optional().isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
  body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const bookData = {
      ...req.body,
      addedBy: req.user._id
    };

    const book = new Book(bookData);
    await book.save();

    const populatedBook = await book.populate('addedBy', 'username');

    res.status(201).json({
      message: 'Book added successfully',
      book: populatedBook
    });

  } catch (error) {
    console.error('Add book error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book (admin only)
// @access  Private/Admin
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('author').optional().isLength({ min: 1, max: 100 }).withMessage('Author must be less than 100 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('genre').optional().isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Other']).withMessage('Invalid genre'),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Published year must be valid'),
  body('isbn').optional().isString().withMessage('ISBN must be a string'),
  body('pages').optional().isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
  body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book
    });

  } catch (error) {
    console.error('Update book error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book (admin only)
// @access  Private/Admin
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete associated reviews
    const Review = require('../models/Review');
    await Review.deleteMany({ bookId: req.params.id });

    res.json({ message: 'Book deleted successfully' });

  } catch (error) {
    console.error('Delete book error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 