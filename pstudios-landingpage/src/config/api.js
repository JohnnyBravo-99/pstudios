// API Configuration
// Supports multiple backend modes via REACT_APP_BACKEND_MODE environment variable
// Modes: 'local', 'production', 'mock'
// Can be overridden with REACT_APP_API_URL

function getApiBaseUrl() {
  // If REACT_APP_API_URL is explicitly set, use it (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Production mode always uses production API
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.paradigmstudios.art';
  }

  // Development mode: check REACT_APP_BACKEND_MODE
  const backendMode = process.env.REACT_APP_BACKEND_MODE || 'local';
  
  switch (backendMode) {
    case 'production':
      return 'https://api.paradigmstudios.art';
    case 'mock':
      return 'http://localhost:3002';
    case 'local':
    default:
      return 'http://localhost:3001';
  }
}

const API_BASE_URL = getApiBaseUrl();

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_BACKEND_MODE: process.env.REACT_APP_BACKEND_MODE,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    API_BASE_URL: API_BASE_URL
  });
}

export default API_BASE_URL;
