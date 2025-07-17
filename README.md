# BookWorm - Book Review Platform

A full-stack book review platform where users can browse books, read and write reviews, and rate books.

## Features

- **Book Browsing**: Browse and search through a collection of books
- **Book Reviews**: Read and write detailed reviews for books
- **Rating System**: Rate books on a 5-star scale
- **User Profiles**: Manage user profiles and review history
- **Responsive Design**: Modern, mobile-friendly UI
- **Admin Features**: Add new books to the platform

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- React Context for state management
- Axios for API communication
- Tailwind CSS for styling
- React Hook Form for form handling

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Express validator for data validation
- CORS for cross-origin requests

## Project Structure

```
bookworm/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
└── README.md         # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup script to create the environment file:
   ```bash
   npm run setup
   ```

4. **Important**: Make sure MongoDB is running on your system. You can:
   - Install MongoDB locally: https://docs.mongodb.com/manual/installation/
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
   - Update the `MONGODB_URI` in the `.env` file if using a different connection string

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Books
- `GET /api/books` - Get all books (with pagination)
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Add a new book (admin only)

### Reviews
- `GET /api/reviews` - Get reviews for a book
- `POST /api/reviews` - Submit a new review

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## Database Schema

### Book Schema
```javascript
{
  title: String,
  author: String,
  description: String,
  coverImage: String,
  genre: String,
  publishedYear: Number,
  averageRating: Number,
  totalReviews: Number
}
```

### Review Schema
```javascript
{
  bookId: ObjectId,
  userId: ObjectId,
  rating: Number,
  review: String,
  createdAt: Date
}
```

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  createdAt: Date
}
```

## Features Implemented

### Frontend
- ✅ Responsive home page with featured books
- ✅ Book listing with search and filter
- ✅ Individual book pages with reviews
- ✅ User profile management
- ✅ Review submission forms
- ✅ State management with React Context
- ✅ Error handling and loading states
- ✅ Modern UI with Tailwind CSS

### Backend
- ✅ RESTful API with Express
- ✅ MongoDB integration with Mongoose
- ✅ JWT authentication
- ✅ Data validation and error handling
- ✅ CORS configuration
- ✅ Proper API documentation

## Usage

1. Start both backend and frontend servers
2. Register a new account or login
3. Browse books and read reviews
4. Submit your own reviews and ratings
5. Manage your profile

## Troubleshooting

### MongoDB Connection Issues
- **Error: "MongoDB connection error"**: Make sure MongoDB is running
  - For local installation: Start MongoDB service
  - For MongoDB Atlas: Check your connection string and network access
- **Error: "Authentication failed"**: Verify your MongoDB credentials in the connection string

### Environment Variables
- **Error: "MONGODB_URI is undefined"**: Run `npm run setup` to create the `.env` file
- **Error: "JWT_SECRET is undefined"**: The setup script generates a secure JWT secret automatically

### Port Conflicts
- **Error: "Port 5000 is already in use"**: Change the PORT in your `.env` file or stop the conflicting service

### Frontend Issues
- **Error: "Proxy error"**: Make sure the backend is running on port 5000
- **Error: "Module not found"**: Run `npm install` in the frontend directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License. 