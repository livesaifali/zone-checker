
import React, { useState, useEffect } from 'react';
import ZoneCard from '@/components/ZoneCard';
import ChecklistHeader from '@/components/ChecklistHeader';
import { AddZoneDialog } from '@/components/AddZoneDialog';
import EmptyState from '@/components/EmptyState';
import ZoneStats from '@/components/ZoneStats';
import { useToast } from '@/hooks/use-toast';

interface Zone {
  id: number;
  name: string;
  status: 'pending' | 'uploaded' | null;
  comment: string;
}

const Index = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const { toast } = useToast();

  // Example initial data - can be removed when connecting to backend
  useEffect(() => {
    const initialZones: Zone[] = [
      { id: 1, name: 'Main Entrance', status: null, comment: '' },
      { id: 2, name: 'Reception Area', status: 'pending', comment: 'Need to verify dimensions' },
      { id: 3, name: 'Conference Room', status: 'uploaded', comment: 'All materials uploaded' },
      { id: 4, name: 'Staff Office', status: null, comment: '' },
      { id: 5, name: 'Storage Area', status: 'pending', comment: 'Waiting for inventory list' },
    ];
    setZones(initialZones);
    setFilteredZones(initialZones);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = zones.filter(zone => 
        zone.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredZones(filtered);
    } else {
      setFilteredZones(zones);
    }
  }, [searchTerm, zones]);

  const handleAddZone = (name: string) => {
    const newZone: Zone = {
      id: zones.length ? Math.max(...zones.map(z => z.id)) + 1 : 1,
      name,
      status: null,
      comment: '',
    };
    
    setZones([...zones, newZone]);
    
    toast({
      title: "Zone added",
      description: `${name} has been added to your checklist`,
    });
  };

  const handleToggleActive = (id: number) => {
    setActiveZoneId(activeZoneId === id ? null : id);
  };

  const handleStatusChange = (id: number, status: string) => {
    setZones(
      zones.map(zone => 
        zone.id === id 
          ? { ...zone, status: status as 'pending' | 'uploaded' } 
          : zone
      )
    );
  };

  const handleCommentChange = (id: number, comment: string) => {
    setZones(
      zones.map(zone => 
        zone.id === id ? { ...zone, comment } : zone
      )
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Calculate stats
  const totalZones = zones.length;
  const pendingZones = zones.filter(zone => zone.status === 'pending').length;
  const uploadedZones = zones.filter(zone => zone.status === 'uploaded').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ChecklistHeader 
          onAddZone={() => setIsAddingZone(true)} 
          onSearch={handleSearch}
        />
        
        {zones.length > 0 && (
          <ZoneStats 
            totalZones={totalZones}
            pendingZones={pendingZones}
            uploadedZones={uploadedZones}
          />
        )}
        
        {zones.length === 0 ? (
          <EmptyState onAddZone={() => setIsAddingZone(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map(zone => (
              <ZoneCard
                key={zone.id}
                id={zone.id}
                name={zone.name}
                isActive={zone.id === activeZoneId}
                onToggle={handleToggleActive}
                onStatusChange={handleStatusChange}
                onCommentChange={handleCommentChange}
              />
            ))}
          </div>
        )}
        
        {filteredZones.length === 0 && zones.length > 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search term
            </p>
          </div>
        )}
      </div>
      
      <AddZoneDialog
        isOpen={isAddingZone}
        onClose={() => setIsAddingZone(false)}
        onAdd={handleAddZone}
      />
    </div>
  );
};

export default Index;
