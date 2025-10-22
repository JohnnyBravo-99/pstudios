// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paradigmstudios.art'  // Production API domain
  : process.env.REACT_APP_API_URL || 'http://localhost:3000';  // Backend runs on port 3000

export default API_BASE_URL;
