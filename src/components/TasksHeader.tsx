
import React from 'react';
import TaskManagement from '@/components/TaskManagement';
import { Badge } from '@/components/ui/badge';
import { User, UserCheck, UserCog } from 'lucide-react';
import type { Zone, Task } from '@/types';

interface TasksHeaderProps {
  canCreateTasks: boolean;
  zones: Zone[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({ 
  canCreateTasks, 
  zones, 
  onTaskCreate 
}) => {
  // Get user role from localStorage
  const getUserRole = (): 'superadmin' | 'admin' | 'user' | null => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role;
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    return null;
  };

  const userRole = getUserRole();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Task Management</h1>
          <Badge 
            variant="outline"
            className={
              userRole === 'superadmin' ? "bg-purple-100 text-purple-800 border-purple-300" :
              userRole === 'admin' ? "bg-blue-100 text-blue-800 border-blue-300" :
              "bg-green-100 text-green-800 border-green-300"
            }
          >
            {userRole === 'superadmin' && (
              <UserCog className="h-3 w-3 mr-1" />
            )}
            {userRole === 'admin' && (
              <UserCheck className="h-3 w-3 mr-1" />
            )}
            {userRole === 'user' && (
              <User className="h-3 w-3 mr-1" />
            )}
            {userRole === 'superadmin' ? 'Super Admin' : 
             userRole === 'admin' ? 'Admin' : 'Zone User'}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {userRole === 'superadmin' 
            ? "Manage all tasks, users, and zones with full system access" 
            : userRole === 'admin'
            ? "Create and assign tasks to zones" 
            : "View and respond to tasks assigned to your zone"}
        </p>
      </div>
      {canCreateTasks && zones.length > 0 && (
        <TaskManagement zones={zones} onTaskCreate={onTaskCreate} />
      )}
      {canCreateTasks && zones.length === 0 && (
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <p>No zones available. Please add zones first.</p>
        </div>
      )}
    </div>
  );
};

export default TasksHeader;
