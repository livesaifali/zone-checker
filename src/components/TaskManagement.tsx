
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Plus, Calendar } from 'lucide-react';
import type { Task, Zone } from '@/types';

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

    toast({
      title: "Task created",
      description: "The task has been assigned to selected zones",
    });
  };

  return (
    <div className="mb-6">
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogTrigger asChild>
          <Button>
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
              <Select
                value={selectedZones.join(',')}
                onValueChange={(value) => setSelectedZones(value.split(','))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zones" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.concernId}>
                      {zone.name} ({zone.concernId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreateTask}>Create Task</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
