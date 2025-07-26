# HireHour Backend Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git repository set up
- Database (PostgreSQL) ready

## Deployment Options

### Option 1: Railway (Recommended)

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   - Go to your Railway dashboard
   - Add all variables from `env.example`
   - Set `NODE_ENV=production`

4. **Add PostgreSQL Database**
   - In Railway dashboard, add PostgreSQL service
   - Copy the DATABASE_URL to your environment variables

### Option 2: Render

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository

2. **Create Web Service**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node

3. **Set Environment Variables**
   - Add all variables from `env.example`

4. **Add PostgreSQL Database**
   - Create PostgreSQL service in Render
   - Link it to your web service

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from heroku.com
   ```

2. **Deploy**
   ```bash
   # Login
   heroku login
   
   # Create app
   heroku create hirehour-backend
   
   # Add PostgreSQL
   heroku addons:create heroku-postgresql:mini
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   # ... add all other variables
   
   # Deploy
   git push heroku main
   ```

## Environment Variables

Make sure to set these environment variables in your hosting platform:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

# Server
PORT=5000
NODE_ENV=production

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@hirehour.com"

# Firebase
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

# CORS
CORS_ORIGIN="https://your-frontend-domain.com"
```

## Database Setup

After deployment, run database migrations:

```bash
# For Railway
railway run npm run db:migrate

# For Render
# Add to build command: npm run db:migrate

# For Heroku
heroku run npm run db:migrate
```

## Health Check

Your API will be available at:
- Health check: `https://your-domain.com/health`
- API base: `https://your-domain.com/api/v1`

## Troubleshooting

1. **Build fails**: Check Node.js version compatibility
2. **Database connection fails**: Verify DATABASE_URL format
3. **CORS errors**: Update CORS_ORIGIN with your frontend domain
4. **JWT errors**: Ensure JWT_SECRET is set correctly

## Monitoring

- Railway: Built-in monitoring dashboard
- Render: Built-in logs and metrics
- Heroku: Use `heroku logs --tail` for real-time logs 