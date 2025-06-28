#!/bin/bash

echo "Testing API endpoints..."

BASE_URL="https://auth-api-rust-backend.up.railway.app"

echo "1. Testing health endpoint..."
curl -v -X GET "$BASE_URL/health"
echo -e "\n"

echo "2. Testing CORS preflight for register endpoint..."
curl -v -X OPTIONS "$BASE_URL/register" \
  -H "Origin: https://auth-api-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo -e "\n"

echo "3. Testing register endpoint..."
curl -v -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -H "Origin: https://auth-api-frontend.vercel.app" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "testpassword"
  }'
echo -e "\n"

echo "4. Testing CORS preflight for login endpoint..."  
curl -v -X OPTIONS "$BASE_URL/login" \
  -H "Origin: https://auth-api-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo -e "\n"