
import React from 'react';
import TaskManagement from '@/components/TaskManagement';
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
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Task Management</h1>
        <p className="text-muted-foreground">
          {canCreateTasks 
            ? "Create and assign tasks to zones" 
            : "View and respond to tasks assigned to your zone"}
        </p>
      </div>
      {canCreateTasks && <TaskManagement zones={zones} onTaskCreate={onTaskCreate} />}
    </div>
  );
};

export default TasksHeader;
