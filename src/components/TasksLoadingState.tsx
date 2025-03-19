
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const TasksLoadingState: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Connecting to database...</p>
        </div>
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
