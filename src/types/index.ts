
export interface User {
  id: number;
  username: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'user';
  concernId: string;
  email?: string;
  lastLogin?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  createdBy: number; // admin ID
  createdByUsername?: string; // admin username
  createdAt: string;
  dueDate?: string;
  status: 'pending' | 'updated';
  assignedZones: string[]; // array of concernIds
  comments?: TaskComment[];
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface Zone {
  id: number;
  name: string;
  status: 'pending' | 'updated' | 'uploaded' | null;
  comment: string;
  concernId: string;
  updatedBy?: string;
  lastUpdated?: string;
}

export interface TaskReport {
  date: string;
  pending: number;
  updated: number;
  total: number;
}

export interface ZonePerformance {
  zoneName: string;
  concernId: string;
  totalTasks: number;
  completedTasks: number;
}
