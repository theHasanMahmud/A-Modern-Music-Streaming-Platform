# 🚀 SoundScape Deployment Guide

This guide will help you deploy your SoundScape music streaming platform to **Vercel** (frontend) and **Render** (backend).

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] GitHub repository with your code
- [ ] MongoDB Atlas database
- [ ] Cloudinary account for media storage
- [ ] Clerk account for authentication
- [ ] Vercel account
- [ ] Render account

## 🎯 Deployment Architecture

```
Frontend (Vercel) ←→ Backend (Render) ←→ MongoDB Atlas
     ↓                    ↓                    ↓
  React App          Node.js API         Database
  Static Files       Socket.io           Cloudinary
```

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Render

1. **Create a new Web Service on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure the service:**
   - **Name**: `soundscape-backend`
   - **Environment**: `Node`
   - **Root Directory**: `Amar_Gaan/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### Step 2: Set Environment Variables in Render

Add these environment variables in your Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_EMAIL=your_admin_email@example.com
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Step 3: Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://soundscape-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Vercel

1. **Create a new project on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `Amar_Gaan/frontend` folder as the root directory

### Step 2: Configure Vercel Settings

1. **Framework Preset**: Vite
2. **Root Directory**: `Amar_Gaan/frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Set Environment Variables in Vercel

Add these environment variables in your Vercel dashboard:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Step 4: Deploy Frontend

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL (e.g., `https://soundscape-frontend.vercel.app`)

## 🔄 Update Backend CORS Settings

After getting your Vercel URL, update the backend CORS settings:

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Add a new environment variable:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```

5. Update your backend code to use this environment variable in CORS settings.

## 🗄️ Database Setup

### MongoDB Atlas Configuration

1. **Create a MongoDB Atlas cluster:**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string

2. **Configure network access:**
   - Add `0.0.0.0/0` to allow connections from anywhere
   - Or add specific IP addresses for better security

3. **Create database user:**
   - Create a user with read/write permissions
   - Use the credentials in your connection string

### Seed the Database

After deployment, you can seed your database by running:

```bash
# Connect to your Render service and run:
npm run seed:all
```

## ☁️ Cloudinary Setup

1. **Create Cloudinary account:**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account

2. **Get credentials:**
   - Go to Dashboard
   - Copy your Cloud Name, API Key, and API Secret

3. **Configure upload presets:**
   - Set up upload presets for different file types
   - Configure image transformations if needed

## 🔐 Clerk Authentication Setup

1. **Create Clerk application:**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application

2. **Configure domains:**
   - Add your Vercel domain to allowed origins
   - Add your Render domain to allowed origins

3. **Get API keys:**
   - Copy Publishable Key and Secret Key
   - Use them in your environment variables

## 🔍 Testing Your Deployment

### Health Check

Test your backend deployment:
```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SoundScape Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Frontend Test

1. Visit your Vercel URL
2. Check if the app loads correctly
3. Test authentication
4. Test API connections

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Make sure your frontend URL is added to backend CORS settings
   - Check that environment variables are set correctly

2. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Build Failures:**
   - Check build logs in Vercel/Render
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

4. **Environment Variables:**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify values are correct

### Debug Commands

```bash
# Check backend logs in Render
# Go to Render dashboard → Your service → Logs

# Check frontend build logs in Vercel
# Go to Vercel dashboard → Your project → Functions tab
```

## 📊 Monitoring

### Render Monitoring
- Check service health in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring
- Monitor build performance
- Check function execution logs
- Monitor bandwidth usage

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:
- Push to your main branch triggers automatic deployment
- Pull requests can trigger preview deployments
- Configure branch protection rules for production

## 💰 Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Vercel**: 100GB bandwidth/month, unlimited static sites
- **MongoDB Atlas**: 512MB storage
- **Cloudinary**: 25GB storage, 25GB bandwidth

### Upgrade Considerations
- **Render Pro**: $7/month for always-on service
- **Vercel Pro**: $20/month for better performance
- **MongoDB Atlas**: $9/month for better performance

## 🎉 Success!

Once deployed, your SoundScape platform will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.onrender.com`

Share your music streaming platform with the world! 🎵

---

## 📞 Support

If you encounter issues:
1. Check the logs in both platforms
2. Verify all environment variables
3. Test API endpoints individually
4. Check CORS and network settings

Happy deploying! 🚀
