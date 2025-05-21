import axios from 'axios';

// TypeScript type definitions
/**
 * @typedef {Object} Asset
 * @property {string} asset_id
 * @property {string} type_id
 * @property {string} type_name
 * @property {string} base_id
 * @property {string} status
 */

/**
 * @typedef {Object} EquipmentType
 * @property {string} type_id
 * @property {string} type_name
 * @property {string} category
 */

/**
 * @typedef {Object} Base
 * @property {string} base_id
 * @property {string} base_name
 * @property {string} location
 */

// Use a relative URL for API requests to leverage the Vite proxy
const API_URL = '/api';
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to handle cookies if needed
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.config.method.toUpperCase()}] ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    console.error('Request details:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      // We're intentionally not handling 401 errors globally to prevent automatic logout
      // This is a security feature requested by the user - session should only be cleared on page refresh
      // Individual components will handle their own authentication errors
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Server might be down or CORS issues.');
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    try {
      console.log('Attempting login with:', { username });
      
      // Add more detailed logging
      console.log('API URL:', API_URL);
      console.log('Full login URL:', `${API_URL}/auth/login`);
      
      // Make sure we're sending the right data format
      const loginData = {
        username: username.trim(),
        password: password
      };
      
      console.log('Sending login data:', loginData);
      
      // Remove the duplicate /api prefix
      const response = await api.post('/auth/login', loginData);
      console.log('Login response:', response.data);
      
      // Validate response data
      if (!response.data || !response.data.token || !response.data.user) {
        console.error('Invalid login response format:', response.data);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      const { token, user } = response.data;
      
      // Store token separately from user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Provide more specific error messages based on status code
        if (error.response.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else if (error.response.status === 401) {
          throw new Error('Invalid username or password.');
        } else if (error.response.status === 404) {
          throw new Error('Login service not found. Please check server configuration.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      }
      
      // If we get here, it's another type of error
      throw error;
    }
  },
  signup: async (userData) => {
    try {
      // Remove the duplicate /api prefix
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Signup error details:', error.response?.data || error.message);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  verifyToken: async (token) => {
    try {
      // Remove the duplicate /api prefix
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.user;
    } catch (error) {
      console.error('Token verification error:', error.response?.data || error.message);
      throw error;
    }
  }
};

/**
 * @typedef {Object} AssetService
 * @property {() => Promise<Asset[]>} getAssets - Get all assets
 * @property {(id: string) => Promise<Asset>} getAssetById - Get asset by ID
 * @property {() => Promise<EquipmentType[]>} getEquipmentTypes - Get all equipment types
 */

/** @type {AssetService} */
export const assetService = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
  getEquipmentTypes: async () => {
    const response = await api.get('/equipment-types');
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
  getMetrics: async (baseId, startDate, endDate, typeId) => {
    const response = await api.get('/dashboard/metrics', {
      params: { base_id: baseId, start_date: startDate, end_date: endDate, type_id: typeId },
    });
    return response.data;
  },
};

export const purchaseService = {
  addPurchase: async (purchaseData) => {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  },
  getPurchases: async () => {
    const response = await api.get('/purchases');
    return response.data;
  },
};

export const transferService = {
  addTransfer: async (transferData) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  },
  getTransfers: async () => {
    try {
      const response = await api.get('/transfers');
      console.log('Transfers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  },
};

export const assignmentService = {
  addAssignment: async (assignmentData) => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },
  getAssignments: async () => {
    try {
      const response = await api.get('/assignments');
      console.log('Assignments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  },
};

export const personnelService = {
  getPersonnel: async () => {
    const response = await api.get('/personnel');
    return response.data;
  },
};

export default api; 