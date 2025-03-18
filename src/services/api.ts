
import axios from 'axios';

// Use environment variable if available, otherwise use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; 

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
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
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // For development - if no API is running, fallback to mock data
    if (!error.response) {
      console.log('No API response - fallback to mock data');
      // This will be handled in the catch block of the services
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.log('Login API failed, using dev mode');
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.log('Get current user API failed, using dev mode');
      throw error;
    }
  },
  changePassword: async (userId: number, currentPassword: string, newPassword: string) => {
    const response = await api.put(`/users/${userId}/change-password`, {
      currentPassword, 
      newPassword
    });
    return response.data;
  }
};

// User management services
export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  update: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// City/Zone management services
export const zoneService = {
  getAll: async () => {
    try {
      const response = await api.get('/cities');
      return response.data;
    } catch (error) {
      console.log('Get cities API failed, using development data');
      // Return mock data for development
      return [
        { id: 1, name: 'Karachi', status: null, comment: '', concernId: 'KHI001' },
        { id: 2, name: 'Lahore', status: null, comment: '', concernId: 'LHR001' },
        { id: 3, name: 'Islamabad', status: null, comment: '', concernId: 'ISB001' },
      ];
    }
  },
  create: async (zoneName: string) => {
    const response = await api.post('/cities', { name: zoneName });
    return response.data;
  },
  updateStatus: async (cityId: number, status: string, comment: string) => {
    const response = await api.post('/status-update', { 
      city_id: cityId, 
      status, 
      comment,
      updated_by: JSON.parse(localStorage.getItem('currentUser') || '{}').id
    });
    return response.data;
  },
  getStatusHistory: async (cityId: number) => {
    const response = await api.get(`/status-history/${cityId}`);
    return response.data;
  }
};

// Task management services
export const taskService = {
  getAll: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.log('Get tasks API failed, using development data');
      // Return mock data for development
      return [
        {
          id: 1,
          title: 'Daily Excel Update',
          description: 'Update the daily reporting Excel sheet with today\'s metrics',
          createdBy: 1,
          createdAt: new Date().toISOString(),
          status: 'pending',
          assignedZones: ['KHI001', 'LHR001'],
        },
        {
          id: 2,
          title: 'Monthly Report',
          description: 'Submit the monthly performance report',
          createdBy: 1,
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'updated',
          assignedZones: ['ISB001'],
        }
      ];
    }
  },
  create: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  update: async (id: number, taskData: any) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default api;
