#!/bin/bash

echo "Testing Railway deployed API endpoints..."

BASE_URL="https://auth-api-rust-backend.up.railway.app"
FRONTEND_ORIGIN="https://auth-api-frontend.vercel.app"

echo "1. Testing health endpoint..."
curl -i -X GET "$BASE_URL/health"
echo -e "\n\n"

echo "1.5. Testing CORS debug endpoint..."
curl -i -X GET "$BASE_URL/debug/cors"
echo -e "\n\n"

echo "2. Testing CORS preflight for register endpoint..."
curl -i -X OPTIONS "$BASE_URL/register" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo -e "\n\n"

echo "3. Testing CORS preflight for login endpoint..."  
curl -i -X OPTIONS "$BASE_URL/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo -e "\n\n"

echo "4. Testing register endpoint with CORS..."
curl -i -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -d '{
    "first_name": "Test",
    "last_name": "User",  
    "email": "test@example.com",
    "password": "testpassword"
  }'
echo -e "\n\n"

echo "5. Testing unknown route (fallback)..."
curl -i -X GET "$BASE_URL/nonexistent"
echo -e "\n\n"

echo "6. Testing basic connectivity..."
curl -i --connect-timeout 10 "$BASE_URL/"
echo -e "\n\n"