
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TasksErrorStateProps {
  errorMessage?: string;
  onRetry?: () => void;
}

const TasksErrorState: React.FC<TasksErrorStateProps> = ({ 
  errorMessage = "There was an error loading the tasks. Please try again later.",
  onRetry
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Connection Error</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
      
      {onRetry && (
        <Button 
          onClick={onRetry} 
          className="mt-4"
          variant="outline"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default TasksErrorState;
