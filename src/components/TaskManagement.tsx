
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertCircle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task, Zone, User } from '@/types';

interface TaskManagementProps {
  zones: Zone[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ 
  zones, 
  onTaskCreate, 
  isOpen, 
  setIsOpen 
}) => {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const validateForm = () => {
    if (!taskTitle.trim()) {
      setFormError("Task title is required");
      return false;
    }
    if (!taskDescription.trim()) {
      setFormError("Task description is required");
      return false;
    }
    if (selectedZones.length === 0) {
      setFormError("You must select at least one zone");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSelectedZonesChange = (zoneId: string) => {
    if (zoneId === 'all') {
      // Select all zones
      if (selectedZones.length === zones.length) {
        setSelectedZones([]);
      } else {
        setSelectedZones(zones.map(zone => zone.concernId));
      }
    } else {
      // Handle multi-select by toggling the selected zone
      const updatedZones = selectedZones.includes(zoneId)
        ? selectedZones.filter(z => z !== zoneId)
        : [...selectedZones, zoneId];
      setSelectedZones(updatedZones);
    }
    setFormError(null); // Clear any errors when selection changes
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setSelectedZones([]);
    setDueDate('');
    setFormError(null);
  };

  const handleCreateTask = () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      toast({
        title: "Permission denied",
        description: "Only admins can create tasks",
        variant: "destructive",
      });
      return;
    }

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      status: 'pending' as const,
      assignedZones: selectedZones,
      dueDate: dueDate || undefined,
      createdBy: currentUser.id,
      createdByUsername: currentUser.username
    };

    onTaskCreate(newTask);
    setIsOpen(false);
    resetForm();

    toast({
      title: "Task created",
      description: `Task has been assigned to ${selectedZones.length} zone(s)`,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Generate the selected zones display text
  const getSelectedZonesText = () => {
    if (selectedZones.length === 0) return "Select zones";
    if (selectedZones.length === zones.length) return "All zones";
    if (selectedZones.length <= 2) {
      return selectedZones.map(id => {
        const zone = zones.find(z => z.concernId === id);
        return zone ? zone.name : id;
      }).join(', ');
    }
    return `${selectedZones.length} zones selected`;
  };

  // Check if user has permission to create tasks
  const canCreateTasks = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // For empty state when no zones are available
  if (zones.length === 0 && canCreateTasks) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No zones available. Please add zones first to create tasks.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-panel">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <label htmlFor="title">Task Title <span className="text-destructive">*</span></label>
            <Input
              id="title"
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
                if (formError && e.target.value.trim()) setFormError(null);
              }}
              placeholder="Excel Sheet Update Required"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description">Description <span className="text-destructive">*</span></label>
            <Textarea
              id="description"
              value={taskDescription}
              onChange={(e) => {
                setTaskDescription(e.target.value);
                if (formError && e.target.value.trim()) setFormError(null);
              }}
              placeholder="Please update the daily status excel sheet..."
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="dueDate">Due Date (Optional)</label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <label>Assign to Zones <span className="text-destructive">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Select one or more zones to assign this task to. Only users from these zones will see the task.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="border rounded-md p-2">
              <div className="mb-2">
                <Button 
                  variant={selectedZones.length === zones.length ? "default" : "outline"}
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => handleSelectedZonesChange('all')}
                >
                  {selectedZones.length === zones.length ? "Deselect All" : "Select All Zones"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {zones.map((zone) => (
                  <Button
                    key={zone.id}
                    variant={selectedZones.includes(zone.concernId) ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => handleSelectedZonesChange(zone.concernId)}
                  >
                    {zone.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {getSelectedZonesText()}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateTask}>Create Task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskManagement;
