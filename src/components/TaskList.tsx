import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileSpreadsheet, 
  Calendar, 
  Check, 
  Clock, 
  MessageSquare, 
  RefreshCw,
  CheckCheck,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  userConcernId?: string;
  isUser?: boolean;
  onStatusUpdate?: (taskId: number, status: 'pending' | 'updated' | 'completed') => void;
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
  
  const filteredTasks = userConcernId && isUser
    ? tasks.filter(task => task.assignedZones.includes(userConcernId))
    : tasks;

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks available
      </div>
    );
  }

  const handleStatusChange = (taskId: number, status: 'pending' | 'updated' | 'completed') => {
    if (!onStatusUpdate) return;
    onStatusUpdate(taskId, status);
  };

  const handleCommentSubmit = (taskId: number) => {
    if (!onCommentUpdate || !commentInputs[taskId]) return;
    onCommentUpdate(taskId, commentInputs[taskId]);
    setCommentInputs({...commentInputs, [taskId]: ''});
    setIsCommenting({...isCommenting, [taskId]: false});
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'updated':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCheck className="h-4 w-4 mr-1" />;
      case 'updated':
        return <RefreshCw className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
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
                variant="outline"
                className={getStatusBadgeColor(task.status)}
              >
                {getStatusIcon(task.status)}
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
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
            {task.assignedZones && task.assignedZones.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Assigned to: {task.assignedZones.length} zone(s)
              </div>
            )}
            
            {task.comments && task.comments.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Comments:</h4>
                <div className="space-y-2">
                  {task.comments.map(comment => (
                    <div key={comment.id} className="text-sm bg-muted p-2 rounded">
                      <div className="font-medium">{comment.userName}</div>
                      <div>{comment.comment}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          {isUser && (
            <CardFooter className="flex flex-col gap-2 border-t pt-3">
              <div className="flex justify-between w-full">
                <Select
                  value={task.status}
                  onValueChange={(value: 'pending' | 'updated' | 'completed') => 
                    handleStatusChange(task.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="updated">
                      <div className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Updated
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center">
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCommenting({...isCommenting, [task.id]: !isCommenting[task.id]})}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {isCommenting[task.id] ? 'Cancel' : 'Add Comment'}
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
