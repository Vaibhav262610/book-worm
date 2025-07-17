# Quick Setup Guide

## Option 1: Interactive Setup (Recommended)
```bash
cd backend
npm run setup
# Follow the prompts to enter your MongoDB URI
```

## Option 2: Manual Setup
1. Create a `.env` file in the `backend` directory
2. Add the following content (replace with your MongoDB URI):

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
```

## MongoDB URI Examples

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/bookworm
```

### Local MongoDB
```
mongodb://localhost:27017/bookworm
```

### Docker MongoDB
```
mongodb://localhost:27017/bookworm
```

## Next Steps
1. Install dependencies: `npm install`
2. Seed the database: `npm run seed`
3. Start the server: `npm run dev`

## Troubleshooting
- If you get connection errors, make sure your MongoDB URI is correct
- For MongoDB Atlas, ensure your IP is whitelisted
- For local MongoDB, make sure the service is running 