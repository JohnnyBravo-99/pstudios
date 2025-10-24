// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paradigmstudios.art'  // Production API domain with HTTPS
  : process.env.REACT_APP_API_URL || 'http://localhost:3001';  // Backend dev server runs on port 3001

export default API_BASE_URL;
