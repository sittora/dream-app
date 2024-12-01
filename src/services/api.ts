import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Oracle API calls
export const oracleApi = {
  async sendMessage(message: string) {
    try {
      const response = await api.post('/api/oracle', { message });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }
};

// Export the api instance as default
export default api;
