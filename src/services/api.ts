
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Update this to your actual backend URL

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

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  changePassword: async (userId: number, currentPassword: string, newPassword: string) => {
    const response = await api.put(`/api/users/${userId}/change-password`, {
      currentPassword, 
      newPassword
    });
    return response.data;
  }
};

// User management services
export const userService = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  create: async (userData: any) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },
  update: async (id: number, userData: any) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  }
};

// City/Zone management services
export const zoneService = {
  getAll: async () => {
    const response = await api.get('/api/cities');
    return response.data;
  },
  create: async (zoneName: string) => {
    const response = await api.post('/api/cities', { name: zoneName });
    return response.data;
  },
  updateStatus: async (cityId: number, status: string, comment: string) => {
    const response = await api.post('/api/update-status', { 
      city_id: cityId, 
      status, 
      comment,
      updated_by: JSON.parse(localStorage.getItem('currentUser') || '{}').id
    });
    return response.data;
  },
  getStatusHistory: async (cityId: number) => {
    const response = await api.get(`/api/status-history/${cityId}`);
    return response.data;
  }
};

// Task management services
export const taskService = {
  getAll: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },
  create: async (taskData: any) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  update: async (id: number, taskData: any) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  }
};

export default api;
