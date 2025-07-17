import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Calendar, User, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const BookDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchBookDetails();
    fetchReviews();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data.book);
      setUserReview(response.data.userReview);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews?bookId=${id}`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const onSubmitReview = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await axios.post('/api/reviews', {
        bookId: id,
        rating: parseInt(data.rating),
        review: data.review,
        spoiler: data.spoiler || false
      });

      setUserReview(response.data.review);
      setReviews([response.data.review, ...reviews]);
      setShowReviewForm(false);
      reset();
      toast.success('Review submitted successfully!');
      
      // Refresh book details to update average rating
      fetchBookDetails();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpfulVote = async (reviewId, isHelpful) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`, { isHelpful });
      // Refresh reviews to get updated helpful count
      fetchReviews();
      toast.success('Vote recorded!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to record vote';
      toast.error(message);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-600">The book you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Book Details */}
        <div className="card mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Book Cover */}
              <div className="lg:col-span-1">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                  }}
                />
              </div>

              {/* Book Info */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(book.averageRating)}
                    <span className="ml-2 text-gray-600">
                      {book.averageRating.toFixed(1)} ({book.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {book.publishedYear}
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {book.genre}
                  </span>
                  {book.pages && (
                    <span>{book.pages} pages</span>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">{book.description}</p>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {isAuthenticated && !userReview ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="btn-primary"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn-secondary"
                    >
                      {userReview ? 'Edit Review' : 'Write a Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="card mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select
                    {...register('rating', { required: 'Rating is required' })}
                    className="input"
                    defaultValue={userReview?.rating || ''}
                  >
                    <option value="">Select rating</option>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} {rating === 1 ? 'star' : 'stars'}
                      </option>
                    ))}
                  </select>
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    {...register('review', {
                      required: 'Review is required',
                      minLength: {
                        value: 10,
                        message: 'Review must be at least 10 characters'
                      }
                    })}
                    rows={4}
                    className="input"
                    placeholder="Share your thoughts about this book..."
                    defaultValue={userReview?.review || ''}
                  />
                  {errors.review && (
                    <p className="mt-1 text-sm text-red-600">{errors.review.message}</p>
                  )}
                </div>

                {/* Spoiler Warning */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="spoiler"
                    {...register('spoiler')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="spoiler" className="ml-2 text-sm text-gray-700">
                    This review contains spoilers
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Reviews ({book.totalReviews})
            </h3>

            {reviewsLoading ? (
              <LoadingSpinner />
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {review.userId.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {review.spoiler && (
                      <div className="flex items-center space-x-1 text-amber-600 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Contains spoilers</span>
                      </div>
                    )}

                    <p className="text-gray-700 mb-3">{review.review}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      
                      {isAuthenticated && review.userId._id !== user?._id && (
                        <div className="flex items-center space-x-2">
                          <span>Helpful?</span>
                          <button
                            onClick={() => handleHelpfulVote(review._id, true)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review.helpful > 0 ? review.helpful : 0}</span>
                          </button>
                          <button
                            onClick={() => handleHelpfulVote(review._id, false)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Be the first to review this book!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail; 