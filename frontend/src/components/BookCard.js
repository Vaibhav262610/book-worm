import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, User } from 'lucide-react';

const BookCard = ({ book }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Link
      to={`/books/${book._id}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
          {book.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 flex items-center">
          <User className="h-3 w-3 mr-1" />
          {book.author}
        </p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {renderStars(book.averageRating)}
            <span className="ml-1 text-sm text-gray-600">
              ({book.totalReviews})
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {book.publishedYear}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {book.genre}
          </span>
          
          {book.featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Featured
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BookCard; 