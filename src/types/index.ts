
export interface User {
  id: number;
  username: string;
  password: string;
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
  createdAt: string;
  dueDate?: string;
  status: 'pending' | 'completed';
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
  status: 'pending' | 'uploaded' | null;
  comment: string;
  concernId: string;
  updatedBy?: string;
  lastUpdated?: string;
}
