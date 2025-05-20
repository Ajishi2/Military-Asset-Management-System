import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://military-asset-management-api.onrender.com/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const assetService = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
};

export const baseService = {
  getBases: async () => {
    const response = await api.get('/bases');
    return response.data;
  },
};

export const dashboardService = {
  getMetrics: async (baseId, startDate, endDate) => {
    const response = await api.get('/dashboard/metrics', {
      params: {
        base_id: baseId,
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },
};

export default api; 