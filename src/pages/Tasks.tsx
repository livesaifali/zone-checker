
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TasksLoadingState from '@/components/TasksLoadingState';
import TasksErrorState from '@/components/TasksErrorState';
import TasksHeader from '@/components/TasksHeader';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    currentUser,
    tasks,
    zones,
    isLoadingTasks,
    isLoadingZones,
    isError,
    errorDetail,
    retryQueries,
    handleTaskCreate,
    handleTaskStatusUpdate,
    handleTaskCommentUpdate,
    handleDeleteTask,
    isAdmin,
    canCreateTasks
  } = useTasks();

  // Filter tasks based on search term and user role/concern
  const filteredTasks = tasks.filter(task => {
    // First filter by search term
    const matchesSearch = searchTerm ? 
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       task.description.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
    
    // Then filter by user's concern if they're a regular user
    if (currentUser?.role === 'user' && currentUser?.concernId) {
      return matchesSearch && task.assignedZones.includes(currentUser.concernId);
    }
    
    // Admins and superadmins can see all tasks
    return matchesSearch;
  });

  // Show loading state
  if (isLoadingTasks || isLoadingZones) {
    return <TasksLoadingState />;
  }

  // Show error state
  if (isError) {
    return (
      <TasksErrorState 
        errorMessage={errorDetail || "Could not connect to the database. Please check your connection and try again."} 
        onRetry={retryQueries}
      />
    );
  }

  // Check if the user has appropriate access
  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            You are not authenticated. Please log in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <TasksHeader 
        canCreateTasks={canCreateTasks} 
        zones={zones} 
        onTaskCreate={handleTaskCreate} 
      />

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search tasks..." 
          className="pl-9 backdrop-blur-sm bg-white/80"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No tasks available</h3>
          <p className="text-muted-foreground mt-1">
            {currentUser.role === 'user' 
              ? "No tasks have been assigned to your zone yet" 
              : canCreateTasks 
                ? "Start by creating a new task" 
                : "No tasks found"}
          </p>
        </div>
      ) : (
        <TaskList 
          tasks={filteredTasks} 
          userConcernId={currentUser?.concernId}
          onStatusUpdate={handleTaskStatusUpdate}
          onCommentUpdate={handleTaskCommentUpdate} 
          onDeleteTask={canCreateTasks ? handleDeleteTask : undefined}
          isUser={currentUser.role === 'user'}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default Tasks;
