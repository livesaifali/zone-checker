
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, DatabaseIcon, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TasksErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

const TasksErrorState: React.FC<TasksErrorStateProps> = ({ errorMessage, onRetry }) => {
  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <DatabaseIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Database Connection Error</h2>
          <p className="text-muted-foreground">
            Unable to fetch data from the server
          </p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button 
            onClick={onRetry} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          
          <div className="bg-muted p-4 rounded-md text-sm">
            <p className="font-medium mb-2">Troubleshooting steps:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Check if the database server is running</li>
              <li>Verify that your backend server is running</li>
              <li>Confirm network connectivity to the server</li>
              <li>Ensure database credentials are correct</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksErrorState;
