
import { FolderPlus, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

interface EmptyStateProps {
  onAddZone: () => void;
  onRefresh?: () => void;
  isAdmin?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddZone, onRefresh, isAdmin = false }) => {
  const location = useLocation();
  const isTasksPage = location.pathname === '/' || location.pathname === '/tasks';
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border-2 border-dashed border-muted animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        {isTasksPage ? (
          <FileSpreadsheet className="h-10 w-10 text-primary" />
        ) : (
          <FolderPlus className="h-10 w-10 text-primary" />
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {isTasksPage ? "No tasks found" : "No zones found"}
      </h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {isAdmin 
          ? isTasksPage
            ? "Get started by creating your first task." 
            : "Get started by adding your first zone to the system."
          : isTasksPage
            ? "No tasks are assigned to you or match your search criteria."
            : "No zones are assigned to you or match your search criteria."}
      </p>
      <div className="flex gap-3">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} className="animate-float">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        )}
        {isAdmin && (
          <Button onClick={onAddZone} className="animate-float">
            {isTasksPage ? (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Create Your First Task
              </>
            ) : (
              <>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Your First Zone
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
