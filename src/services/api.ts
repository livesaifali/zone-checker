
import axios from 'axios';

// Set default API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; 

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Add timeout for better error handling
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
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API Request Timeout:', error);
      return Promise.reject(new Error('Connection timeout. Please check your internet connection and try again.'));
    }
    
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject(new Error('Network error. Please check your internet connection and try again.'));
    }
    
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
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
    const response = await api.get('/cities');
    return response.data;
  },
  create: async (zoneName: string) => {
    const response = await api.post('/cities', { name: zoneName });
    return response.data;
  },
  updateStatus: async (cityId: number, status: string, comment: string) => {
    const response = await api.post('/status-update', { 
      city_id: cityId, 
      status, 
      comment
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
    const response = await api.get('/tasks');
    return response.data;
  },
  create: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/tasks/${id}/status`, { status });
    return response.data;
  },
  addComment: async (id: number, comment: string) => {
    const response = await api.post(`/tasks/${id}/comments`, { comment });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

// Reporting services
export const reportService = {
  getTaskStatusReport: async (timeframe: 'daily' | 'weekly' | '15days' | 'monthly') => {
    const response = await api.get(`/reports/task-status?timeframe=${timeframe}`);
    return response.data;
  },
  getZonePerformanceReport: async () => {
    const response = await api.get('/reports/zone-performance');
    return response.data;
  }
};

export default api;
