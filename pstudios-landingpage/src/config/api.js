// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://212.38.95.123:3000'  // VPS IP address with HTTPS
  : process.env.REACT_APP_API_URL || 'http://localhost:3000';  // Backend runs on port 3000

export default API_BASE_URL;
