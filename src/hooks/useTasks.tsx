
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, User } from '@/types';
import { taskService, zoneService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  // Fetch tasks from API
  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks,
    error: tasksError
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getAll,
    enabled: !!currentUser, // Only fetch if user is logged in
  });

  // Fetch zones from API
  const { 
    data: zones = [], 
    isLoading: isLoadingZones,
    error: zonesError 
  } = useQuery({
    queryKey: ['zones'],
    queryFn: zoneService.getAll,
    enabled: !!currentUser, // Only fetch if user is logged in
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
    onError: (error) => {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: "Failed to create the task",
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
    onError: (error) => {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating status",
        description: "Failed to update the task status",
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
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: "Failed to add the comment",
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
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "Failed to delete the task",
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

    createTaskMutation.mutate(taskData);
  };

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'updated') => {
    if (!currentUser) return;
    updateTaskStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleTaskCommentUpdate = (taskId: number, comment: string) => {
    if (!currentUser) return;
    addTaskCommentMutation.mutate({ taskId, comment });
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  // Determine user role and permissions
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const canCreateTasks = isSuperAdmin || isAdmin;

  return {
    currentUser,
    tasks,
    zones,
    isLoadingTasks,
    isLoadingZones,
    tasksError,
    zonesError,
    handleTaskCreate,
    handleTaskStatusUpdate,
    handleTaskCommentUpdate,
    handleDeleteTask,
    isSuperAdmin,
    isAdmin,
    canCreateTasks
  };
};
