import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OpenAPI } from './api'

// Configure OpenAPI with the backend URL
OpenAPI.BASE = 'https://auth-api-rust-backend.up.railway.app'
OpenAPI.WITH_CREDENTIALS = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
