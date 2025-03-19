
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const TasksLoadingState: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Connecting to database and loading tasks...</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <div className="h-2 w-full max-w-md bg-gray-200 rounded overflow-hidden">
          <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }}></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Connecting to database... This may take a moment.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export default TasksLoadingState;
