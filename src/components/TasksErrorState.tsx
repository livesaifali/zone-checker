
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
      <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-xl font-medium text-destructive mb-3">Connection Error</h3>
        <p className="text-muted-foreground mb-6">
          {errorDetail || "Could not connect to the database. Please check your connection and try again."}
        </p>
        <Button 
          onClick={onRetry}
          className="px-6 py-2"
          size="lg"
        >
          Retry Connection
        </Button>
      </div>
    </div>
  );
};

export default TasksErrorState;
