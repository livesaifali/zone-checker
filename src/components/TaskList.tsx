
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileSpreadsheet, Calendar, Check, Clock, MessageSquare } from 'lucide-react';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  userConcernId?: string;
  isUser?: boolean;
  onStatusUpdate?: (taskId: number, status: 'pending' | 'completed') => void;
  onCommentUpdate?: (taskId: number, comment: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  userConcernId, 
  isUser = false,
  onStatusUpdate,
  onCommentUpdate
}) => {
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [isCommenting, setIsCommenting] = useState<{[key: number]: boolean}>({});
  
  // Filter tasks based on user's zone if they are a regular user
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

  const handleStatusToggle = (taskId: number, currentStatus: 'pending' | 'completed') => {
    if (!onStatusUpdate || !isUser) return;
    onStatusUpdate(taskId, currentStatus === 'pending' ? 'completed' : 'pending');
  };

  const handleCommentSubmit = (taskId: number) => {
    if (!onCommentUpdate) return;
    onCommentUpdate(taskId, commentInputs[taskId] || '');
    setIsCommenting({...isCommenting, [taskId]: false});
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filteredTasks.map((task) => (
        <Card key={task.id} className="transition-all hover:shadow-md">
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
                {task.status === 'completed' ? 'Completed' : 'Pending'}
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
          {isUser && (
            <CardFooter className="flex flex-col gap-2 border-t pt-3">
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 mr-2"
                  onClick={() => handleStatusToggle(task.id, task.status)}
                >
                  {task.status === 'completed' ? (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Mark as Pending
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Completed
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsCommenting({...isCommenting, [task.id]: !isCommenting[task.id]})}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {isCommenting[task.id] ? 'Cancel Comment' : 'Add Comment'}
                </Button>
              </div>
              
              {isCommenting[task.id] && (
                <div className="mt-2 w-full">
                  <Textarea 
                    placeholder="Enter your comment..."
                    className="mb-2"
                    value={commentInputs[task.id] || ''}
                    onChange={(e) => setCommentInputs({...commentInputs, [task.id]: e.target.value})}
                  />
                  <Button size="sm" onClick={() => handleCommentSubmit(task.id)}>
                    Save Comment
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
