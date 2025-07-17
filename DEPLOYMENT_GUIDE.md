# Deployment Guide

This guide will help you fix the white screen issue and properly deploy your BookWorm application.

## The Problem

The white screen issue occurs because the frontend is trying to connect to the backend at the wrong URL. In development, it works because both run on localhost, but in production, they need to know each other's URLs.

## Solution

### 1. Backend Deployment (Render)

1. **Deploy your backend to Render** (if not already done)
2. **Note your backend URL** - it will look like: `https://your-app-name.onrender.com`

### 2. Frontend Configuration

#### Option A: Environment Variables (Recommended)

1. **Create a `.env` file in your frontend directory:**

```bash
# In the frontend folder
REACT_APP_API_URL=https://your-backend-app.onrender.com
```

2. **For Vercel deployment:**
   - Go to your Vercel project settings
   - Add environment variable: `REACT_APP_API_URL`
   - Set value to your backend URL: `https://your-backend-app.onrender.com`

#### Option B: Hardcode the URL (Quick Fix)

If you want a quick fix, edit `frontend/src/config/axios.js`:

```javascript
const API_BASE_URL = 'https://your-backend-app.onrender.com';
```

### 3. Backend CORS Configuration

Make sure your backend allows requests from your frontend domain. In `backend/server.js`, update the CORS configuration:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'http://localhost:3000'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

### 4. Environment Variables for Backend

Make sure your backend has these environment variables set in Render:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 5. Redeploy

1. **Frontend (Vercel):**
   - If using environment variables, redeploy after adding them
   - If hardcoding, commit and push your changes

2. **Backend (Render):**
   - Redeploy if you made CORS changes

## Testing

1. **Check browser console** for any errors
2. **Test API endpoints** directly in browser: `https://your-backend.onrender.com/api/health`
3. **Verify environment variables** are loaded correctly

## Common Issues

### CORS Errors
- Make sure your backend CORS configuration includes your frontend domain
- Check that the protocol (http/https) matches

### 404 Errors
- Verify your backend URL is correct
- Check that your backend is actually running on Render

### Environment Variables Not Loading
- In Vercel, make sure environment variables start with `REACT_APP_`
- Redeploy after adding environment variables

## Quick Debugging

1. **Open browser developer tools** (F12)
2. **Check the Console tab** for error messages
3. **Check the Network tab** to see if API requests are being made
4. **Look for CORS errors** or 404 responses

## Example Configuration

### Frontend `.env` file:
```
REACT_APP_API_URL=https://bookworm-backend-123.onrender.com
```

### Backend CORS (server.js):
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://bookworm-frontend.vercel.app', 'http://localhost:3000'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

After making these changes, your white screen issue should be resolved! 