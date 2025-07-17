const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Book = require('./models/Book');
const Review = require('./models/Review');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@bookworm.com',
    password: 'admin123',
    isAdmin: true,
    bio: 'Administrator of BookWorm platform',
    favoriteGenres: ['Fiction', 'Non-Fiction']
  },
  {
    username: 'booklover',
    email: 'booklover@example.com',
    password: 'password123',
    bio: 'Passionate reader and reviewer',
    favoriteGenres: ['Mystery', 'Romance', 'Fantasy']
  },
  {
    username: 'literarycritic',
    email: 'critic@example.com',
    password: 'password123',
    bio: 'Professional book critic and avid reader',
    favoriteGenres: ['Non-Fiction', 'Biography', 'History']
  }
];

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted "gin was the national drink and sex the national obsession."',
    genre: 'Fiction',
    publishedYear: 1925,
    isbn: '978-0743273565',
    pages: 180,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg',
    featured: true
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, addressing issues of race, inequality and segregation with both compassion and humor.',
    genre: 'Fiction',
    publishedYear: 1960,
    isbn: '978-0446310789',
    pages: 281,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg',
    featured: true
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel about totalitarianism and surveillance society, following the life of Winston Smith, a low-ranking member of the ruling Party in London.',
    genre: 'Fiction',
    publishedYear: 1949,
    isbn: '978-0451524935',
    pages: 328,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg',
    featured: true
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'The story follows the main character Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of the British Regency.',
    genre: 'Romance',
    publishedYear: 1813,
    isbn: '978-0141439518',
    pages: 432,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg'
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy novel about the adventures of Bilbo Baggins, a hobbit who embarks on a quest to reclaim the Lonely Mountain from the dragon Smaug.',
    genre: 'Fantasy',
    publishedYear: 1937,
    isbn: '978-0547928241',
    pages: 366,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg'
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    description: 'A mystery thriller novel about a murder in the Louvre Museum and a religious mystery that leads to a trail of clues found in the works of Leonardo da Vinci.',
    genre: 'Mystery',
    publishedYear: 2003,
    isbn: '978-0307474278',
    pages: 689,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621264i/968.jpg'
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    description: 'The biography of Steve Jobs, the co-founder and CEO of Apple Inc., based on more than forty interviews with Jobs conducted over two years.',
    genre: 'Biography',
    publishedYear: 2011,
    isbn: '978-1451648539',
    pages: 656,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg'
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'A groundbreaking narrative of humanity\'s creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human."',
    genre: 'Non-Fiction',
    publishedYear: 2011,
    isbn: '978-0062316097',
    pages: 443,
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420595954i/23692271.jpg'
  }
];

const sampleReviews = [
  {
    rating: 5,
    review: 'An absolute masterpiece! Fitzgerald\'s prose is simply beautiful and the story is both tragic and compelling. The way he captures the essence of the American Dream and its corruption is timeless.',
    spoiler: false
  },
  {
    rating: 4,
    review: 'A powerful and moving story that addresses important themes of justice, racism, and growing up. Scout\'s perspective as a child makes the story even more impactful.',
    spoiler: false
  },
  {
    rating: 5,
    review: 'Disturbing and prophetic. Orwell\'s vision of a totalitarian future is as relevant today as it was when written. A must-read for understanding power and control.',
    spoiler: false
  },
  {
    rating: 4,
    review: 'A delightful romantic comedy of manners. Austen\'s wit and social commentary are brilliant, and the love story between Elizabeth and Darcy is unforgettable.',
    spoiler: false
  },
  {
    rating: 5,
    review: 'A wonderful adventure story that introduces readers to Middle-earth. Tolkien\'s world-building is incredible, and Bilbo\'s journey is both exciting and heartwarming.',
    spoiler: false
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create books
    const createdBooks = [];
    for (const bookData of sampleBooks) {
      const book = new Book({
        ...bookData,
        addedBy: createdUsers[0]._id // Admin user
      });
      await book.save();
      createdBooks.push(book);
      console.log(`Created book: ${book.title}`);
    }

    // Create reviews
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const book = createdBooks[i];
      const user = createdUsers[1 + (i % 2)]; // Alternate between booklover and critic

      const review = new Review({
        bookId: book._id,
        userId: user._id,
        ...reviewData
      });
      await review.save();
      console.log(`Created review for: ${book.title}`);
    }

    // Update book ratings
    for (const book of createdBooks) {
      await book.updateAverageRating();
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdBooks.length} books`);
    console.log(`Created ${sampleReviews.length} reviews`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 