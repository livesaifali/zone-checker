
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, DatabaseIcon, RefreshCw, Info, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TasksErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

const TasksErrorState: React.FC<TasksErrorStateProps> = ({ errorMessage, onRetry }) => {
  const [showDetailedHelp, setShowDetailedHelp] = useState(false);
  
  // Extract if it's a database error or another type of error
  const isDatabaseError = errorMessage.toLowerCase().includes('database') || 
                          errorMessage.toLowerCase().includes('sql') ||
                          errorMessage.toLowerCase().includes('connection');
  
  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {isDatabaseError ? (
            <DatabaseIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
          ) : (
            <Server className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          )}
          
          <h2 className="text-2xl font-bold mb-2">
            {isDatabaseError ? "Database Connection Error" : "Server Communication Error"}
          </h2>
          <p className="text-muted-foreground">
            {isDatabaseError 
              ? "Unable to fetch data from the database server" 
              : "Unable to communicate with the application server"}
          </p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isDatabaseError ? "Connection Failed" : "Request Failed"}</AlertTitle>
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
          
          <Button
            onClick={() => setShowDetailedHelp(!showDetailedHelp)}
            className="w-full"
            variant="outline"
          >
            <Info className="mr-2 h-4 w-4" />
            {showDetailedHelp ? "Hide Troubleshooting Steps" : "Show Troubleshooting Steps"}
          </Button>
          
          {showDetailedHelp && (
            <div className="bg-muted p-4 rounded-md text-sm mt-4">
              <p className="font-medium mb-2">Troubleshooting steps:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {isDatabaseError ? (
                  <>
                    <li>Check if the MySQL database server is running on the specified host and port</li>
                    <li>Verify that the database exists and is accessible</li>
                    <li>Confirm that the database user has proper permissions</li>
                    <li>Ensure database credentials in .env file are correct</li>
                    <li>Check network connectivity between the application and database servers</li>
                    <li>Look for database error logs for more specific information</li>
                  </>
                ) : (
                  <>
                    <li>Check if the backend server is running on the correct port</li>
                    <li>Verify that the API endpoint is correct</li>
                    <li>Check for CORS issues if running frontend and backend separately</li>
                    <li>Inspect network requests in browser developer tools</li>
                    <li>Check server logs for more detailed error information</li>
                  </>
                )}
              </ul>
              
              <div className="mt-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If you're an administrator, you can run the database check utility in the 
                  backend folder:
                </p>
                <code className="block bg-slate-200 dark:bg-slate-900 p-2 mt-2 rounded text-xs overflow-auto">
                  node dbCheck.js
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksErrorState;
