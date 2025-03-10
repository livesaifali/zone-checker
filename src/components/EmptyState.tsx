
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddZone: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddZone }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border-2 border-dashed border-muted animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <FolderPlus className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No zones added yet</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Get started by adding your first zone to the checklist.
      </p>
      <Button onClick={onAddZone} className="animate-float">
        <FolderPlus className="mr-2 h-4 w-4" />
        Add Your First Zone
      </Button>
    </div>
  );
};

export default EmptyState;
