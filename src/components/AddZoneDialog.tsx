
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddZoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (zoneName: string) => void;
}

export function AddZoneDialog({ isOpen, onClose, onAdd }: AddZoneDialogProps) {
  const [zoneName, setZoneName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneName.trim()) {
      onAdd(zoneName.trim());
      setZoneName('');
      onClose();
    }
  };

  // Predefined cities for easy selection
  const suggestedCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Hyderabad', 
    'Sukkur', 'Larkana', 'Rawalpindi', 'Head Office',
    'Peshawar', 'Quetta', 'Multan', 'Faisalabad'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-panel">
        <DialogHeader>
          <DialogTitle>Add New City</DialogTitle>
          <DialogDescription>
            Create a new city to add to your checklist. A unique ID will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">City Name</Label>
              <Input
                id="name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Enter city name"
                className="col-span-3"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Suggested Cities</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedCities.map(city => (
                  <Button 
                    key={city}
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoneName(city)}
                    className={zoneName === city ? "bg-primary/10 border-primary" : ""}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!zoneName.trim()}>Add City</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
