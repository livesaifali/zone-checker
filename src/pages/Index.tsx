
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import TaskList from '@/components/TaskList';
import TaskManagement from '@/components/TaskManagement';
import ZoneStats from '@/components/ZoneStats';
import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import type { Task, Zone, User } from '@/types';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
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
    setFilteredTasks(mockTasks);

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  // Filter tasks based on search term and user permission
  useEffect(() => {
    if (!tasks.length) return;
    
    let filtered = [...tasks];
    
    // Apply search filter if term exists
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // If user is not admin or superadmin, only show tasks assigned to their zone
    if (currentUser && currentUser.role === 'user') {
      filtered = filtered.filter(task => 
        task.assignedZones.includes(currentUser.concernId)
      );
    }
    
    setFilteredTasks(filtered);
  }, [searchTerm, tasks, currentUser]);

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
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);

    toast({
      title: "Task created",
      description: `Task "${newTask.title}" has been assigned to ${newTask.assignedZones.length} zone(s)`,
    });
  };

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'updated') => {
    if (!currentUser) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks.filter(task => 
      searchTerm ? 
        (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         task.description.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
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

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const comments = task.comments ? [...task.comments, newComment] : [newComment];
        return { ...task, comments };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks.filter(task => 
      searchTerm ? 
        (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         task.description.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
    ));
    
    toast({
      title: "Comment saved",
      description: "Your comment has been added to the task",
    });
  };

  const handleDeleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks.filter(task => 
      searchTerm ? 
        (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         task.description.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
    ));
    
    toast({
      title: "Task deleted",
      description: "The task has been removed",
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Determine user role and permissions
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const canCreateTasks = isSuperAdmin || isAdmin;

  // Calculate task stats
  const totalTasks = filteredTasks.length;
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending').length;
  const updatedTasks = filteredTasks.filter(task => task.status === 'updated').length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Task Management</h1>
              <p className="text-muted-foreground mt-1">
                {canCreateTasks 
                  ? "Create and assign tasks to zones" 
                  : "View and respond to tasks assigned to your zone"}
              </p>
            </div>
            {canCreateTasks && (
              <Button 
                className="transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('create-task-btn')?.click()}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search tasks..." 
              className="pl-9 backdrop-blur-sm bg-white/80"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        
        {filteredTasks.length > 0 && (
          <ZoneStats 
            totalZones={totalTasks}
            pendingZones={pendingTasks}
            uploadedZones={updatedTasks}
          />
        )}
        
        {filteredTasks.length === 0 && (
          <EmptyState 
            onAddZone={() => document.getElementById('create-task-btn')?.click()} 
            isAdmin={canCreateTasks} 
          />
        )}
        
        {filteredTasks.length > 0 && (
          <TaskList 
            tasks={filteredTasks}
            userConcernId={currentUser?.concernId}
            onStatusUpdate={handleTaskStatusUpdate}
            onCommentUpdate={handleTaskCommentUpdate}
            onDeleteTask={canCreateTasks ? handleDeleteTask : undefined}
            isUser={currentUser?.role === 'user'}
            isAdmin={isAdmin || isSuperAdmin}
          />
        )}
        
        {/* This is hidden but we'll use it to trigger the create task dialog */}
        <div className="hidden">
          <TaskManagement 
            zones={zones} 
            onTaskCreate={handleTaskCreate} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
