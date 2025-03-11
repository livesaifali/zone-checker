
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
      { id: 5, name: 'Hyderabad', status: 'pending', comment: 'Pending review', concernId: 'HYD001' },
      { id: 6, name: 'Sukkur', status: 'updated', comment: 'Updated last week', concernId: 'SUK001' },
      { id: 7, name: 'Quetta', status: 'uploaded', comment: 'All materials uploaded', concernId: 'QTA001' },
      { id: 8, name: 'Multan', status: 'pending', comment: 'Awaiting confirmation', concernId: 'MUL001' },
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
        status: 'updated',
        assignedZones: ['ISB001'],
        comments: [
          {
            id: 1,
            taskId: 2,
            userId: 3,
            userName: 'islamabad',
            comment: 'Report has been updated with latest figures',
            createdAt: new Date().toISOString(),
          }
        ]
      },
      {
        id: 3,
        title: 'Inventory Check',
        description: 'Conduct a physical inventory check and update the inventory system',
        createdBy: 1, // admin ID
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        status: 'updated',
        assignedZones: ['HYD001', 'SUK001'],
      },
      {
        id: 4,
        title: 'Customer Feedback Collection',
        description: 'Collect customer feedback from satisfaction surveys',
        createdBy: 1, // admin ID
        createdAt: new Date().toISOString(),
        status: 'pending',
        assignedZones: ['KHI001', 'LHR001', 'ISB001', 'PSH001'],
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

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'updated') => {
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
    
    const newComment = {
      id: Math.floor(Math.random() * 1000),
      taskId,
      userId: currentUser.id,
      userName: currentUser.username,
      comment,
      createdAt: new Date().toISOString(),
    };

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const comments = task.comments ? [...task.comments, newComment] : [newComment];
        return { ...task, comments };
      }
      return task;
    }));
    
    toast({
      title: "Comment saved",
      description: "Your comment has been added to the task",
    });
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Task deleted",
      description: "The task has been removed",
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
        onDeleteTask={canCreateTasks ? handleDeleteTask : undefined}
        isUser={!canCreateTasks}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Tasks;
