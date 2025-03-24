
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, User } from '@/types';
import { taskService, zoneService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  // Retry function for queries
  const retryQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['zones'] });
    setErrorDetail(null);
    
    // Show retrying toast
    toast({
      title: "Retrying connection",
      description: "Attempting to reconnect to the server...",
    });
  }, [queryClient, toast]);

  // Fetch tasks from API
  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks,
    error: tasksError,
    isError: isTasksError,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        return await taskService.getAll();
      } catch (error: any) {
        console.error('Failed to load tasks:', error);
        if (error.code === 'ECONNABORTED') {
          setErrorDetail('Connection timeout. The server is taking too long to respond.');
        } else if (!error.response) {
          setErrorDetail('Cannot connect to server. Please check your connection and make sure the backend server is running.');
        } else {
          setErrorDetail(error.message || 'Failed to load tasks');
        }
        throw error;
      }
    },
    enabled: !!currentUser, // Only fetch if user is logged in
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch zones from API
  const { 
    data: zones = [], 
    isLoading: isLoadingZones,
    error: zonesError,
    isError: isZonesError,
  } = useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      try {
        return await zoneService.getAll();
      } catch (error: any) {
        console.error('Failed to load zones:', error);
        if (error.code === 'ECONNABORTED') {
          setErrorDetail('Connection timeout. The server is taking too long to respond.');
        } else if (!error.response) {
          setErrorDetail('Cannot connect to server. Please check your connection and make sure the backend server is running.');
        } else {
          setErrorDetail(error.message || 'Failed to load zones');
        }
        throw error;
      }
    },
    enabled: !!currentUser, // Only fetch if user is logged in
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task created",
        description: "The task has been created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message || "Failed to create the task",
        variant: "destructive",
      });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: (params: { taskId: number, status: 'pending' | 'updated' }) => 
      taskService.updateStatus(params.taskId, params.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task status updated",
        description: "The task status has been updated",
      });
    },
    onError: (error: any) => {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update the task status",
        variant: "destructive",
      });
    },
  });

  // Add task comment mutation
  const addTaskCommentMutation = useMutation({
    mutationFn: (params: { taskId: number, comment: string }) => 
      taskService.addComment(params.taskId, params.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Comment added",
        description: "Your comment has been added to the task",
      });
    },
    onError: (error: any) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: error.message || "Failed to add the comment",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task deleted",
        description: "The task has been removed",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: error.message || "Failed to delete the task",
        variant: "destructive",
      });
    },
  });

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      return;
    }

    // Ensure admin can only create tasks
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      toast({
        title: "Permission denied",
        description: "Only admins can create tasks",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate(taskData);
  };

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'updated') => {
    if (!currentUser) return;
    
    // Check if user has permission to update this task
    if (currentUser.role === 'user' && currentUser.concernId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.assignedZones.includes(currentUser.concernId)) {
        toast({
          title: "Permission denied",
          description: "You can only update tasks assigned to your zone",
          variant: "destructive",
        });
        return;
      }
    }
    
    updateTaskStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleTaskCommentUpdate = (taskId: number, comment: string) => {
    if (!currentUser) return;
    
    // Check if user has permission to comment on this task
    if (currentUser.role === 'user' && currentUser.concernId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.assignedZones.includes(currentUser.concernId)) {
        toast({
          title: "Permission denied",
          description: "You can only comment on tasks assigned to your zone",
          variant: "destructive",
        });
        return;
      }
    }
    
    addTaskCommentMutation.mutate({ taskId, comment });
  };

  const handleDeleteTask = (taskId: number) => {
    if (!currentUser) return;
    
    // Check if user has permission to delete this task
    if (currentUser.role === 'admin') {
      const task = tasks.find(t => t.id === taskId);
      if (!task || task.createdBy !== currentUser.id) {
        toast({
          title: "Permission denied",
          description: "Admins can only delete tasks they created",
          variant: "destructive",
        });
        return;
      }
    } else if (currentUser.role !== 'superadmin') {
      toast({
        title: "Permission denied",
        description: "Only admins and superadmins can delete tasks",
        variant: "destructive",
      });
      return;
    }
    
    deleteTaskMutation.mutate(taskId);
  };

  // Determine user role and permissions
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const canCreateTasks = isSuperAdmin || isAdmin;

  // Check for error
  const isError = isTasksError || isZonesError;
  const error = tasksError || zonesError;

  return {
    currentUser,
    tasks,
    zones,
    isLoadingTasks,
    isLoadingZones,
    isError,
    error,
    errorDetail,
    retryQueries,
    handleTaskCreate,
    handleTaskStatusUpdate,
    handleTaskCommentUpdate,
    handleDeleteTask,
    isSuperAdmin,
    isAdmin,
    canCreateTasks
  };
};
