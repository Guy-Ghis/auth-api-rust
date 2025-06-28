#!/bin/bash

echo "=== Testing Current Railway Deployment ==="
echo "This script tests the currently deployed version"
echo "================================================"

BASE_URL="https://auth-api-rust-backend.up.railway.app"
FRONTEND_ORIGIN="https://auth-api-frontend.vercel.app"

echo ""
echo "🔍 1. Testing basic connectivity..."
echo "-----------------------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}, Time: %{time_total}s\n" "$BASE_URL/health" || echo "❌ Health endpoint failed"

echo ""
echo "🔍 2. Testing CORS preflight for /register..."
echo "---------------------------------------------"
response=$(curl -s -i -X OPTIONS "$BASE_URL/register" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

echo "Response headers:"
echo "$response" | head -20

# Check for CORS headers
if echo "$response" | grep -i "access-control-allow-origin" > /dev/null; then
    echo "✅ CORS headers found"
else
    echo "❌ CORS headers missing"
fi

echo ""
echo "🔍 3. Testing CORS preflight for /login..."
echo "------------------------------------------"
response2=$(curl -s -i -X OPTIONS "$BASE_URL/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

echo "Response headers:"
echo "$response2" | head -20

echo ""
echo "🔍 4. Testing unknown route (should return 404 or fallback)..."
echo "-------------------------------------------------------------"
curl -s -i "$BASE_URL/nonexistent" | head -10

echo ""
echo "================================================"
echo "📋 Summary:"
echo "- If you see 'access-control-allow-origin' headers above, CORS is working"
echo "- If you see 404 errors for OPTIONS requests, CORS is not configured"
echo "- If the health endpoint fails, the deployment might be down"
echo "================================================"