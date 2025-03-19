
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

const TasksErrorState: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading the tasks. Please try again later.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TasksErrorState;
