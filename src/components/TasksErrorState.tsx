
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface TasksErrorStateProps {
  errorDetail: string | null;
  onRetry: () => void;
}

const TasksErrorState: React.FC<TasksErrorStateProps> = ({ errorDetail, onRetry }) => {
  console.log("Rendering error state with detail:", errorDetail);
  
  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
        <div className="flex justify-center mb-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-destructive mb-2">Connection Error</h3>
        <p className="text-muted-foreground mb-4">
          {errorDetail || "Could not connect to the database. Please check your connection and try again."}
        </p>
        <Button onClick={onRetry}>Retry Connection</Button>
      </div>
    </div>
  );
};

export default TasksErrorState;
