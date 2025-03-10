
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Calendar } from 'lucide-react';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  userConcernId?: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, userConcernId }) => {
  const filteredTasks = userConcernId
    ? tasks.filter(task => task.assignedZones.includes(userConcernId))
    : tasks;

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks available
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filteredTasks.map((task) => (
        <Card key={task.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                <FileSpreadsheet className="h-5 w-5 inline-block mr-2" />
                {task.title}
              </CardTitle>
              <Badge
                variant={task.status === 'completed' ? 'default' : 'outline'}
                className={task.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}
              >
                {task.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{task.description}</p>
            {task.dueDate && (
              <div className="mt-4 text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
