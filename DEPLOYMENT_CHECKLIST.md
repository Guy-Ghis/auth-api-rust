# Deployment Checklist for Railway

## Before Deploying

1. **Ensure all environment variables are set in Railway:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `JWT_SALT` - 16-character salt for password hashing
   - `JWT_EXPIRATION` - Token expiration time in seconds

2. **Verify CORS configuration:**
   - Frontend URL: `https://auth-api-frontend.vercel.app`
   - Backend URL: `https://auth-api-rust-backend.up.railway.app`

## After Deploying

1. **Test health endpoint:**

   ```bash
   curl https://auth-api-rust-backend.up.railway.app/health
   ```

2. **Test CORS preflight:**

   ```bash
   curl -X OPTIONS https://auth-api-rust-backend.up.railway.app/register \
     -H "Origin: https://auth-api-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

3. **Check Railway logs:**
   - Look for startup messages
   - Check for CORS configuration logs
   - Monitor for any errors

## Expected CORS Headers

The server should respond with these headers for preflight requests:

- `Access-Control-Allow-Origin: https://auth-api-frontend.vercel.app`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, content-type, accept`
- `Access-Control-Allow-Credentials: true`

## Troubleshooting

If CORS is still not working:

1. **Check Railway deployment logs**
2. **Verify the app is using port 3000 (Railway default)**
3. **Ensure the domain is correctly configured**
4. **Test with the test script:** `bash test_api.sh`

## Common Issues

- **404 on OPTIONS requests**: CORS layer not applied correctly
- **Missing CORS headers**: Wrong layer order in Axum
- **Database connection**: Check DATABASE_URL environment variable
- **JWT errors**: Verify JWT_SECRET and JWT_SALT are set
