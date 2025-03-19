
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TasksLoadingState from '@/components/TasksLoadingState';
import TasksErrorState from '@/components/TasksErrorState';
import TasksHeader from '@/components/TasksHeader';

const Tasks = () => {
  const {
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
    isAdmin,
    canCreateTasks
  } = useTasks();

  // Show loading state
  if (isLoadingTasks || isLoadingZones) {
    return <TasksLoadingState />;
  }

  // Show error state
  if (tasksError || zonesError) {
    return <TasksErrorState />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <TasksHeader 
        canCreateTasks={canCreateTasks} 
        zones={zones} 
        onTaskCreate={handleTaskCreate} 
      />

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
