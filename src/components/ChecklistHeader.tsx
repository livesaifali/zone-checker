
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';

interface ChecklistHeaderProps {
  onAddZone: () => void;
  onSearch: (searchTerm: string) => void;
  isAdmin?: boolean;
}

const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({ onAddZone, onSearch, isAdmin = false }) => {
  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cities Checklist</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track the status of all your cities
          </p>
        </div>
        {isAdmin && (
          <Button 
            onClick={onAddZone}
            className="transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add City
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search cities..." 
          className="pl-9 backdrop-blur-sm bg-white/80"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ChecklistHeader;
