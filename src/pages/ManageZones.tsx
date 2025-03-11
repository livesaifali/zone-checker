
import React, { useState, useEffect } from 'react';
import ZoneCard from '@/components/ZoneCard';
import ChecklistHeader from '@/components/ChecklistHeader';
import { AddZoneDialog } from '@/components/AddZoneDialog';
import EmptyState from '@/components/EmptyState';
import ZoneStats from '@/components/ZoneStats';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/hooks/use-toast';
import type { Zone, User } from '@/types';

const ManageZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  // Example initial data - can be replaced with actual API calls
  useEffect(() => {
    const initialZones: Zone[] = [
      { id: 1, name: 'Karachi', status: null, comment: '', concernId: 'KHI001' },
      { id: 2, name: 'Lahore', status: 'pending', comment: 'Need to verify dimensions', concernId: 'LHR001', updatedBy: 'user123', lastUpdated: '2023-08-15' },
      { id: 3, name: 'Islamabad', status: 'uploaded', comment: 'All materials uploaded', concernId: 'ISB001', updatedBy: 'admin', lastUpdated: '2023-08-10' },
      { id: 4, name: 'Hyderabad', status: null, comment: '', concernId: 'HYD001' },
      { id: 5, name: 'Sukkur', status: 'pending', comment: 'Waiting for inventory list', concernId: 'SUK001', updatedBy: 'user456', lastUpdated: '2023-08-05' },
      { id: 6, name: 'Larkana', status: null, comment: '', concernId: 'LRK001' },
      { id: 7, name: 'Rawalpindi', status: null, comment: '', concernId: 'RWP001' },
      { id: 8, name: 'Head Office', status: 'uploaded', comment: 'Completed', concernId: 'HQ001', updatedBy: 'admin', lastUpdated: '2023-08-01' },
    ];
    setZones(initialZones);
    setFilteredZones(initialZones);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let filtered = zones;
    
    // Filter by search term if provided
    if (searchTerm) {
      filtered = filtered.filter(zone => 
        zone.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // If user is not admin, only show their assigned city
    if (currentUser.role === 'user') {
      filtered = filtered.filter(zone => 
        zone.concernId === currentUser.concernId || zone.status === 'pending'
      );
    }
    
    setFilteredZones(filtered);
  }, [searchTerm, zones, currentUser]);

  const handleAddZone = (name: string) => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
      toast({
        title: "Permission denied",
        description: "Only administrators can add new zones",
        variant: "destructive",
      });
      return;
    }

    const concernId = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const newZone: Zone = {
      id: zones.length ? Math.max(...zones.map(z => z.id)) + 1 : 1,
      name,
      status: null,
      comment: '',
      concernId,
    };
    
    setZones([...zones, newZone]);
    
    toast({
      title: "Zone added",
      description: `${name} has been added with ID: ${concernId}`,
    });
  };

  const handleToggleActive = (id: number) => {
    setActiveZoneId(activeZoneId === id ? null : id);
  };

  const handleStatusChange = (id: number, status: string) => {
    if (!currentUser) return;
    
    const zone = zones.find(z => z.id === id);
    
    // Only allow users to update their own city unless they're admin
    if (currentUser.role === 'user' && zone?.concernId !== currentUser.concernId) {
      toast({
        title: "Permission denied",
        description: "You can only update your assigned zone",
        variant: "destructive",
      });
      return;
    }
    
    setZones(
      zones.map(zone => 
        zone.id === id 
          ? { 
              ...zone, 
              status: status as 'pending' | 'uploaded',
              updatedBy: currentUser.username,
              lastUpdated: new Date().toISOString().split('T')[0]
            } 
          : zone
      )
    );
    
    toast({
      title: "Status updated",
      description: `Status updated to ${status}`,
    });
  };

  const handleCommentChange = (id: number, comment: string) => {
    if (!currentUser) return;
    
    const zone = zones.find(z => z.id === id);
    
    // Only allow users to update their own city unless they're admin
    if (currentUser.role === 'user' && zone?.concernId !== currentUser.concernId) {
      toast({
        title: "Permission denied",
        description: "You can only update your assigned zone",
        variant: "destructive",
      });
      return;
    }
    
    setZones(
      zones.map(zone => 
        zone.id === id ? { 
          ...zone, 
          comment,
          updatedBy: currentUser.username,
          lastUpdated: new Date().toISOString().split('T')[0]
        } : zone
      )
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Calculate stats
  const totalZones = filteredZones.length;
  const pendingZones = filteredZones.filter(zone => zone.status === 'pending').length;
  const uploadedZones = filteredZones.filter(zone => zone.status === 'uploaded').length;

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <ChecklistHeader 
          onAddZone={() => setIsAddingZone(true)} 
          onSearch={handleSearch}
          isAdmin={isAdmin}
        />
        
        {filteredZones.length > 0 && (
          <ZoneStats 
            totalZones={totalZones}
            pendingZones={pendingZones}
            uploadedZones={uploadedZones}
          />
        )}
        
        {filteredZones.length === 0 && (
          <EmptyState onAddZone={() => setIsAddingZone(true)} isAdmin={isAdmin} />
        )}
        
        {filteredZones.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map(zone => (
              <ZoneCard
                key={zone.id}
                id={zone.id}
                name={zone.name}
                concernId={zone.concernId}
                isActive={zone.id === activeZoneId}
                status={zone.status}
                comment={zone.comment}
                updatedBy={zone.updatedBy}
                lastUpdated={zone.lastUpdated}
                isEditable={isAdmin || zone.concernId === currentUser?.concernId}
                onToggle={handleToggleActive}
                onStatusChange={handleStatusChange}
                onCommentChange={handleCommentChange}
              />
            ))}
          </div>
        )}
        
        {filteredZones.length === 0 && zones.length > 0 && searchTerm && (
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

export default ManageZones;
