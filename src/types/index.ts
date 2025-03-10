
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
