import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // CRITICAL: Sends cookies with every request
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Just logs requests (no token management needed)
api.interceptors.request.use(
  (config) => {
    // Cookie is automatically sent with each request due to withCredentials: true
    // No need to manually add Authorization header
    
    // Optional: Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handles errors globally
api.interceptors.response.use(
  (response) => {
    // Optional: Log successful responses
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 Unauthorized - session expired or invalid
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - redirecting to login');
      
      // Clear any stored user data
      localStorage.removeItem('user');
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && 
          !currentPath.includes('/register') &&
          currentPath !== '/') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;