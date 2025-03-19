
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TasksLoadingState from '@/components/TasksLoadingState';
import TasksErrorState from '@/components/TasksErrorState';
import TasksHeader from '@/components/TasksHeader';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Tasks = () => {
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

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No tasks available</h3>
          <p className="text-muted-foreground mt-1">
            {canCreateTasks 
              ? "Start by creating a new task" 
              : "No tasks have been assigned to your zone yet"}
          </p>
        </div>
      ) : (
        <TaskList 
          tasks={tasks} 
          userConcernId={currentUser?.concernId}
          onStatusUpdate={handleTaskStatusUpdate}
          onCommentUpdate={handleTaskCommentUpdate} 
          onDeleteTask={canCreateTasks ? handleDeleteTask : undefined}
          isUser={!canCreateTasks}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default Tasks;
