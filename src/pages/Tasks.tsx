
import React, { useState, useEffect } from 'react';
import TaskManagement from '@/components/TaskManagement';
import TaskList from '@/components/TaskList';
import type { Task, Zone, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockZones: Zone[] = [
      { id: 1, name: 'Karachi', status: null, comment: '', concernId: 'KHI001' },
      { id: 2, name: 'Lahore', status: null, comment: '', concernId: 'LHR001' },
      { id: 3, name: 'Islamabad', status: null, comment: '', concernId: 'ISB001' },
      { id: 4, name: 'Peshawar', status: null, comment: '', concernId: 'PSH001' },
    ];
    setZones(mockZones);

    // Mock tasks data - for testing
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Daily Excel Update',
        description: 'Update the daily reporting Excel sheet with today\'s metrics',
        createdBy: 1, // admin ID
        createdAt: new Date().toISOString(),
        status: 'pending',
        assignedZones: ['KHI001', 'LHR001'],
      },
      {
        id: 2,
        title: 'Monthly Report',
        description: 'Submit the monthly performance report',
        createdBy: 1, // admin ID
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'pending',
        assignedZones: ['ISB001'],
      }
    ];
    setTasks(mockTasks);

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
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      ...taskData,
      id: tasks.length + 1,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);

    toast({
      title: "Task created",
      description: `Task "${newTask.title}" has been assigned to ${newTask.assignedZones.length} zone(s)`,
    });
  };

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'completed') => {
    if (!currentUser) return;
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    toast({
      title: "Task updated",
      description: `Task status has been updated to ${newStatus}`,
    });
  };

  const handleTaskCommentUpdate = (taskId: number, comment: string) => {
    if (!currentUser) return;
    
    // In a real app, you'd update the task comment in your database
    toast({
      title: "Comment saved",
      description: "Your comment has been saved",
    });
  };

  // Determine user role and permissions
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const canCreateTasks = isSuperAdmin || isAdmin;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            {canCreateTasks 
              ? "Create and assign tasks to zones" 
              : "View and respond to tasks assigned to your zone"}
          </p>
        </div>
        {canCreateTasks && <TaskManagement zones={zones} onTaskCreate={handleTaskCreate} />}
      </div>

      <TaskList 
        tasks={tasks} 
        userConcernId={currentUser?.concernId}
        onStatusUpdate={handleTaskStatusUpdate}
        onCommentUpdate={handleTaskCommentUpdate} 
        isUser={!canCreateTasks}
      />
    </div>
  );
};

export default Tasks;
