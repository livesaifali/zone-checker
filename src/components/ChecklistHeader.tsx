
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, RefreshCw } from 'lucide-react';

interface ChecklistHeaderProps {
  onAddZone: () => void;
  onSearch: (searchTerm: string) => void;
  onRefresh?: () => void;
  isAdmin?: boolean;
  title?: string;
  description?: string;
}

const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({ 
  onAddZone, 
  onSearch, 
  onRefresh,
  isAdmin = false,
  title = "Zones Management",
  description = "Manage and track the status of all your zones"
}) => {
  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {isAdmin && (
            <Button 
              onClick={onAddZone}
              className="transition-all duration-300 hover:scale-105"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add {title.includes("Zone") ? "Zone" : "Task"}
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder={`Search ${title.includes("Zone") ? "zones" : "tasks"}...`} 
          className="pl-9 backdrop-blur-sm bg-white/80"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ChecklistHeader;
