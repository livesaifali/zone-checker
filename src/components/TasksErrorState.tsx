
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TasksErrorStateProps {
  errorMessage?: string;
  errorDetail?: string;
  onRetry?: () => void;
}

const TasksErrorState: React.FC<TasksErrorStateProps> = ({ 
  errorMessage = "There was an error loading the tasks.",
  errorDetail,
  onRetry
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Connection Error</AlertTitle>
        <AlertDescription>
          {errorMessage}
          
          {errorDetail && (
            <div className="mt-2 text-sm opacity-90">
              Error details: {errorDetail}
            </div>
          )}
          
          <div className="mt-2">
            Make sure that:
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>The backend server is running on port 3000</li>
              <li>Your MySQL database is running and accessible</li>
              <li>The database credentials in backend/.env are correct</li>
            </ul>
          </div>
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
