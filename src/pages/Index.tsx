
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
import { useTasks } from '@/hooks/useTasks';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
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

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => 
    searchTerm ? 
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       task.description.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Show loading state
  if (isLoadingTasks || isLoadingZones) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Connection Error</h3>
          <p className="text-muted-foreground mb-4">
            {errorDetail || "Could not connect to the database. Please check your connection and try again."}
          </p>
          <Button onClick={retryQueries}>Retry Connection</Button>
        </div>
      </div>
    );
  }

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
