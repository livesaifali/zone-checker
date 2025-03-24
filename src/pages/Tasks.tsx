
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import TaskList from '@/components/TaskList';
import TaskManagement from '@/components/TaskManagement';
import TasksHeader from '@/components/TasksHeader';
import EmptyState from '@/components/EmptyState';
import TasksLoadingState from '@/components/TasksLoadingState';
import TasksErrorState from '@/components/TasksErrorState';
import { useTasks } from '@/hooks/useTasks';

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
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
    isSuperAdmin,
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
    
    // Return tasks that match search term
    return matchesSearch;
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Show loading state
  if (isLoadingTasks || isLoadingZones) {
    return <TasksLoadingState />;
  }

  // Show error state
  if (isError) {
    return <TasksErrorState errorDetail={errorDetail} onRetry={retryQueries} />;
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-6xl">
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
          onChange={(e) => handleSearch(e.target.value)}
        />
        {canCreateTasks && (
          <Button 
            className="absolute right-1 top-1 transition-all duration-300 hover:scale-105 md:hidden"
            size="sm"
            onClick={() => setIsTaskDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {filteredTasks.length === 0 && (
        <EmptyState 
          onAddZone={() => setIsTaskDialogOpen(true)} 
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
      
      {/* Task Management Dialog outside the TasksHeader for mobile button */}
      <TaskManagement 
        zones={zones} 
        onTaskCreate={handleTaskCreate}
        isOpen={isTaskDialogOpen}
        setIsOpen={setIsTaskDialogOpen}
      />
    </div>
  );
};

export default Tasks;
