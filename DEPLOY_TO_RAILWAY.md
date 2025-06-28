# Deploy to Railway - Quick Guide

## 1. Commit and Push Changes

Make sure all the recent changes are committed and pushed to your repository:

```bash
git add .
git commit -m "Fix CORS configuration for Railway deployment"
git push origin main
```

## 2. Trigger Railway Deployment

If you have auto-deployment enabled, the push should trigger a new deployment automatically.

If not, manually trigger a deployment in the Railway dashboard.

## 3. Environment Variables

Ensure these environment variables are set in Railway:

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure secret key for JWT tokens
- `JWT_SALT` - Exactly 16 characters for password hashing
- `JWT_EXPIRATION` - Token expiration time (e.g., "600" for 10 minutes)
- `PORT` - Railway will set this automatically

## 4. Test After Deployment

1. **Test health endpoint:**

   ```bash
   curl https://auth-api-rust-backend.up.railway.app/health
   ```

2. **Test CORS debug endpoint:**

   ```bash
   curl https://auth-api-rust-backend.up.railway.app/debug/cors
   ```

3. **Test CORS preflight:**

   ```bash
   curl -X OPTIONS https://auth-api-rust-backend.up.railway.app/register \
     -H "Origin: https://auth-api-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

4. **Run the full test script:**

   ```bash
   bash test_api.sh
   ```

## 5. Check Railway Logs

Look for these messages in the Railway logs:

- "Starting Auth API server..."
- "Configuring CORS for production..."
- "Railway environment detected: true"
- "Using production CORS configuration for Railway"
- "CORS configured successfully"
- "Server starting on 0.0.0.0:PORT"

## 6. Expected CORS Response Headers

For OPTIONS requests, you should see:

```plaintext
Access-Control-Allow-Origin: https://auth-api-frontend.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: authorization, content-type, accept, origin
Access-Control-Allow-Credentials: true
```

## Troubleshooting

If CORS still doesn't work:

1. Check Railway logs for errors
2. Verify the deployment completed successfully
3. Test the debug endpoint to see current configuration
4. Ensure the frontend is using the correct backend URL
5. Check that all environment variables are set correctly

## Key Changes Made

- Added Railway port detection (`PORT` environment variable)
- Enhanced CORS configuration with Railway environment detection
- Added debug endpoints for troubleshooting
- Added comprehensive logging
- Created fallback handlers for unmatched routes
