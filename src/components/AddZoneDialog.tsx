
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-panel">
        <DialogHeader>
          <DialogTitle>Add New Zone</DialogTitle>
          <DialogDescription>
            Create a new zone to add to your checklist.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Zone Name</Label>
              <Input
                id="name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Enter zone name"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Zone</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
