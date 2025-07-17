import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Star, BookOpen, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      favoriteGenres: user?.favoriteGenres || []
    }
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [statsResponse, reviewsResponse] = await Promise.all([
        axios.get(`/api/users/${user._id}/stats`),
        axios.get(`/api/users/${user._id}/reviews`)
      ]);

      setUserStats(statsResponse.data.stats);
      setUserReviews(reviewsResponse.data.reviews);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const response = await axios.put(`/api/users/${user._id}`, data);
      updateUser(response.data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Other'
  ];

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {new Date(user.memberSince).toLocaleDateString()}
                  </p>
                </div>

                {/* Stats */}
                {userStats && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700">Reviews</span>
                      </div>
                      <span className="font-semibold">{userStats.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-700">Avg Rating</span>
                      </div>
                      <span className="font-semibold">{userStats.averageRating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Helpful Votes</span>
                      </div>
                      <span className="font-semibold">{userStats.totalHelpful}</span>
                    </div>
                  </div>
                )}

                {/* Favorite Genres */}
                {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Favorite Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.favoriteGenres.map((genre) => (
                        <span
                          key={genre}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {user.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Bio</h3>
                    <p className="text-sm text-gray-700">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Edit Profile */}
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-secondary"
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        {...register('username', {
                          required: 'Username is required',
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters'
                          },
                          maxLength: {
                            value: 30,
                            message: 'Username must be less than 30 characters'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Username can only contain letters, numbers, and underscores'
                          }
                        })}
                        className="input"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="input"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register('bio', {
                          maxLength: {
                            value: 500,
                            message: 'Bio must be less than 500 characters'
                          }
                        })}
                        rows={3}
                        className="input"
                        placeholder="Tell us about yourself..."
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                      )}
                    </div>

                    {/* Favorite Genres */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favorite Genres
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {genres.map((genre) => (
                          <label key={genre} className="flex items-center">
                            <input
                              type="checkbox"
                              value={genre}
                              {...register('favoriteGenres')}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{genre}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Saving...</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-gray-900">{user.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-gray-900">{user.email}</p>
                    </div>
                    {user.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-gray-900">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reviews</h3>
                
                {userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <img
                              src={review.bookId.coverImage}
                              alt={review.bookId.title}
                              className="w-12 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/48x64?text=No+Cover';
                              }}
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">{review.bookId.title}</h4>
                              <p className="text-sm text-gray-600">by {review.bookId.author}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{review.review}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    You haven't written any reviews yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 