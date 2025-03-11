
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Task, Zone } from '@/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface TaskManagementProps {
  zones: Zone[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ zones, onTaskCreate }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { toast } = useToast();

  const handleSelectedZonesChange = (value: string) => {
    if (value === 'all') {
      // Select all zones
      setSelectedZones(zones.map(zone => zone.concernId));
    } else {
      // Handle multi-select by toggling the selected zone
      const updatedZones = selectedZones.includes(value)
        ? selectedZones.filter(z => z !== value)
        : [...selectedZones, value];
      setSelectedZones(updatedZones);
    }
  };

  const handleCreateTask = () => {
    if (!taskTitle || !taskDescription || selectedZones.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      createdBy: 1, // This should be the actual admin ID
      status: 'pending' as const,
      assignedZones: selectedZones,
      dueDate: dueDate || undefined,
    };

    onTaskCreate(newTask);
    setIsAddingTask(false);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedZones([]);
    setDueDate('');
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

  return (
    <div className="mb-6">
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogTrigger asChild>
          <Button className="transition-all hover:scale-105">
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Task Title</label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Excel Sheet Update Required"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
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
              <label>Assign to Zones</label>
              <div className="border rounded-md p-2">
                <div className="mb-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => handleSelectedZonesChange('all')}
                  >
                    {selectedZones.length === zones.length ? "Deselect All" : "Select All Zones"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
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
          <Button onClick={handleCreateTask}>Create Task</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
