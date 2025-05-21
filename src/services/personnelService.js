import axios from 'axios';

const API_URL = '/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the token in requests
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

const personnelService = {
  getPersonnel: async () => {
    try {
      const response = await api.get('/personnel');
      return response.data;
    } catch (error) {
      console.error('Error fetching personnel:', error);
      throw error;
    }
  }
};

export default personnelService; 