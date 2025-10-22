// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paradigmstudios.art'  // Replace with your actual API domain
  : process.env.REACT_APP_API_URL || 'http://localhost:3001';  // Backend runs on port 3001

export default API_BASE_URL;
