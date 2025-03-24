import axios from 'axios';

// Set default API URL - make sure this matches your backend
const API_URL = 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout for slower connections
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
  (response) => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error Details:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('API Request Timeout:', error);
      return Promise.reject(new Error('Connection timeout. Please check your internet connection and try again.'));
    }
    
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject(new Error('Cannot connect to server. Please check your connection and make sure the backend server is running.'));
    }
    
    // Handle authentication errors
    if (error.response.status === 401) {
      // Clear local storage if the token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      // If on a page that requires authentication, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    }
    
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Return a more user-friendly error message
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
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
      console.error('Login error:', error);
      throw error;
    }
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
    console.log('Fetching all tasks...');
    try {
      const response = await api.get('/tasks');
      console.log('Raw tasks data from API:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid tasks data format:', response.data);
        return [];
      }
      
      // Process each task to ensure correct assignedZones format
      const processedTasks = response.data.map(task => {
        console.log(`Processing task ${task.id}:`, task);
        
        let assignedZones = [];
        
        // Handle different possible formats of assignedZones
        if (task.assignedZones) {
          if (Array.isArray(task.assignedZones)) {
            assignedZones = task.assignedZones;
          } else if (typeof task.assignedZones === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(task.assignedZones);
              assignedZones = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If not valid JSON, treat as a single string value
              assignedZones = [task.assignedZones];
            }
          } else {
            // Any other type (number, object, etc.)
            assignedZones = [String(task.assignedZones)];
          }
        }
        
        // Ensure all zone IDs are strings for consistent comparison
        assignedZones = assignedZones.map(zone => String(zone));
        
        console.log(`Task ${task.id} processed assignedZones:`, assignedZones);
        
        return {
          ...task,
          assignedZones
        };
      });
      
      console.log('Processed tasks:', processedTasks);
      return processedTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
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
