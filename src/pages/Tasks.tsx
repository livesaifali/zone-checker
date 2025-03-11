
import React, { useState, useEffect } from 'react';
import TaskManagement from '@/components/TaskManagement';
import TaskList from '@/components/TaskList';
import type { Task, Zone, User } from '@/types';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockZones: Zone[] = [
      { id: 1, name: 'Karachi', status: null, comment: '', concernId: 'KHI001' },
      { id: 2, name: 'Lahore', status: null, comment: '', concernId: 'LHR001' },
      { id: 3, name: 'Islamabad', status: null, comment: '', concernId: 'ISB001' },
      { id: 4, name: 'Peshawar', status: null, comment: '', concernId: 'PSH001' },
    ];
    setZones(mockZones);

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: tasks.length + 1,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage and track tasks across zones</p>
        </div>
        {isAdmin && <TaskManagement zones={zones} onTaskCreate={handleTaskCreate} />}
      </div>

      <TaskList tasks={tasks} userConcernId={currentUser?.concernId} />
    </div>
  );
};

export default Tasks;
